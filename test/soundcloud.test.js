const soundcloud = require("../src/functions/soundcloud");
const { handler } = soundcloud;

describe("soundcloud", () => {
  // routine
  it("produces the expected output format", async () => {
    const user = "postmalone";
    const event = {
      path: `/.netlify/functions/soundcloud/${user}`,
      queryStringParameters: {},
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toBe("string");
  });
});
