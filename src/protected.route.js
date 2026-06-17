import React, { useEffect, useState, Suspense } from "react";
import { Route, Redirect } from "react-router-dom";
import { axiosInstance } from "./axios";
import LoadingScreen from "./components/LoadingScreen";

// Verifies the session against the server before rendering. There is no client-readable
// auth flag to forge (SECURITY_ASSESSMENT.md §1.3/§1.4); a 401 from the check URL means
// not authenticated. `checkUrl` lets the same component guard user and admin areas.
// `fallback` is shown both during the session check and while the (lazy) component's chunk
// downloads — pass a route-specific skeleton so loading is one continuous placeholder.
export const ProtectedRoute = ({
  component: Component,
  checkUrl = "/usuario/me",
  redirectTo = "/",
  fallback = <LoadingScreen />,
  ...rest
}) => {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(checkUrl)
      .then(() => active && setStatus("ok"))
      .catch(() => active && setStatus("denied"));
    return () => {
      active = false;
    };
  }, [checkUrl]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (status === "checking") return fallback;
        if (status === "ok")
          return (
            <Suspense fallback={fallback}>
              <Component {...props} />
            </Suspense>
          );
        return (
          <Redirect
            to={{ pathname: redirectTo, state: { from: props.location } }}
          />
        );
      }}
    />
  );
};
