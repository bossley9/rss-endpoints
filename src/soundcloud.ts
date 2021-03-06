export const handler = async (event: any, context: any) => {
  // const queryString = event.queryStringParameters;
  // const query = JSON.stringify(queryString);
  const strEvent = JSON.stringify(event);
  const strContext = JSON.stringify(context);

  return {
    statusCode: 200,
    // body: `Hello world!\nquery is ${query}`,
    body: `${strEvent} ${strContext}`,
  };
};
