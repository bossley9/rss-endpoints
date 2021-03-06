export const handler = async (event: any, context: any) => {
  const queryString = event.queryStringParameters;
  const query = JSON.Stringify(queryString);

  return {
    statusCode: 200,
    body: `Hello world!\nquery is ${query}`,
  };
};
