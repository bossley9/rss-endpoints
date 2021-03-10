import fetch from "isomorphic-fetch";
// client id extracted from youtube-dl extractor, line 312
// https://github.com/ytdl-org/youtube-dl/blob/master/youtube_dl/extractor/soundcloud.py
// const CLIENT_ID = "YUKXoArFcqrlQn9tfNHvvyfnDISj04zk";

export const handler = async (event: any) => {
  const { path } = event;
  let statusCode = 200;
  let body = "";

  const pathIndicator: string = "soundcloud";
  const indicatorIndex = path.indexOf(pathIndicator);
  const indicatorLength = pathIndicator.length;

  const user = path.substring(indicatorIndex + indicatorLength + 1);

  if (!user) {
    return {
      statusCode,
      body: "USAGE: /user -> user's rss track feed",
    };
  }

  let userid = "";

  try {
    const url = `http://soundcloud.com/${user}`;
    const res = await fetch(url, {});
    const raw = await res.text();

    const key: string = "api.soundcloud.com/users/";

    // trim start and end to get id
    userid = raw;
    userid = userid.substring(userid.indexOf(key) + key.length);
    userid = userid.substring(0, userid.indexOf('"'));
  } catch (e) {
    console.log("Error:", e);
    statusCode = 500;
  }

  try {
    const url = `https://feeds.soundcloud.com/users/soundcloud:users:${userid}/sounds.rss`;
    const res = await fetch(url, {});
    body = await res.text();
  } catch (e) {
    console.log("Error:", e);
    statusCode = 500;
  }

  return {
    statusCode,
    body,
  };
};
