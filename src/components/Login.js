import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import ForgotPasswordModal from './ForgotPasswordModal';
import InlineMessage from './ui/InlineMessage';

import '../css/registration.scss';

const Login = props => {
	const { register, handleSubmit, errors } = useForm({ mode: 'onBlur' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reveal, setReveal] = useState(false);

	const [email, setEmail] = useState('');

	// eslint-disable-next-line
	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	const [forgotPassword, setForgotPassword] = useState(false);

	const loginSuccess = async data => {
		setLoading(true);
		setError(null);
		try {
			// Session + CSRF cookies are set by the server; nothing to store client-side.
			await axiosInstance.post(`/usuario/login`, data);
			props.history.push('/dashboard');
		} catch (err) {
			setError('Email y/o contraseña incorrecta. Revisa los datos e inténtalo de nuevo.');
		}
		setLoading(false);
	};

	return (
		<div className='reg auth'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Iniciar sesión | RUIDEA</title>
			</Helmet>

			<Link className='reg-close' to='/' aria-label='Volver al inicio' role='button' />

			<div className='auth-shell'>
				<div className='reg-step auth-card'>
					<header className='auth-head'>
						<h1 className='auth-title'>Iniciar sesión</h1>
						<p className='auth-sub'>Accede a tu cuenta de RUIDEA.</p>
					</header>

					<form className='step-form' onSubmit={handleSubmit(loginSuccess)} noValidate>
						<div className={`field${errors.user ? ' has-error' : ''}`}>
							<label htmlFor='user'>Correo electrónico</label>
							<input
								type='email'
								name='user'
								id='user'
								inputMode='email'
								autoComplete='email'
								aria-invalid={errors.user ? 'true' : 'false'}
								onChange={e => setEmail(e.target.value)}
								ref={register({
									required: 'Ingresa tu correo electrónico',
									pattern: { value: emailRegex, message: 'Revisa el correo, parece incompleto' },
								})}
							/>
							{errors.user && (
								<span className='error-message' role='alert'>
									{errors.user.message}
								</span>
							)}
						</div>

						{/* Grid layout (field--with-link) lets the "Olvidé mi contraseña" button sit visually
						    top-right of the label while living AFTER the password input in the DOM, so Tab
						    flows email → password → reveal → forgot instead of stopping on the link mid-form. */}
						<div className={`field field--with-link${errors.password ? ' has-error' : ''}`}>
							<label htmlFor='password'>Contraseña</label>
							<div className='password-wrapper'>
								<input
									type={reveal ? 'text' : 'password'}
									name='password'
									id='password'
									autoComplete='current-password'
									aria-invalid={errors.password ? 'true' : 'false'}
									ref={register({ required: 'Ingresa tu contraseña' })}
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

						<InlineMessage type='error'>{error}</InlineMessage>

						<button type='submit' className='btn-primary auth-submit' disabled={loading}>
							{loading ? 'Entrando…' : 'Iniciar sesión'}
						</button>
					</form>

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
