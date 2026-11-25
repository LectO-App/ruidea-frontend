import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AiOutlineCheckCircle } from 'react-icons/ai';

import { axiosInstance } from '../axios';
import { safeNextPath } from '../util/nextPath';

import '../css/registration.scss';

// Time to read "Ya estás dentro" before the saved page opens.
const CONTINUE_AFTER_MS = 1500;

// Opened from the sign-in email. The token is spent by a POST from this page once it has
// loaded, never by the GET of the link itself, so a mail scanner that fetches the URL does
// not use it up. The session cookie and CSRF token come back like /usuario/login.
const EntrarConEnlace = () => {
	const { token } = useParams();
	const history = useHistory();
	const [status, setStatus] = useState('checking'); // checking | ok | invalid
	const [next, setNext] = useState(null);
	const posted = useRef(false);

	useEffect(() => {
		// The link works once: StrictMode's second effect run must not post it again.
		if (posted.current) return;
		posted.current = true;
		axiosInstance
			.post('/usuario/enlace/entrar', { token })
			.then(res => {
				setNext(safeNextPath(res.data && res.data.next));
				setStatus('ok');
			})
			.catch(() => setStatus('invalid'));
	}, [token]);

	useEffect(() => {
		if (status !== 'ok') return undefined;
		const timer = setTimeout(() => history.replace(next), CONTINUE_AFTER_MS);
		return () => clearTimeout(timer);
	}, [status, next, history]);

	return (
		<div className='reg auth'>
			<Helmet>
				<title>Entrar | RUIDEA</title>
				<meta name='referrer' content='no-referrer' />
			</Helmet>

			<div className='auth-shell'>
				<div className='reg-step auth-card auth-card--center' role='status' aria-live='polite'>
					{status === 'checking' && <p className='auth-sub'>Abriendo tu sesión…</p>}
					{status === 'ok' && (
						<>
							<AiOutlineCheckCircle className='auth-icon auth-icon--ok' size={56} aria-hidden='true' />
							<h1 className='auth-title'>Ya estás dentro</h1>
							<p className='auth-sub'>Te llevamos a la pantalla que querías abrir.</p>
							<Link className='btn-primary auth-submit' to={next} replace>
								Continuar
							</Link>
						</>
					)}
					{status === 'invalid' && (
						<>
							<h1 className='auth-title'>Este enlace ya no sirve</h1>
							<p className='auth-sub'>
								Los enlaces para entrar sirven 15 minutos y una sola vez. No pasa nada: pide uno nuevo y
								entra en un momento.
							</p>
							<Link className='btn-primary auth-submit' to='/login'>
								Enviarme un enlace nuevo
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default EntrarConEnlace;
