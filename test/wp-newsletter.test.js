const newsletter = require("../src/functions/wp-newsletter");
const { handler } = newsletter;

describe("wp-newsletter", () => {
  // routine
  it("produces the expected output format", async () => {
    const url = "https://gettingitstrait.com";
    const event = {
      path: `/.netlify/functions/wp-newsletter`,
      queryStringParameters: { url },
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toBe("string");
    expect(res.body).toBe("hello");
  });
});
