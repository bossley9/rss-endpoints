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

  // const feedUrl = `${SOURCE_BASE_URL}/feed`;

  //   let rss = "";
  //   try {
  //     const res = await fetch(feedUrl, {});
  //     rss = await res.text();
  //   } catch (e) {
  //     statusCode = 500;
  //     body = `ERROR: ${e}`;
  //   }

  //   if (!rss) {
  //     return {
  //       statusCode,
  //       body: "ERROR: feed url returned an empty response",
  //     };
  //   }

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

  // restrict the number of issues due to api overload
  const MAX_NUM_ISSUES = 10;

  let issueHtmlArr = Array.from(
    document.querySelectorAll(".entry-content figure")
  ).slice(0, MAX_NUM_ISSUES);

  const promisedIssues: Promise<string>[] = [];

  issueHtmlArr.forEach((issue: Element) => {
    const issueAnchor = issue.querySelector("a");
    if (issueAnchor) {
      let hrefAttr = issueAnchor.attributes.getNamedItem("href");
      if (hrefAttr) {
        const href = hrefAttr.value;
        // fetch each issue simultaneously
        let issuePromise = new Promise<string>(async (resolve, reject) => {
          let issueHtml = "";
          try {
            const res = await fetch(href, {});
            issueHtml = await res.text();
            resolve(issueHtml);
          } catch (e) {
            reject(e);
          }
        });

        promisedIssues.push(issuePromise);
      }
    }
  });

  const promisedArticles: Promise<string>[] = [];

  try {
    const issueHtmlArr = await Promise.all(promisedIssues);
    for (let i = 0; i < issueHtmlArr.length; i++) {
      const issueHtml = issueHtmlArr[i];

      const { document: issueDocument } = new JSDOM(issueHtml).window;
      let articleHtmlArr = issueDocument.querySelectorAll(
        ".entry-content .wp-block-jetpack-layout-grid-column"
      );

      articleHtmlArr.forEach((articleHtml: Element) => {
        const articleAnchor = articleHtml.querySelector("a");
        if (articleAnchor) {
          let hrefAttr = articleAnchor.attributes.getNamedItem("href");
          if (hrefAttr) {
            const href = hrefAttr.value;
            // fetch each issue simultaneously
            let articlePromise = new Promise<string>(
              async (resolve, reject) => {
                let articleHtml = "";
                try {
                  const res = await fetch(href, {});
                  articleHtml = await res.text();
                  resolve(articleHtml);
                  // resolve(`article is from ${href}!`);
                } catch (e) {
                  reject(e);
                }
              }
            );

            promisedArticles.push(articlePromise);
          }
        }
      });
    }
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  try {
    const articleHtmlArr = await Promise.all(promisedArticles);
    for (let i = 0; i < articleHtmlArr.length; i++) {
      const articleHtml = articleHtmlArr[i];
      body += `article is ${articleHtml}\n`;

      // const item: FeedItem = {
      //   title: "",
      //   date: "",
      //   href,
      //   desc: "",
      //   tags: [],
      // };

      // feed.items.push(item);
    }
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  // body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
