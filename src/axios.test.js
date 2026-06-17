import { axiosInstance } from "./axios";

// The session cookie must be sent cross-origin and no public API key may be attached
// (SECURITY_ASSESSMENT.md §1.1). This locks in the post-migration auth contract.
test("axios instance sends credentials (cookies) cross-origin", () => {
  expect(axiosInstance.defaults.withCredentials).toBe(true);
});

test("axios instance has no static API key header", () => {
  const headers = JSON.stringify(axiosInstance.defaults.headers || {});
  expect(headers.toLowerCase()).not.toContain("authkey");
});
