import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { axiosInstance } from '../axios';

const ChangePassword = props => {
	const { register, handleSubmit, errors } = useForm();
	const [contraseña, setContraseña] = useState('');
	const [loading, setLoading] = useState(false);

	const sendPasswords = async data => {
		setLoading(true);
		const token = props.match.params.token;
		const { password } = data;
		try {
			const res = await axiosInstance.post('/usuario/change-password', { password, token });
			if (res.status === 200) {
				Swal.fire({
					icon: 'success',
					title: 'Listo!',
					text: 'Ya puede iniciar sesión con su nueva contraseña',
					onAfterClose: () => props.history.push('/login'),
				});
			}
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Lo sentimos',
				text: 'Hubo un error al cambiar tu contraseña, por favor intente nuevamente',
			});
		}
		setLoading(false);
	};

	return (
		<div className='change-password-container'>
			<form onSubmit={handleSubmit(sendPasswords)}>
				<h1>Cambie su contraseña</h1>
				<div className='form-group'>
					<label htmlFor='contraseña'>Contraseña</label>
					<input
						type='password'
						name='password'
						id='password'
						ref={register({
							required: 'Por favor, rellene este campo',
							pattern: {
								value: /^(?=.*[a-z])(?=.*\d).{8,}$/,
								message: 'Por favor ingrese una contraseña con al menos 8 caracteres y un número',
							},
						})}
						onChange={e => {
							setContraseña(e.target.value);
						}}
					/>
					{errors.password && <span className='error-message'>{errors.password.message}</span>}
				</div>
				<div className='form-group'>
					<label htmlFor='verificarPassword'>Verificar contraseña</label>

					<input
						type='password'
						name='verificarPassword'
						id='verificarPassword'
						ref={register({
							required: 'Por favor, rellene este campo',
							pattern: {
								value: /^(?=.*[a-z])(?=.*\d).{8,}$/,
								message: 'Por favor ingrese una contraseña válida',
							},
							validate: value => value === contraseña || 'Las contraseñas no coinciden.',
						})}
					/>
					{errors.verificarPassword && <span className='error-message'>{errors.verificarPassword.message}</span>}
				</div>
				<button>{loading ? 'Enviando...' : 'Enviar'}</button>
			</form>
		</div>
	);
};

export default ChangePassword;
