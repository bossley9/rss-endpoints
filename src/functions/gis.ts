import fetch from "isomorphic-fetch";
import { JSDOM } from "jsdom";
import { Handler } from "../util/core";
import { Feed, FeedItem, GenerateFeed } from "../util/feed";

const getMonthDiff = (d1: Date, d2: Date) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

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

  const issueUrl = `${SOURCE_BASE_URL}/issues`;

  // hacky alternative :)
  const startDate = new Date("June 2020");
  const currentDate = new Date();
  const numIssues = getMonthDiff(startDate, currentDate);
  let issueArr = [...Array(numIssues)].map((_, i) => {
    const issueNo = numIssues - i;
    const localIssueUrl = `${issueUrl}/issue-${issueNo}`;
    return localIssueUrl;
  });

  // restrict the number of issues due to api overload
  const MAX_NUM_ISSUES = 5;
  issueArr = issueArr.slice(0, MAX_NUM_ISSUES);

  const promisedIssues: Promise<string>[] = issueArr.map((href) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const res = await fetch(href, {});
        let issueHtml = await res.text();
        resolve(issueHtml);
      } catch (e) {
        reject(e);
      }
    });
  });

  try {
    const issueHtmlArr = await Promise.all(promisedIssues);
    for (let i = 0; i < issueHtmlArr.length; i++) {
      const issueHtml = issueHtmlArr[i];

      const { document: issueDocument } = new JSDOM(issueHtml).window;
      let articleHtmlArr = issueDocument.querySelectorAll(
        ".entry-content .wp-block-jetpack-layout-grid-column"
      );

      let issue = "";
      let issueTitleHtml = issueDocument.querySelector("#content .entry-title");
      if (issueTitleHtml) {
        const { firstChild, innerHTML } = issueTitleHtml;
        // occasionally encased in <i> or <strong> tags
        issue = firstChild ? (firstChild as Element).innerHTML : innerHTML;
      }

      let date = "";
      let issueDateHtml = issueDocument.querySelectorAll(
        "#content .entry-content *"
      );
      if (issueDateHtml[0]) {
        const { firstChild, innerHTML } = issueDateHtml[0];
        // ditto
        date = firstChild ? (firstChild as Element).innerHTML : innerHTML;
      }

      articleHtmlArr.forEach((articleHtml: Element) => {
        const articleAnchor = articleHtml.querySelector("a");
        if (articleAnchor) {
          let hrefAttr = articleAnchor.attributes.getNamedItem("href");
          if (hrefAttr) {
            const href = hrefAttr.value;

            // remove base url, slash, "issue", and dash
            let hrefEnd = href.substring(
              issueUrl.length + 1 + "issue".length + 1
            );
            let issueNoRaw = hrefEnd.substring(0, hrefEnd.indexOf("/"));

            let issueNo = parseInt(issueNoRaw);

            let subtitle = "";
            const subtitleElement = articleHtml.querySelector(
              ".wp-block-cover__inner-container h3 em"
            );
            if (subtitleElement) {
              subtitle = subtitleElement.innerHTML;
            }

            const title = `Issue ${issueNo}: ${issue}${
              subtitle ? ` - ${subtitle}` : ""
            }`;

            const item: FeedItem = {
              title,
              date,
              href,
            };

            feed.items.push(item);
          }
        }
      });
    }
  } catch (e) {
    statusCode = 500;
    body = `ERROR: ${e}`;
  }

  body = GenerateFeed(feed);

  return {
    statusCode,
    body,
  };
};
