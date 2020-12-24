import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../axios';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { Helmet } from 'react-helmet';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

import auth from '../auth';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = props => {
	const cookies = new Cookies();
	const { register, handleSubmit, errors } = useForm();
	const [loading, setLoading] = useState(false);

	const [email, setEmail] = useState('');

	// eslint-disable-next-line
	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	const [forgotPassword, setForgotPassword] = useState(false);

	const loginSuccess = async data => {
		setLoading(true);
		try {
			const res = await axiosInstance.post(`/usuario/login`, data);
			auth.login(() => {
				cookies.set('logged-in', true, { path: '/', expires: 0 });
				cookies.set('id', res.data.usuario._id, { path: '/', expires: 0 });
				props.history.push('/dashboard');
			});
		} catch (err) {
			console.log(err.request);
			Swal.fire({
				icon: 'error',
				title: 'Email y/o contraseña incorrecta',
				text: 'Revise que haya ingresado correctamente los datos y pruebe nuevamente.',
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
						Iniciar Sesión | RUIDEA - Registro Único Iberoamericano de Personas con Dificultades Específicas del
						Aprendizaje
					</title>
					{/* <link rel="canonical" href="http://mysite.com/example" /> */}
				</Helmet>
			</Helmet>
			<Link className='cross' to='/'></Link>
			<form className='login-form' onSubmit={handleSubmit(loginSuccess)}>
				<h1 className='titulo-iniciar-sesion'>Iniciar sesión</h1>
				<div className='form-group'>
					<label htmlFor='email'>Correo electrónico</label>
					<input
						type='text'
						name='user'
						id='user'
						onChange={e => setEmail(e.target.value)}
						ref={register({
							required: 'Por favor, ingrese un correo electrónico',
							pattern: {
								message: 'Por favor, ingrese un correo electrónico o número de pasaporte válido',
								value: emailRegex,
							},
						})}
					/>
					{errors.email && <span className='error-message'>{errors.email.message}</span>}
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
					<p className='olvide-contraseña' onClick={setForgotPassword}>
						Olvidé mi contraseña
					</p>
				</div>
				<button className='btn-iniciar-sesión'>{loading ? 'Cargando...' : 'Iniciar sesión'}</button>
			</form>
			<ForgotPasswordModal email={email} visible={forgotPassword} setForgotPassword={setForgotPassword} />
		</motion.div>
	);
};

export default Login;
