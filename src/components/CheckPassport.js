import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const CheckPassport = props => {
	const { register, handleSubmit, errors } = useForm();
	const [loading, setLoading] = useState(false);

	const handleSuccess = async data => {
		setLoading(true);
		try {
			const res = await axiosInstance.post(`/usuario/verificarCheckPassword`, data);
			props.history.push('/verificar/' + res.data.documento + '/' + data.pasaporte);
		} catch (err) {
			if (err.response.data.existe === false) {
				Swal.fire({
					icon: 'error',
					title: 'Usuario no encontrado',
					text: 'Revise que haya ingresado correctamente el número de Pasaporte DEA y pruebe nuevamente.',
				});
			} else if (err.response.data.correcto === false) {
				Swal.fire({
					icon: 'error',
					title: 'Contraseña incorrecta',
					text: 'Revise que haya ingresado correctamente la contraseña y pruebe nuevamente.',
				});
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Lo sentimos',
					text: 'Ha ocurrido un error, por favor intente nuevamente.',
				});
			}
		}

		setLoading(false);
	};

	return (
		<motion.div
			exit={{ transform: 'translateX(100vw)' }}
			animate={{ transform: 'translateX(0vw)' }}
			initial={{ transform: 'translateX(100vw)' }}
		>
			<Helmet>
				<Helmet>
					<meta charSet='utf-8' />
					<title>
						Verificar Pasaporte DEA | RUIDEA - Registro Único Iberoamericano de Personas con Dificultades Específicas
						del Aprendizaje
					</title>
				</Helmet>
			</Helmet>
			<Link className='cross' to='/'></Link>
			<form className='login-form' onSubmit={handleSubmit(handleSuccess)}>
				<h1 className='titulo-iniciar-sesion'>Verificar Pasaporte DEA</h1>
				<div className='form-group'>
					<label htmlFor='email'>Número de Pasaporte DEA</label>
					<input
						type='text'
						name='pasaporte'
						id='pasaporte'
						ref={register({ required: 'Por favor, ingrese un número de Pasaporte DEA válido' })}
					/>
					{errors.pasaporte && <span className='error-message'>{errors.pasaporte.message}</span>}
				</div>
				<div className='form-group'>
					<label htmlFor='password'>Contraseña</label>
					<input
						type='password'
						name='password'
						id='password'
						ref={register({ required: 'Por favor, ingrese una contraseña' })}
					/>
					{errors.password && <span className='error-message'>{errors.password.message}</span>}
				</div>
				<button className='btn-iniciar-sesión'>{loading ? 'Cargando...' : 'Validar'}</button>
			</form>
		</motion.div>
	);
};

export default CheckPassport;
