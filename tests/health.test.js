import request from "supertest";
import app from "../src/app.js";

describe("Health endpoints", () => {
  test("GET /health should return healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
  });

  test("GET /version should return app version", async () => {
    const response = await request(app).get("/version");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("version");
  });
});
