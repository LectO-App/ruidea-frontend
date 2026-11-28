import auth from "./auth";
import { axiosInstance } from "./axios";

jest.mock("./axios", () => ({ axiosInstance: { post: jest.fn(), get: jest.fn() } }));

afterEach(() => window.localStorage.clear());

test("logout deletes the passport copy, even with no connection", async () => {
  window.localStorage.setItem("ruidea-pasaporte", JSON.stringify({ numeroPasaporte: "0001042", url: "x" }));
  axiosInstance.post.mockRejectedValue(new Error("Network Error"));
  await auth.logout();
  expect(axiosInstance.post).toHaveBeenCalledWith("/usuario/logout");
  expect(window.localStorage.getItem("ruidea-pasaporte")).toBeNull();
});
