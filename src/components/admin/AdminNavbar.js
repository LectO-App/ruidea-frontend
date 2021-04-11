import React from 'react';

import AdminAuth from './adminAuth';

const AdminNavbar = props => {
	window.addEventListener('scroll', function () {
		const nav = document.querySelector('nav');
		if (nav) {
			nav.classList.toggle('nav-scroll', window.pageYOffset > nav.clientHeight);
		}
	});
	return (
		<nav>
			<h2 className='logo-navbar'>Ruidea</h2>
			{AdminAuth.isAuthenticated() && (
				<div className='links'>
					<p
						className='btn-cerrar-sesion'
						onClick={() => {
							props.cerrarSesion();
						}}
					>
						Cerrar sesión
					</p>
				</div>
			)}
		</nav>
	);
};

export default AdminNavbar;
