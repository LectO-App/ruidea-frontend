import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axios';
import LoadingScreen from './LoadingScreen';
import PasaporteValido, { VerificarLayout } from './PasaporteValido';

const Verificar = props => {
	// /verificar/:token (share token) or the legacy /verificar/:nroDocumento/:nroPasaporte.
	const { token, nroPasaporte, nroDocumento } = props.match.params;
	const [usuario, setUsuario] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const requestToAPI = useCallback(async () => {
		setLoading(true);
		const res = await axiosInstance.post(
			token
				? `/usuario/verificar/${encodeURIComponent(token)}`
				: `/usuario/verificar/${nroDocumento}/${nroPasaporte}`
		);
		if (res.data.existe) {
			setUsuario(res.data.usuario);
		} else {
			setError(true);
		}
		setLoading(false);
	}, [token, nroDocumento, nroPasaporte]);

	useEffect(() => {
		requestToAPI();
	}, [requestToAPI]);

	if (loading) return <LoadingScreen />;

	if (error) {
		return (
			<VerificarLayout>
				<section className='verif-card verif-no-encontrado'>
					<h1 className='verif-no-encontrado__titulo'>No encontramos ese Pasaporte DEA</h1>
					<p>
						Revise que el número de pasaporte y el documento sean correctos. Si el problema continúa, vuelva a
						comprobarlo desde el inicio.
					</p>
				</section>
				<Link to='/verificar/numero' className='verif-btn'>
					Comprobar otro pasaporte
				</Link>
				<Link to='/' className='verif-btn verif-btn--ghost'>
					Ir al inicio
				</Link>
			</VerificarLayout>
		);
	}

	return <PasaporteValido pasaporte={usuario} />;
};

export default Verificar;
