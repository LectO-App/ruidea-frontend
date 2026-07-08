import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axios';

import LoadingScreen from './LoadingScreen';

import logoRuideaPNG from '../img/png/logo-ruidea.png';

const VerifyEmail = props => {
	const { token } = props.match.params;

	const [loading, setLoading] = useState(true);
	const [verificado, setVerificado] = useState(false);
	// idle | sending | sent | error — self-serve resend from the expired/invalid page.
	const [resend, setResend] = useState('idle');

	const fetchFromAPI = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axiosInstance.post(`/emailVerification/confirm/${token}`);
			if (res.status === 200) {
				setVerificado(true);
			}
		} catch (err) {
			setVerificado(false);
		}
		setLoading(false);
	}, [token]);

	useEffect(() => {
		fetchFromAPI();
	}, [fetchFromAPI]);

	// Re-issue a verification email from the (likely expired) token. The backend decodes
	// the token ignoring expiry to recover the user id, so no login or re-typed email is
	// needed — the person just clicks once and gets a fresh link.
	const reenviarCorreo = useCallback(async () => {
		if (resend === 'sending' || resend === 'sent') return;
		setResend('sending');
		try {
			await axiosInstance.post(`/emailVerification/resend/${token}`);
			setResend('sent');
		} catch (err) {
			setResend('error');
		}
	}, [token, resend]);

	return (
		<>
			{loading && <LoadingScreen />}
			<main className='main-verificar-mail'>
				{verificado ? (
					<>
						<img src={logoRuideaPNG} alt='Logo RUIDEA' />
						<div className='texto'>
							<h4>Su correo electrónico ha sido verificado correctamente.</h4>
							<h4>Pronto, profesionales verificarán su solicitud.</h4>
						</div>
						<Link to='/login'>Iniciar sesión</Link>
					</>
				) : (
					<>
						<h1>El link que ingresó es incorrecto o ya venció.</h1>
						{resend === 'sent' ? (
							<div className='texto'>
								<h4>Le hemos enviado un nuevo correo de verificación.</h4>
								<h4>
									Revise su bandeja de entrada (y la carpeta de spam) y pulse el enlace
									en las próximas horas.
								</h4>
							</div>
						) : (
							<>
								<h1>Pulse el botón para recibir un nuevo enlace de verificación.</h1>
								<button
									type='button'
									className='btn-reenviar'
									onClick={reenviarCorreo}
									disabled={resend === 'sending'}
								>
									{resend === 'sending' ? 'Enviando…' : 'Reenviar correo'}
								</button>
								{resend === 'error' && (
									<p className='error-reenviar'>
										No pudimos reenviar el correo. Inténtelo de nuevo en unos minutos o
										inicie sesión para solicitarlo.
									</p>
								)}
							</>
						)}
						<Link to='/login'>Iniciar sesión</Link>
					</>
				)}
			</main>
		</>
	);
};

export default VerifyEmail;
