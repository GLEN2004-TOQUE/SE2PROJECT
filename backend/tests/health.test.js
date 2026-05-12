const request = require("supertest");
const app = require("../app");

describe("Health endpoints", () => {
  it("GET /health should return OK", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "OK");
  });
});

