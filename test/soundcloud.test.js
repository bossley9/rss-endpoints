const soundcloud = require("../src/soundcloud");
const { handler } = soundcloud;

describe("soundcloud", () => {
  // routine
  it("produces the expected output format", async () => {
    const event = {
      path: "/.netlify/functions/soundcloud",
      queryStringParameters: {},
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toBe("string");
  });
});
