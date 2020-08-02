import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";

import Dashboard from "./components/Dashboard";
import Form from "./components/Form";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route path="/inscribirse" component={Form} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
