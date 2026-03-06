import { expect, test } from "@playwright/test";

function findSecondPageDesignRequest(requestUrls: URL[]): URL | undefined {
  return requestUrls.find(
    (url) => url.pathname === "/api/events" && url.searchParams.get("page") === "2" && url.searchParams.get("q") === "design"
  );
}

function getSecondPageDesignRequestOrThrow(requestUrls: URL[]): URL {
  const requestUrl = findSecondPageDesignRequest(requestUrls);
  if (!requestUrl) {
    throw new Error("Second page request for q=design was not captured");
  }
  return requestUrl;
}

test("before fix: archived flag is lost on load more", async ({ page }) => {
  const requestUrls: URL[] = [];
  page.on("request", (request) => {
    if (request.method() === "GET") {
      requestUrls.push(new URL(request.url()));
    }
  });

  await page.goto("/events");

  await page.getByLabel("Search").fill("design");
  await page.getByRole("tab", { name: "Archived" }).click();
  await expect(page.getByText("Design Archive 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load more" })).toBeVisible();

  await page.getByRole("button", { name: "Load more" }).click();
  await expect.poll(() => findSecondPageDesignRequest(requestUrls), { timeout: 5000 }).toBeDefined();

  const secondPageUrl = getSecondPageDesignRequestOrThrow(requestUrls);

  expect(secondPageUrl.searchParams.get("archived")).toBeNull();
  await expect(page.locator('li[data-archived="false"]')).toHaveCount(8);
});

test("after fix: archived flag is preserved on load more", async ({ page }) => {
  const requestUrls: URL[] = [];
  page.on("request", (request) => {
    if (request.method() === "GET") {
      requestUrls.push(new URL(request.url()));
    }
  });

  await page.goto("/events-fix");

  await page.getByLabel("Search").fill("design");
  await page.getByRole("tab", { name: "Archived" }).click();
  await expect(page.getByText("Design Archive 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load more" })).toBeVisible();

  await page.getByRole("button", { name: "Load more" }).click();
  await expect.poll(() => findSecondPageDesignRequest(requestUrls), { timeout: 5000 }).toBeDefined();

  const secondPageUrl = getSecondPageDesignRequestOrThrow(requestUrls);

  expect(secondPageUrl.searchParams.get("archived")).toBe("true");
  await expect(page.locator('li[data-archived="false"]')).toHaveCount(0);
});
