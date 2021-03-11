export type Feed = {
  title: string;
  desc: string;
  source: string;
  items?: {
    // content?: string;
    // date?: string;
    // desc?: string;
    // href: string;
    // id?: string;
    // tags?: string[];
    // title: string;
  }[];
};

// given metadata for an RSS feed, generates the resulting feed
export const GenerateFeed = (feed: Feed): string => {
  const { title, desc, source } = feed;

  return `
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <description>${desc}</description>
    <link>${source}</link>
    <language>en-us</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
  </channel>
</rss>
  `;
  // <atom:link href="${APP_BASE_URL}${feedHref}" rel="self" type="application/rss+xml" />
  // ${
  //   image
  //     ? `
  // <image>
  //   <url>${APP_BASE_URL}${image}</url>
  //   <title>${title}</title>
  //   <link>${link}</link>
  // </image>
  //       `
  //     : ""
  // }
  // ${items
  //   .map((item) => {
  //     const { content, date, desc, href, id, tags, title } = item;
  //     const itemLink = `${APP_BASE_URL}${href}`;
  //     const body = content || desc;

  //     return `
  // <item>
  //   <title>${title}</title>
  //   <link>${itemLink}</link>
  //   ${
  //     body
  //       ? `
  //   <description><![CDATA[${marked(body)}]]></description>
  //         `
  //       : ""
  //   }
  //   ${
  //     date
  //       ? `
  //   <pubDate>${new Date(date).toUTCString()}</pubDate>
  //         `
  //       : ""
  //   }
  //   ${
  //     id
  //       ? `
  //   <guid isPermaLink="false">${id}</guid>
  //         `
  //       : ""
  //   }
  //   ${
  //     tags
  //       ? tags
  //           .map(
  //             (tag) => `
  //   <category>${tag}</category>
  //                     `
  //           )
  //           .join("")
  //       : ""
  //   }
  // </item>
  //          `;
  //   })
  //   .join("")}
};
