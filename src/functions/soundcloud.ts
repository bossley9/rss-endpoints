// @ts-ignore
import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import { GetUrlPathStub } from "../util/core";

type Event = {
  path: string;
};

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

  try {
    const url = `https://soundcloud.com/${user}/tracks`;

    const res = await fetch(url, {});
    const raw = await res.text();

    const { document } = new JSDOM(raw).window;

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

        body += `{ href: ${href}, title: ${title}, date: ${date} }`;
      });
    }
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  return {
    statusCode,
    body,
  };
};
