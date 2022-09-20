import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axios';
import LoadingScreen from './LoadingScreen';
import { motion } from 'framer-motion';

import logoDisfam from '../img/webp/logo-disfam.webp';
import logoDisfamPNG from '../img/png/logo-disfam.png';

import logoRuidea from '../img/svg/logo-ruidea.svg';
import logoRuideaPNG from '../img/png/logo-ruidea.png';
import { capitalizedDiagnostic } from '../util/capitalize';

const Verificar = props => {
	const { nroPasaporte, nroDocumento } = props.match.params;
	const [usuario, setUsuario] = useState({});
	const [loading, setLoading] = useState(true);
	const [fecha, setFecha] = useState('');
	const [diagnostico, setDiagnostico] = useState('');
	const [error, setError] = useState(false);
	const [nuevoPasaporte, setNuevoPasaporte] = useState('');

	const requestToAPI = useCallback(async () => {
		setLoading(true);
		const res = await axiosInstance.post(`/usuario/verificar/${nroDocumento}/${nroPasaporte}`);
		if (res.data.existe) {
			setUsuario(res.data.usuario);
		} else {
			setError(true);
		}
		if (res.data.usuario) {
			const string = new Date(Date.parse(res.data.usuario.fechaNacimiento)).toISOString().split('-');

			setFecha(`${string[2].split('T')[0]}/${string[1]}/${string[0]}`);
			const diagnostico = Object.entries(res.data.usuario.diagnostico)
				.filter(([k, v]) => v)
				.map(([k, v]) => capitalizedDiagnostic(k))
				.join(', ');

			setDiagnostico(diagnostico);

			const numeroPasaporte = res.data.usuario.numeroPasaporte.toString();
			let txt = '0000000'.split('');
			txt.splice(-txt.length - numeroPasaporte.length, numeroPasaporte.length);
			numeroPasaporte.length === 1
				? txt.push(numeroPasaporte)
				: numeroPasaporte.split('').forEach(item => txt.push(item));
			setNuevoPasaporte(txt.join(''));
		}

		setLoading(false);
	}, [nroDocumento, nroPasaporte]);

	useEffect(() => {
		requestToAPI();
	}, [requestToAPI]);

	return (
		<motion.div
			exit={{ transform: 'translateX(100vw)' }}
			animate={{ transform: 'translateX(0vw)' }}
			initial={{ transform: 'translateX(100vw)' }}
		>
			{error && (
				<div className='error-screen'>
					<h1>
						No se encontró un usuario con ese documento. Por favor revise que haya ingresado los datos correctamente.
					</h1>
					<Link to='/'>Ir al inicio</Link>
				</div>
			)}
			{loading && <LoadingScreen />}
			<header className='header-verificar'>
				<p className='pais'>{usuario.paisResidencia}</p>
				<h1>PASAPORTE DEA</h1>
				<a href='https://disfam.org' target='_blank' rel='noopener noreferrer'>
					<picture>
						<source srcSet={logoDisfam} type='image/webp' />
						<img src={logoDisfamPNG} alt='Ícono Disfam' className='logo-disfam' />
					</picture>
				</a>
			</header>

			<main className='main-verificar'>
				<h2 className='pasaporte'>Pasaporte N° {nuevoPasaporte}</h2>
				<div className='flex'>
					<div className='container-logo-ruidea'>
						<picture>
							<source srcSet={logoRuidea} type='image/svg+xml' />
							<img src={logoRuideaPNG} alt='Logo RUIDEA' className='logo-ruidea' />
						</picture>
					</div>
					<div className='container-datos'>
						<div className='texto-main'>
							<h1>
								{usuario.nombre} {usuario.apellidos}
							</h1>
							<h3>{fecha}</h3>
							<h2>{usuario.numeroDocumento}</h2>
							<h4>{diagnostico}</h4>
						</div>
					</div>
				</div>
				<h2 className='desarrollado-por-lecto'>
					Sistema desarrollado por el equipo de{' '}
					<a href='https://lecto.app' target='_blank' rel='noopener noreferrer'>
						LectO
					</a>
				</h2>
			</main>
			<footer className='footer-verificar'>
				<p>
					Rogamos tengan en consideración las circunstancias que concurren en la persona portadora de este documento,
					asi cómo los derechos recogidos en la legislación vigente
				</p>
			</footer>
		</motion.div>
	);
};

export default Verificar;
