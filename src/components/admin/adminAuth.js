import { axiosInstance } from "../../axios";
import { clearCsrf } from "../../csrf";

// Admin auth is a real server session now (SECURITY_ASSESSMENT.md §1.3). No client-set
// `admin=true` cookie; the server decides via /admin/me.
class AdminAuth {
  async login(data, successFunction, errorFunction) {
    try {
      const { user, password } = data;
      await axiosInstance.post(`/admin/login`, { user, password });
      successFunction && successFunction();
    } catch (err) {
      errorFunction ? errorFunction() : console.log(err);
    }
  }
  async logout(cb) {
    try {
      await axiosInstance.post("/admin/logout");
    } catch (err) {
      /* ignore */
    }
    clearCsrf();
    cb && cb();
  }
  async isAuthenticated() {
    try {
      await axiosInstance.get("/admin/me");
      return true;
    } catch (err) {
      return false;
    }
  }
}

const adminAuth = new AdminAuth();
export default adminAuth;
