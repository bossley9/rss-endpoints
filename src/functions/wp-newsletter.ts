import { Event, Handler } from "../util/core";

export const handler: Handler = async (event: Event, context: any) => {
  let statusCode = 200;
  let body = "";

  let params = {
    event,
    context,
  };

  body = JSON.stringify(params);

  return {
    statusCode,
    body,
  };
};
