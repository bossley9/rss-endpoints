export type FeedItem = {
  id?: string;
  title: string;
  date?: string;
  href: string;
  desc?: string;
  tags?: string[];
  content?: string;
};

export type Feed = {
  title: string;
  desc: string;
  source: string;
  endpoint: string;
  items: FeedItem[];
};

// given metadata for an RSS feed item, generates the resulting feed item
const GenerateFeedItem = (item: FeedItem): string => {
  const { id, title, date, href, desc, tags, content } = item;
  return `
<item>
  ${id ? `<guid isPermaLink="false">${id}</guid>` : ""}
  <title>${title}</title>
  <link>${href}</link>
  ${desc ? `<description>${desc}</description>` : ""}
  ${date ? `<pubDate>${new Date(date).toUTCString()}</pubDate>` : ""}
  ${tags ? tags.map((tag) => `<category>${tag}</category>`).join("") : ""}
  ${content ? content : ""}
</item>`;
};

// given metadata for an RSS feed, generates the resulting feed
export const GenerateFeed = (feed: Feed): string => {
  const { title, desc, source, endpoint, items } = feed;

  return `
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <description>${desc}</description>
    <link>${source}</link>
    <language>en-us</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <atom:link href="${endpoint}" rel="self" type="application/rss+xml" />
    ${items.map((item: FeedItem) => GenerateFeedItem(item))}
  </channel>
</rss>
  `;
};
