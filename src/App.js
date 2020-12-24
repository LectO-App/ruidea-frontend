import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ProtectedRoute } from './protected.route';
import { Helmet } from 'react-helmet';

import { AnimatePresence } from 'framer-motion';

import LoadingScreen from './components/LoadingScreen';
import ReactGA from 'react-ga';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Form = lazy(() => import('./components/Form'));
const Login = lazy(() => import('./components/Login'));
const Verificar = lazy(() => import('./components/Verificar'));
const VerificarEjemplo = lazy(() => import('./components/VerificarEjemplo'));
const VerificarEmail = lazy(() => import('./components/VerifyEmail'));
const ChangePassword = lazy(() => import('./components/ChangePassword'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminSolicitudes = lazy(() => import('./components/admin/AdminSolicitudes'));
const AdminSolicitud = lazy(() => import('./components/admin/AdminSolicitud'));

function App() {
	ReactGA.initialize(process.env.REACT_APP_GA_KEY);
	ReactGA.pageview(window.location.pathname + window.location.search);

	return (
		<div className='App'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>RUIDEA - Registro Único Iberoamericano de Personas con Dificultades Específicas del Aprendizaje</title>
				<meta property='og:title' content='RUIDEA' />
				<meta
					property='og:description'
					content='RUIDEA es un Registro Único Iberoamericano de Personas con Dificultades
          Específicas del Aprendizaje'
				/>
				<meta
					name='keywords'
					content='RUIDEA, dislexia, pasaporte dislexia, registro dislexia, registro dificultades aprendizaje, disfam, lecto, lecto app'
				/>
			</Helmet>
			<Router>
				<AnimatePresence exitBeforeEnter>
					<Switch>
						<Suspense fallback={<LoadingScreen />}>
							<Route exact path='/' component={LandingPage} />
							<Route path='/inscribirse' component={Form} />
							<ProtectedRoute path='/dashboard' component={Dashboard} />
							<Route path='/login' component={Login} />
							<Route exact path='/admin' component={() => <Redirect to='/admin/login' />} />
							<Route exact path='/verificar/ejemplo' component={VerificarEjemplo} />
							<Route path='/verificar/:nroDocumento/:nroPasaporte' component={Verificar} />
							<Route exact path='/admin/login' component={AdminLogin} />
							<Route exact path='/admin/solicitudes' component={AdminSolicitudes} />
							<Route exact path='/cambiarContraseña/:token' component={ChangePassword} />
							<Route exact path='/admin/solicitudes/:id' component={AdminSolicitud} />
							<Route exact path='/verificarEmail/:token' component={VerificarEmail} />
						</Suspense>
					</Switch>
				</AnimatePresence>
			</Router>
		</div>
	);
}

export default App;
