import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import ForgotPasswordModal from './ForgotPasswordModal';
import CheckEmail from './CheckEmail';
import InlineMessage from './ui/InlineMessage';
import { DEFAULT_NEXT, nextFromLocation } from '../util/nextPath';

import '../css/registration.scss';

const linkError = err =>
	err && err.response && err.response.status === 429
		? 'Pediste muchos enlaces. Espera un rato y vuelve a intentarlo.'
		: 'No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.';

// Sign-in: the email link first (no password to remember, WCAG 2.2 SC 3.3.8), the password
// one tap away. Both return the person to the page they wanted (ProtectedRoute's state.from).
const Login = props => {
	const { register, handleSubmit, errors } = useForm({ mode: 'onBlur' });
	const location = useLocation();
	const next = nextFromLocation(location);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reveal, setReveal] = useState(false);
	const [withPassword, setWithPassword] = useState(false);
	const [sentTo, setSentTo] = useState(null);

	const [email, setEmail] = useState('');
	const emailInput = useRef(null);
	const passwordInput = useRef(null);
	const firstRender = useRef(true);

	// eslint-disable-next-line
	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	const [forgotPassword, setForgotPassword] = useState(false);

	useEffect(() => {
		if (withPassword && passwordInput.current) passwordInput.current.focus();
	}, [withPassword]);

	// Back from "Mira tu correo": put the person in the email field to fix it.
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		if (!sentTo && emailInput.current) emailInput.current.focus();
	}, [sentTo]);

	const requestLink = address => axiosInstance.post('/usuario/enlace', next === DEFAULT_NEXT ? { email: address } : { email: address, next });

	const sendLink = async data => {
		setLoading(true);
		setError(null);
		try {
			await requestLink(data.user);
			setSentTo(data.user);
		} catch (err) {
			setError(linkError(err));
		}
		setLoading(false);
	};

	const loginSuccess = async data => {
		setLoading(true);
		setError(null);
		try {
			// Session + CSRF cookies are set by the server; nothing to store client-side.
			await axiosInstance.post(`/usuario/login`, data);
			props.history.push(next);
		} catch (err) {
			setError('Email y/o contraseña incorrecta. Revisa los datos e inténtalo de nuevo.');
		}
		setLoading(false);
	};

	if (sentTo) {
		return <CheckEmail email={sentTo} resend={() => requestLink(sentTo)} onChangeEmail={() => setSentTo(null)} />;
	}

	return (
		<div className='reg auth'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Entrar | RUIDEA</title>
			</Helmet>

			<Link className='reg-close' to='/' aria-label='Volver al inicio' role='button' />

			<div className='auth-shell'>
				<div className='reg-step auth-card'>
					<header className='auth-head'>
						<h1 className='auth-title'>Entrar a RUIDEA</h1>
						<p className='auth-sub'>No necesitas recordar ninguna contraseña.</p>
					</header>

					<form className='step-form' onSubmit={handleSubmit(withPassword ? loginSuccess : sendLink)} noValidate>
						<div className={`field${errors.user ? ' has-error' : ''}`}>
							<label htmlFor='user'>Correo electrónico</label>
							<input
								type='email'
								name='user'
								id='user'
								inputMode='email'
								autoComplete='email'
								defaultValue={email}
								aria-invalid={errors.user ? 'true' : 'false'}
								onChange={e => setEmail(e.target.value)}
								ref={el => {
									emailInput.current = el;
									register(el, {
										required: 'Ingresa tu correo electrónico',
										pattern: { value: emailRegex, message: 'Revisa el correo, parece incompleto' },
									});
								}}
							/>
							{errors.user && (
								<span className='error-message' role='alert'>
									{errors.user.message}
								</span>
							)}
						</div>

						{withPassword && (
							// Grid layout (field--with-link) lets the "Olvidé mi contraseña" button sit visually
							// top-right of the label while living AFTER the password input in the DOM, so Tab
							// flows email → password → reveal → forgot instead of stopping on the link mid-form.
							<div className={`field field--with-link${errors.password ? ' has-error' : ''}`}>
								<label htmlFor='password'>Contraseña</label>
								<div className='password-wrapper'>
									<input
										type={reveal ? 'text' : 'password'}
										name='password'
										id='password'
										autoComplete='current-password'
										aria-invalid={errors.password ? 'true' : 'false'}
										ref={el => {
											passwordInput.current = el;
											register(el, { required: 'Ingresa tu contraseña' });
										}}
									/>
									<button
										type='button'
										className='reveal-btn'
										aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
										aria-pressed={reveal}
										onClick={() => setReveal(r => !r)}
									>
										{reveal ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
									</button>
								</div>
								<button type='button' className='auth-link field-reset-link' onClick={() => setForgotPassword(true)}>
									Olvidé mi contraseña
								</button>
								{errors.password && (
									<span className='error-message' role='alert'>
										{errors.password.message}
									</span>
								)}
							</div>
						)}

						<InlineMessage type='error'>{error}</InlineMessage>

						{withPassword ? (
							<button type='submit' className='btn-primary auth-submit' disabled={loading}>
								{loading ? 'Entrando…' : 'Entrar'}
							</button>
						) : (
							<>
								<button type='submit' className='btn-primary auth-submit' disabled={loading}>
									{loading ? 'Enviando…' : 'Enviarme un enlace'}
								</button>
								<p className='auth-helper'>Te llega un correo. Tocas el botón y ya estás dentro.</p>
							</>
						)}
					</form>

					<div className='auth-divider' aria-hidden='true'>
						<span>o</span>
					</div>

					<button
						type='button'
						className='btn-secondary auth-submit'
						onClick={() => {
							setError(null);
							setWithPassword(w => !w);
						}}
					>
						{withPassword ? 'Enviarme un enlace en su lugar' : 'Entrar con mi contraseña'}
					</button>

					<p className='auth-footer'>
						¿No tienes cuenta? <Link to='/inscribirse'>Crea una</Link>
					</p>
				</div>
			</div>

			<ForgotPasswordModal email={email} visible={forgotPassword} setForgotPassword={setForgotPassword} />
		</div>
	);
};

export default Login;
