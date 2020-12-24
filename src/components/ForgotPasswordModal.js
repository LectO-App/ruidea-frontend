import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import Swal from 'sweetalert2';

const ForgotPasswordModal = props => {
	const { visible, setForgotPassword, email } = props;

	const { register, handleSubmit, errors } = useForm();

	const [loading, setLoading] = useState(false);

	const sendForgotPassword = async data => {
		setLoading(true);
		try {
			const res = await axiosInstance.post('/usuario/forgot-password', { email: data.email });

			if (res.status === 200) {
				setForgotPassword(false);
				Swal.fire({
					icon: 'success',
					title: 'Gracias!',
					text: 'Te enviamos un email para que puedas cambiar tu contraseña.',
				});
			}
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Lo sentimos',
				text: 'Hubo un error al enviar su email, por favor intente nuevamente',
			});
		}
		setLoading(false);
	};
	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					exit={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					initial={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className='forgot-password-container'
					onClick={e => setForgotPassword(false)}
				>
					<div className='forgot-password-modal' onClick={e => e.stopPropagation()}>
						<h3 className='title'>¿Olvidaste tu contraseña?</h3>
						<form onSubmit={handleSubmit(sendForgotPassword)} className='input-group'>
							<label htmlFor='email' className='label'>
								Ingrese el email de su cuenta
							</label>
							<input
								type='text'
								id='email'
								name='email'
								className='input'
								defaultValue={email}
								ref={register({
									required: 'Por favor, ingrese el email de su cuenta',
									pattern: {
										value: emailRegex,
										message: 'Por favor ingrese un email válido',
									},
								})}
							/>
							{errors.email && <span className='error-message'>{errors.email.message}</span>}
							<button>{loading ? 'Enviando...' : 'Enviar'}</button>
						</form>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ForgotPasswordModal;
