import Cookies from "universal-cookie";
import { axiosInstance } from "../../axios";

class AdminAuth {
  constructor() {
    this.authenticated = false;
  }
  async login(data, successFunction, errorFunction) {
    try {
      const { user, password } = data;

      await axiosInstance.post(`/admin/login`, {
        user,
        password,
      });

      const cookies = new Cookies();
      cookies.set("admin", true, { expires: 0 });
      this.authenticated = true;
      successFunction && successFunction();
    } catch (err) {
      errorFunction ? errorFunction() : console.log(err);
    }
  }
  logout(cb) {
    const cookies = new Cookies();
    cookies.remove("admin");
    this.authenticated = false;
    cb && cb();
  }
  isAuthenticated() {
    const cookies = new Cookies();
    return cookies.get("admin");
  }
}
export default new AdminAuth();
