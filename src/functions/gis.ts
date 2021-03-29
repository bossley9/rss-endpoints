import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import { Handler } from "../util/core";
import { Feed, FeedItem, GenerateFeed } from "../util/feed";

export const handler: Handler = async () => {
  let statusCode = 200;
  let body = "";
  const SOURCE_BASE_URL = "https://gettingitstrait.com";

  const feed: Feed = {
    title: `Getting It Strait`,
    desc: `A youth-run online zine publshing work on contemporary thought and current affairs`,
    source: SOURCE_BASE_URL,
    endpoint: SOURCE_BASE_URL,
    items: [],
  };

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

  const issueUrl = `${SOURCE_BASE_URL}/issues`;

  let issueHtml = "";
  try {
    const res = await fetch(issueUrl, {});
    issueHtml = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  const { document } = new JSDOM(issueHtml).window;

  let issueHtmlArr = document.querySelectorAll(".entry-content figure");

  issueHtmlArr.forEach((issue: Element) => {
    let href = "";

    const issueAnchor = issue.querySelector("a");
    if (issueAnchor) {
      let potentialHref = issueAnchor.attributes.getNamedItem("href")?.value;
      if (potentialHref) {
        href = potentialHref;
      }
    }

    // TODO
    // if (href) {
    //   each issue contains multiple articles
    // }

    const item: FeedItem = {
      title: "",
      date: "",
      href,
      desc: "",
      tags: [],
    };

    feed.items.push(item);
  });

  body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
