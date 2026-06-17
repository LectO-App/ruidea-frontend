import { axiosInstance } from "./axios";
import { clearCsrf } from "./csrf";

// Auth state lives on the server (httpOnly session cookie). The client can no longer
// "log itself in" by setting a cookie (SECURITY_ASSESSMENT.md §1.4); it can only ask
// the server whether the current session is valid.
class Auth {
  async isAuthenticated() {
    try {
      await axiosInstance.get("/usuario/me");
      return true;
    } catch (err) {
      return false;
    }
  }
  async logout() {
    try {
      await axiosInstance.post("/usuario/logout");
    } catch (err) {
      /* ignore */
    }
    clearCsrf();
  }
}

const auth = new Auth();
export default auth;
