import { buildResourcePath } from "./request";

describe("buildResourcePath", () => {
  it("should replace params in the URL with the values from the params object", () => {
    const url = buildResourcePath("https://example.com", "/:id", { id: 1 });
    expect(url).toEqual("https://example.com/1");
    const url2 = buildResourcePath("https://example.com", "/:id/:name", {
      id: 1,
      name: "test",
    });
    expect(url2).toEqual("https://example.com/1/test");
    const url3 = buildResourcePath(
      "https://example.com",
      "/flow/default/made-from/code/:code",
      { code: 123 }
    );
    expect(url3).toEqual("https://example.com/flow/default/made-from/code/123");
  });
});
