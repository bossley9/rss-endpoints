import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import { ENDPOINT_BASE_URL, GetUrlPathStub } from "../util/core";
import { Feed, FeedItem, GenerateFeed } from "../util/feed";

type Event = {
  path: string;
};

const SOURCE_BASE_URL = "https://soundcloud.com";

export const handler = async (event: Event) => {
  const { path } = event;
  let statusCode = 200;
  let body = "";

  const user = GetUrlPathStub(path, "soundcloud");
  if (!user) {
    return {
      statusCode,
      body: "USAGE: /{user} -> user's rss track feed",
    };
  }

  const url = `${SOURCE_BASE_URL}/${user}/tracks`;

  const feed: Feed = {
    title: `${user}`,
    desc: `${user}'s soundcloud tracks`,
    source: url,
    endpoint: `${ENDPOINT_BASE_URL}${path}`,
    items: [],
  };

  let html = "";
  try {
    const res = await fetch(url, {});
    html = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  if (!html) {
    statusCode = 500;
    body = `ERROR: url returned an empty response`;
    return {
      statusCode,
      body,
    };
  }

  const { document } = new JSDOM(html).window;

  const section = document.querySelector("section");
  if (section) {
    const tracks = section.querySelectorAll("article");

    tracks.forEach((track: HTMLElement) => {
      const h2HTML = track.querySelector("h2");

      let date = "";
      let href = "";
      let title = "";

      if (h2HTML) {
        const aHTMLArr = h2HTML.querySelectorAll("a");

        if (aHTMLArr && aHTMLArr[0]) {
          title = aHTMLArr[0].innerHTML;
          href = `${SOURCE_BASE_URL}${aHTMLArr[0].href}`;
        }
      }

      const dateHTML = track.querySelector("time");
      if (dateHTML) date = dateHTML.innerHTML;

      const tags: string[] = [];

      const metaGenreHTMLArr = track.querySelectorAll("meta[itemprop=genre]");
      metaGenreHTMLArr.forEach((metaGenreHTML: Element) => {
        const genreContent = metaGenreHTML.attributes.getNamedItem("content");
        if (genreContent) tags.push(genreContent.value);
      });

      const item: FeedItem = {
        title,
        date,
        href,
        tags,
      };

      feed.items.push(item);
    });
  }

  body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
