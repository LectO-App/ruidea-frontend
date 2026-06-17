import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { axiosInstance } from '../axios';

import { toast } from './ui/toast';
import InlineMessage from './ui/InlineMessage';

import '../css/registration.scss';

const ChangePassword = props => {
	const { register, handleSubmit, errors } = useForm({ mode: 'onBlur' });
	const [contraseña, setContraseña] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reveal, setReveal] = useState(false);
	const [revealVerify, setRevealVerify] = useState(false);

	const passwordRule = /^(?=.*[a-z])(?=.*\d).{8,}$/;

	const sendPasswords = async data => {
		setLoading(true);
		setError(null);
		const token = props.match.params.token;
		const { password } = data;
		try {
			const res = await axiosInstance.post('/usuario/change-password', { password, token });
			if (res.status === 200) {
				// The redirect to /login is the real confirmation; the toast just acknowledges.
				toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
				props.history.push('/login');
			}
		} catch (err) {
			setError('Hubo un error al cambiar tu contraseña, por favor intenta nuevamente.');
		}
		setLoading(false);
	};

	return (
		<div className='reg auth'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Cambiar contraseña | RUIDEA</title>
			</Helmet>

			<Link className='reg-close' to='/' aria-label='Volver al inicio' role='button' />

			<div className='auth-shell'>
				<div className='reg-step auth-card'>
					<header className='auth-head'>
						<h1 className='auth-title'>Cambia tu contraseña</h1>
						<p className='auth-sub'>Elige una contraseña nueva para tu cuenta.</p>
					</header>

					<form className='step-form' onSubmit={handleSubmit(sendPasswords)} noValidate>
						<div className={`field${errors.password ? ' has-error' : ''}`}>
							<label htmlFor='password'>Nueva contraseña</label>
							<p className='field-hint'>Al menos 8 caracteres y un número.</p>
							<div className='password-wrapper'>
								<input
									type={reveal ? 'text' : 'password'}
									name='password'
									id='password'
									autoComplete='new-password'
									aria-invalid={errors.password ? 'true' : 'false'}
									ref={register({
										required: 'Por favor, crea una contraseña',
										pattern: {
											value: passwordRule,
											message: 'Usa al menos 8 caracteres y un número',
										},
									})}
									onChange={e => setContraseña(e.target.value)}
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
							{errors.password && (
								<span className='error-message' role='alert'>
									{errors.password.message}
								</span>
							)}
						</div>

						<div className={`field${errors.verificarPassword ? ' has-error' : ''}`}>
							<label htmlFor='verificarPassword'>Repite la contraseña</label>
							<div className='password-wrapper'>
								<input
									type={revealVerify ? 'text' : 'password'}
									name='verificarPassword'
									id='verificarPassword'
									autoComplete='new-password'
									aria-invalid={errors.verificarPassword ? 'true' : 'false'}
									ref={register({
										required: 'Por favor, repite la contraseña',
										validate: value => value === contraseña || 'Las contraseñas no coinciden.',
									})}
								/>
								<button
									type='button'
									className='reveal-btn'
									aria-label={revealVerify ? 'Ocultar contraseña' : 'Mostrar contraseña'}
									aria-pressed={revealVerify}
									onClick={() => setRevealVerify(r => !r)}
								>
									{revealVerify ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
								</button>
							</div>
							{errors.verificarPassword && (
								<span className='error-message' role='alert'>
									{errors.verificarPassword.message}
								</span>
							)}
						</div>

						<InlineMessage type='error'>{error}</InlineMessage>

						<button type='submit' className='btn-primary auth-submit' disabled={loading}>
							{loading ? 'Guardando…' : 'Guardar contraseña'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChangePassword;
