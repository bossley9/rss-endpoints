import fetch from "isomorphic-fetch";
import { Handler } from "../util/core";

export const handler: Handler = async () => {
  let statusCode = 200;
  let body = "";
  const SOURCE_BASE_URL = "https://gettingitstrait.com";

  const feedUrl = `${SOURCE_BASE_URL}/feed`;

  let rss = "";
  try {
    const res = await fetch(feedUrl, {});
    rss = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  if (!rss) {
    return {
      statusCode,
      body: "ERROR: feed url returned an empty response",
    };
  }

  body = `${rss}`;

  return {
    statusCode,
    body,
  };
};
