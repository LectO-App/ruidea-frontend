import ReactGA from "react-ga";
import { safePageview } from "./App";

jest.mock("react-ga");

// Reset/verify tokens and document/passport numbers live in the path. analytics.js sends
// the whole address bar as `location` (dl) unless it is overwritten (SECURITY_ASSESSMENT.md §10.3).
const visit = (path) => {
  window.history.pushState({}, "", path);
  ReactGA.set.mockClear();
  ReactGA.pageview.mockClear();
  safePageview();
  return { set: ReactGA.set.mock.calls[0][0], page: ReactGA.pageview.mock.calls[0][0] };
};

test.each([
  ["/cambiarContraseña/secret-reset-token", "secret-reset-token"],
  ["/verificarEmail/secret-email-token", "secret-email-token"],
  ["/verificar/12345678Z/0001234", "12345678Z"],
])("sensitive path %s never reaches GA", (path, secret) => {
  const { set, page } = visit(path);
  expect(page).toBe("/[redacted]");
  expect(set.page).toBe("/[redacted]");
  expect(set.location).toBe(window.location.origin + "/[redacted]");
  expect(JSON.stringify(set)).not.toContain(secret);
});

test("ordinary paths are reported as-is", () => {
  const { set, page } = visit("/dashboard");
  expect(page).toBe("/dashboard");
  expect(set.location).toBe(window.location.origin + "/dashboard");
});
