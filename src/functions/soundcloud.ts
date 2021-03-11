// @ts-ignore
import fetch from "isomorphic-fetch";
import { GetUrlPathStub } from "../utilities/rss-utils";
// import { JSDOM } from "jsdom";

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

  // try {
  //   const url = `http://soundcloud.com/${user}`;
  //   const res = await fetch(url, {});
  //   const raw = await res.text();
  //   // const { document } = new JSDOM(``, {
  //   //   url,
  //   //   //   referrer: "https://example.com/",
  //   //   contentType: "text/html",
  //   //   //   includeNodeLocations: true,
  //   //   //   storageQuota: 10000000,
  //   // }).window;

  //   const { document } = new JSDOM(raw).window;

  //   const section = document.querySelector("section");

  //   if (section) {
  //     const tracks = section.querySelectorAll("article");

  //     tracks.forEach((track: HTMLElement) => {
  //       let title = "";
  //       let href = "";
  //       // body += track.innerHTML;
  //     });

  //   }

  // } catch (e) {
  //   statusCode = 500;
  //   body = `ERROR: ${e}`;
  // }

  let userid = "";

  try {
    const url = `http://soundcloud.com/${user}`;
    const res = await fetch(url, {});
    const raw = await res.text();

    const key: string = "api.soundcloud.com/users/";

    // trim start and end to get id
    userid = raw;
    // @ts-ignore
    userid = userid.substring(userid.indexOf(key) + key.length);
    // @ts-ignore
    userid = userid.substring(0, userid.indexOf('"'));
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  try {
    const url = `https://feeds.soundcloud.com/users/soundcloud:users:${userid}/sounds.rss`;
    const res = await fetch(url, {});
    body = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  return {
    statusCode,
    body,
  };
};
