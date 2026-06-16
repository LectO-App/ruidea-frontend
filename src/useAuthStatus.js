import { useState, useEffect } from "react";
import auth from "./auth";

// Auth is verified against the server (httpOnly session cookie), so it's asynchronous.
// Components use this hook instead of calling isAuthenticated() synchronously.
export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let active = true;
    auth.isAuthenticated().then((v) => active && setLoggedIn(v));
    return () => {
      active = false;
    };
  }, []);
  return loggedIn;
};
