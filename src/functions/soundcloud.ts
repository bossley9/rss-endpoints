import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import {
  Event,
  Handler,
  ENDPOINT_BASE_URL,
  GetUrlPathStub,
} from "../util/core";
import { Feed, FeedItem, GenerateFeed } from "../util/feed";

type SCTrack = {
  artwork_url: string;
  created_at: string;
  description: string;
  genre: string;
  permalink_url: string;
  tag_list: string;
  title: string;
  user: {
    username: string;
  };
};

type SCResponse = {
  collection: SCTrack[];
};

const SOURCE_BASE_URL = "https://soundcloud.com";

export const handler: Handler = async (event: Event) => {
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
    return {
      statusCode: 500,
      body: "ERROR: url returned an empty response",
    };
  }

  const { document } = new JSDOM(html).window;

  // get user id

  let userId = "";
  const userIdMeta = document.querySelector("meta[property='al:ios:url']");
  if (userIdMeta) {
    const content = userIdMeta.attributes.getNamedItem("content");
    if (content) {
      const rawUserId = content.value;
      // format is soundcloud://users:USER_ID
      userId = rawUserId.substring(rawUserId.lastIndexOf(":") + 1);
    }
  }

  if (!userId) {
    return {
      statusCode: 500,
      body: "ERROR: user id retrieval is not valid",
    };
  }

  // get client id source

  let clientSource = "";
  const scripts = document.querySelectorAll("script[crossorigin]");
  // reliant on the fact that the last crossorigin script contains the client id
  const clientIdScript = scripts[scripts.length - 1];
  const clientIdSrc = clientIdScript.attributes.getNamedItem("src");
  if (clientIdSrc) clientSource = clientIdSrc.value;

  if (!clientSource) {
    return {
      statusCode: 500,
      body: "ERROR: client id retrieval is not valid",
    };
  }

  let clientjs = "";
  try {
    const res = await fetch(clientSource, {});
    clientjs = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  if (!clientjs) {
    return {
      statusCode: 500,
      body: "ERROR: client id source url returned an empty response",
    };
  }

  // get client id

  let clientId = "";
  const clientIdKey: string = "client_id";
  const clientIdKeyIndex = clientjs.indexOf(clientIdKey);
  let clientIdRaw = clientjs.substring(clientIdKeyIndex + clientIdKey.length);

  const quote: string = '"';
  clientIdRaw = clientIdRaw.substring(clientIdRaw.indexOf(quote) + 1);
  clientIdRaw = clientIdRaw.substring(0, clientIdRaw.indexOf(quote));
  clientId = clientIdRaw;

  if (!clientId) {
    return {
      statusCode: 500,
      body: "ERROR: client id is invalid",
    };
  }

  // get api endpoint json data

  let dataRaw = "";
  const dataUrl = `https://api-v2.soundcloud.com/users/${userId}/tracks?representation=&offset=&limit=30&client_id=${clientId}`;
  try {
    const res = await fetch(dataUrl, {});
    dataRaw = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  if (!dataRaw) {
    return {
      statusCode: 500,
      body: "ERROR: api data url returned an empty response",
    };
  }

  const data: SCResponse = JSON.parse(dataRaw);

  // Tyepscript thinks for (x in ...) loops return string items
  // this manual for loop ensures type consistency
  for (let i = 0; i < data.collection.length; i++) {
    const track = data.collection[i];

    const desc = `<![CDATA[
      <h3>${track.title} by ${track.user.username}</h3>
      <img src="${track.artwork_url}" alt="${track.title}" />
      <p>Genre: ${track.genre}</p>
      <p>${track.description}</p>
    ]]>`;

    const item: FeedItem = {
      title: track.title,
      date: track.created_at,
      href: track.permalink_url,
      desc,
      tags: track.tag_list.replace(/"/g, "").split(" "),
    };

    feed.items.push(item);
  }

  body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
