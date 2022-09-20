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

	const [passportNumber, setPassportNumber] = useState('');
	const [documentNumber, setDocumentNumber] = useState('');

	const handleSuccess = async data => {
		setLoading(true);
		try {
			const res = await axiosInstance.post(`/usuario/verificarCheckPassword`, data);
			if (res.data.correcto) {
				props.history.push('/verificar/' + documentNumber + '/' + passportNumber);
			} else {
				throw new Error();
			}
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Contraseña incorrecta',
				text: 'Revise que haya ingresado correctamente la contraseña y pruebe nuevamente.',
			});
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
						Verificar pasaporte | RUIDEA - Registro Único Iberoamericano de Personas con Dificultades Específicas del
						Aprendizaje
					</title>
				</Helmet>
			</Helmet>
			<Link className='cross' to='/'></Link>
			<form className='login-form' onSubmit={handleSubmit(handleSuccess)}>
				<h1 className='titulo-iniciar-sesion'>Verificar pasaporte</h1>
				<div className='form-group'>
					<label htmlFor='email'>Número de documento</label>
					<input
						type='text'
						name='document'
						id='document'
						onChange={e => setDocumentNumber(e.target.value)}
						ref={register({ required: 'Por favor, ingrese un documento válido' })}
					/>
					{errors.document && <span className='error-message'>{errors.document.message}</span>}
				</div>
				<div className='form-group'>
					<label htmlFor='email'>Número de pasaporte RUIDEA</label>
					<input
						type='text'
						name='passport'
						id='passport'
						onChange={e => setPassportNumber(e.target.value)}
						ref={register({ required: 'Por favor, ingrese un pasaporte RUIDEA válido' })}
					/>
					{errors.passport && <span className='error-message'>{errors.passport.message}</span>}
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
