import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';

import Modal from './ui/Modal';
import { toast } from './ui/toast';
import InlineMessage from './ui/InlineMessage';

const ForgotPasswordModal = props => {
	const { visible, setForgotPassword, email } = props;

	const { register, handleSubmit, errors } = useForm();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// eslint-disable-next-line
	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	const close = () => setForgotPassword(false);

	const sendForgotPassword = async data => {
		setLoading(true);
		setError(null);
		try {
			const res = await axiosInstance.post('/usuario/forgot-password', { email: data.email });

			if (res.status === 200) {
				// Close the modal; a toast confirms since the page itself doesn't change.
				close();
				toast.success('Te enviamos un email para que puedas cambiar tu contraseña.');
			}
		} catch (err) {
			setError('Hubo un error al enviar su email, por favor intente nuevamente.');
		}
		setLoading(false);
	};

	return (
		<Modal open={visible} onClose={close} title='¿Olvidaste tu contraseña?'>
			<form onSubmit={handleSubmit(sendForgotPassword)} className='auth-modal-form' noValidate>
				<p className='auth-sub'>
					Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
				</p>

				<div className={`field${errors.email ? ' has-error' : ''}`}>
					<label htmlFor='forgot-email'>Correo electrónico</label>
					<input
						type='email'
						id='forgot-email'
						name='email'
						inputMode='email'
						autoComplete='email'
						defaultValue={email}
						aria-invalid={errors.email ? 'true' : 'false'}
						ref={register({
							required: 'Ingresa el correo de tu cuenta',
							pattern: { value: emailRegex, message: 'Por favor ingresa un correo válido' },
						})}
					/>
					{errors.email && (
						<span className='error-message' role='alert'>
							{errors.email.message}
						</span>
					)}
				</div>

				<InlineMessage type='error'>{error}</InlineMessage>

				<div className='modal-actions'>
					<button type='button' className='btn-secondary' onClick={close}>
						Cancelar
					</button>
					<button type='submit' className='btn-primary' disabled={loading}>
						{loading ? 'Enviando…' : 'Enviar enlace'}
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default ForgotPasswordModal;
