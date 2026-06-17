import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ProtectedRoute } from './protected.route';
import { Helmet } from 'react-helmet-async';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import LoadingScreen from './components/LoadingScreen';
import ReactGA from 'react-ga';
import CheckPassport from './components/CheckPassport';
import RegistrationSkeleton from './components/RegistrationSkeleton';
import DashboardSkeleton from './components/DashboardSkeleton';
import Toaster from './components/ui/Toaster';

// Eager (not lazy): the landing is the default route and the first thing most visitors
// see. Code-splitting it only adds a second network round-trip + a spinner flash before
// the most important page — so it ships in the main bundle and renders instantly. The
// remaining routes stay lazy since they sit behind auth/navigation.
import LandingPage from './components/LandingPage';

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
const AdminModify = lazy(() => import('./components/admin/AdminModify'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

// Routes whose path/query carry PII or live tokens must never be sent to Google
// Analytics (SECURITY_ASSESSMENT.md §10.3). Report a generic label instead and never
// include the query string.
const SENSITIVE = ['/verificar/', '/cambiarContrase', '/verificarEmail/'];
const safePageview = () => {
	const path = window.location.pathname;
	const isSensitive = SENSITIVE.some(p => path.startsWith(p));
	ReactGA.pageview(isSensitive ? '/[redacted]' : path);
};

// Shared top-level page transition: a short fade + small upward rise. This smooths
// the lazy/Suspense pop-in without implying a spatial relationship between unrelated
// routes (a full-page horizontal slide did, and felt cheap). Honors prefers-reduced-motion.
function PageTransition({ children }) {
	const reduceMotion = useReducedMotion();
	const variants = reduceMotion
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0, y: 8 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0 },
		  };
	return (
		<motion.div
			variants={variants}
			initial='initial'
			animate='animate'
			exit='exit'
			transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}

function App() {
	if (process.env.REACT_APP_GA_KEY) {
		ReactGA.initialize(process.env.REACT_APP_GA_KEY);
		safePageview();
	}

	return (
		<div className='App'>
			<Toaster />
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
				<Suspense fallback={<LoadingScreen />}>
					{/* Suspense must wrap Switch (not the reverse): a Suspense as Switch's only
					    child has no `path`, so the Switch matches it for every location and never
					    actually switches — which caused all routes to render at once and an
					    /admin/me redirect loop. The PageTransition wrapper is keyed by pathname
					    so route changes animate cleanly instead of fighting the router. */}
					<Route
						render={({ location }) => (
							<AnimatePresence mode='wait'>
								<PageTransition key={location.pathname}>
									<Switch location={location}>
									<Route exact path='/' component={LandingPage} />
									{/* Dedicated Suspense so the registration chunk download shows the
										    registration skeleton (not the generic full-screen spinner),
										    continuous with Form's own initial-fetch skeleton. */}
										<Route
											path='/inscribirse'
											render={(routeProps) => (
												<Suspense fallback={<RegistrationSkeleton />}>
													<Form {...routeProps} />
												</Suspense>
											)}
										/>
									<ProtectedRoute path='/dashboard' component={Dashboard} fallback={<DashboardSkeleton />} />
									<Route path='/login' component={Login} />
									<Route exact path='/admin' component={() => <Redirect to='/admin/login' />} />
									<Route exact path='/verificar/ejemplo' component={VerificarEjemplo} />
									<Route exact path='/verificar/numero' component={CheckPassport} />
									<Route path='/verificar/:nroDocumento/:nroPasaporte' component={Verificar} />
									<Route exact path='/admin/login' component={AdminLogin} />
									<ProtectedRoute
										exact
										path='/admin/solicitudes'
										component={AdminSolicitudes}
										checkUrl='/admin/me'
										redirectTo='/admin/login'
									/>
									<Route exact path='/cambiarContraseña/:token' component={ChangePassword} />
									<ProtectedRoute
										exact
										path='/admin/solicitudes/:id/modificar'
										component={AdminModify}
										checkUrl='/admin/me'
										redirectTo='/admin/login'
									/>
									<ProtectedRoute
										exact
										path='/admin/solicitudes/:id'
										component={AdminSolicitud}
										checkUrl='/admin/me'
										redirectTo='/admin/login'
									/>
									<Route exact path='/verificarEmail/:token' component={VerificarEmail} />
									<Route exact path='/politica-privacidad' component={PrivacyPolicy} />
								</Switch>
								</PageTransition>
							</AnimatePresence>
						)}
					/>
				</Suspense>
			</Router>
		</div>
	);
}

export default App;
