import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
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

  // TODO parse rss for feed meta

  const issuesUrl = `${SOURCE_BASE_URL}/issues`;

  let issuesHTML = "";
  try {
    const res = await fetch(issuesUrl, {});
    issuesHTML = await res.text();
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  if (!issuesHTML) {
    return {
      statusCode,
      body: "ERROR: issues url returned an empty response",
    };
  }

  const { document } = new JSDOM(issuesHTML).window;

  // TODO now to get items!

  const issuesList = document.querySelectorAll(".entry-content a");
  if (!issuesList) {
    return {
      statusCode,
      body: "ERROR: no issues under /issues found",
    };
  }

  issuesList.forEach((issue: Element, index: number) => {
    body += `issue is ${issue}`;
  });

  // body = `${rss}`;

  return {
    statusCode,
    body,
  };
};
