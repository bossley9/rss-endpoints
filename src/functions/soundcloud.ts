// @ts-ignore
import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import { GetUrlPathStub } from "../util/core";
import { Feed, GenerateFeed } from "../util/feed";

type Event = {
  path: string;
};

export const handler = async (event: Event) => {
  const { path } = event;
  let statusCode = 200;
  let body = "";

  // user
  const user = GetUrlPathStub(path, "soundcloud");
  if (!user) {
    return {
      statusCode,
      body: "USAGE: /{user} -> user's rss track feed",
    };
  }

  // url
  const url = `https://soundcloud.com/${user}/tracks`;

  const feed: Feed = {
    title: `${user}`,
    desc: `${user}'s soundcloud tracks`,
    source: url,
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
          href = aHTMLArr[0].href;
        }
      }

      const dateHTML = track.querySelector("time");
      if (dateHTML) date = dateHTML.innerHTML;

      // TODO replace with feed items
      body += `{ href: ${href}, title: ${title}, date: ${date} }`;
    });
  }

  body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
