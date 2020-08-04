import Cookies from "universal-cookie";

class Auth {
  constructor() {
    this.authenticated = false;
  }
  login(success) {
    /* const res = await axios
      .post("https://lecto-api.herokuapp.com/api/users", {
        key,
      })
      .catch((error) => {
        if (error) return failure();
      });

    if (res) {
      this.authenticated = true;
      success();
    } */
    this.authenticated = true;
    success();
  }
  logout(cb) {
    const cookies = new Cookies();
    cookies.remove("logged-in");
    cookies.remove("id");
    this.authenticated = false;
    cb && cb();
  }
  isAuthenticated() {
    const cookies = new Cookies();
    return cookies.get("logged-in");
  }
}
export default new Auth();
