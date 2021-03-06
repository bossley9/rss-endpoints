export const handler = async (event: any) => {
  const path = event.path;
  const queryString = event.queryStringParameters;

  const query = JSON.stringify(queryString);

  return {
    statusCode: 200,
    body: `Hello world!\npath is ${path}\nquery is ${query}`,
  };
};
