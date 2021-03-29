const gis = require("../src/functions/gis-background");
const { handler } = gis;

describe("gis", () => {
  // routine
  it("produces the expected output format", async () => {
    const res = await handler();

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toBe("string");
  }, 10000); // explicit delay due to sheer amount of async calls
});
