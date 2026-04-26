import { test, expect } from "@playwright/test";

test.describe("Public API surface", () => {
  test("/sitemap.xml lists key routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/quiz");
    expect(body).toContain("/stacks");
    expect(body).toContain("/build");
    expect(body).toContain("/scaffold");
    expect(body).toContain("/migrate");
  });

  test("/api/votes returns ok shape", async ({ request }) => {
    const res = await request.get("/api/votes");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("ok", true);
    expect(data).toHaveProperty("counts");
  });

  test("/api/quiz rejects empty body", async ({ request }) => {
    const res = await request.post("/api/quiz", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("/api/quiz/og returns image bytes", async ({ request }) => {
    // Encoded test result
    const encoded =
      "eyJhIjoic29sby1zaGlwcGVyIiwicSI6eyJidWlsZGluZyI6InNoaXAtcHJvZHVjdCJ9LCJ0IjpbWyJkMyIsImNvZGUiLCJ3aHkiXV19";
    const res = await request.get(`/api/quiz/og?s=${encoded}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"] || "").toContain("image");
  });
});
