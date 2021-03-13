export const ENDPOINT_BASE_URL = "https://rss-endpoints.netlify.app";

// given a base path to search and a key or indicator to look for,
// return the resulting stub end of the path.
export const GetUrlPathStub = (path: string, indicator: string): string => {
  const indicatorIndex = path.indexOf(indicator);
  const indicatorLength = indicator.length;

  return path.substring(indicatorIndex + indicatorLength + 1);
};