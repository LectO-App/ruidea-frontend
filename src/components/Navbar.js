import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import auth from '../auth';
import { axiosInstance } from '../axios';

const Navbar = () => {
	useEffect(() => {
		const fetchAPI = async () => {
			const res = await axiosInstance.get('/inscripcion');
			console.log(res);
		};
		fetchAPI();
	}, []);

	window.addEventListener('scroll', function () {
		const nav = document.querySelector('nav');
		if (nav) {
			nav.classList.toggle('nav-scroll', window.pageYOffset > nav.clientHeight);
		}
	});

	return (
		<nav>
			<Link to='/' className='logo-navbar' role='button'>
				RUIDEA
			</Link>
			<div className='links'>
				{window.location.pathname === '/' && (
					<a href='#que-es-ruidea' role='button'>
						¿Qué es RUIDEA?
					</a>
				)}
				{auth.isAuthenticated() ? (
					<Link
						role='button'
						className='btn-cerrar-sesion'
						to='/'
						onClick={() => {
							auth.logout(null);
						}}
					>
						Cerrar sesión
					</Link>
				) : (
					<Link to='/login' className='btn-iniciar-sesion' role='button'>
						Iniciar sesión
					</Link>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
