import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import { Helmet } from "react-helmet";

import Dashboard from "./components/Dashboard";
import Form from "./components/Form";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";

function App() {
  return (
    <div className="App">
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          RUIDEA - Registro Único Iberoamericano de Personas con Dificultades
          Específicas del Aprendizaje
        </title>
        <meta property="og:title" content="RUIDEA" />
        <meta
          property="og:description"
          content="RUIDEA es un Registro Único Iberoamericano de Personas con Dificultades
          Específicas del Aprendizaje"
        />
        <meta
          name="keywords"
          content="RUIDEA, dislexia, pasaporte dislexia, registro dislexia, registro dificultades aprendizaje, disfam, lecto, lecto app"
        />
      </Helmet>
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
