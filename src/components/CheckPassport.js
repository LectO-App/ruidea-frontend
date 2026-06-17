import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import InlineMessage from './ui/InlineMessage';

import '../css/registration.scss';

const CheckPassport = props => {
	const { register, handleSubmit, errors } = useForm({ mode: 'onBlur' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reveal, setReveal] = useState(false);

	const handleSuccess = async data => {
		setLoading(true);
		setError(null);
		try {
			const res = await axiosInstance.post(`/usuario/verificarCheckPassword`, data);
			props.history.push('/verificar/' + res.data.documento + '/' + data.pasaporte);
		} catch (err) {
			// The server returns an identical response for wrong-password and not-found so
			// neither can be probed (§10.4); show a single combined message.
			setError(
				'No se pudo verificar. Revisa el número de Pasaporte DEA y la clave de verificación, e inténtalo de nuevo.'
			);
		}

		setLoading(false);
	};

	return (
		<div className='reg auth'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Verificar Pasaporte DEA | RUIDEA</title>
			</Helmet>

			<Link className='reg-close' to='/' aria-label='Volver al inicio' role='button' />

			<div className='auth-shell'>
				<div className='reg-step auth-card'>
					<header className='auth-head'>
						<h1 className='auth-title'>Verificar Pasaporte DEA</h1>
						<p className='auth-sub'>
							Para administraciones y autoridades. Confirma la autenticidad de un Pasaporte DEA con su número y la
							clave de verificación que te facilitamos.
						</p>
					</header>

					<form className='step-form' onSubmit={handleSubmit(handleSuccess)} noValidate>
						<div className={`field${errors.pasaporte ? ' has-error' : ''}`}>
							<label htmlFor='pasaporte'>Número de Pasaporte DEA</label>
							<input
								type='text'
								name='pasaporte'
								id='pasaporte'
								inputMode='numeric'
								aria-invalid={errors.pasaporte ? 'true' : 'false'}
								ref={register({ required: 'Ingresa un número de Pasaporte DEA' })}
							/>
							{errors.pasaporte && (
								<span className='error-message' role='alert'>
									{errors.pasaporte.message}
								</span>
							)}
						</div>

						<div className={`field${errors.password ? ' has-error' : ''}`}>
							<label htmlFor='password'>Clave de verificación</label>
							<div className='password-wrapper'>
								<input
									type={reveal ? 'text' : 'password'}
									name='password'
									id='password'
									autoComplete='off'
									aria-invalid={errors.password ? 'true' : 'false'}
									ref={register({ required: 'Ingresa la clave de verificación' })}
								/>
								<button
									type='button'
									className='reveal-btn'
									aria-label={reveal ? 'Ocultar la clave' : 'Mostrar la clave'}
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

						<InlineMessage type='error'>{error}</InlineMessage>

						<button type='submit' className='btn-primary auth-submit' disabled={loading}>
							{loading ? 'Verificando…' : 'Validar'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CheckPassport;
