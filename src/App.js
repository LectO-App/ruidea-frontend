import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import { Helmet } from "react-helmet";

import { AnimatePresence, motion } from "framer-motion";

import Dashboard from "./components/Dashboard";
import Form from "./components/Form";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Verificar from "./components/Verificar";
import VerificarEmail from "./components/VerifyEmail";
import AdminLogin from "./components/admin/AdminLogin";
import AdminSolicitudes from "./components/admin/AdminSolicitudes";
import AdminSolicitud from "./components/admin/AdminSolicitud";

import ReactGA from "react-ga";

function App() {
  ReactGA.initialize(process.env.REACT_APP_GA_KEY);
  ReactGA.pageview(window.location.pathname + window.location.search);

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
        <AnimatePresence exitBeforeEnter>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/inscribirse" component={Form} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route
              exact
              path="/admin"
              component={() => <Redirect to="/admin/login" />}
            />
            <Route
              path="/verificar/:nroDocumento/:nroPasaporte"
              component={Verificar}
            />
            <Route exact path="/admin/login" component={AdminLogin} />
            <Route
              exact
              path="/admin/solicitudes"
              component={AdminSolicitudes}
            />
            <Route
              exact
              path="/admin/solicitudes/:id"
              component={AdminSolicitud}
            />
            <Route
              exact
              path="/verificarEmail/:token"
              component={VerificarEmail}
            />
          </Switch>
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;
