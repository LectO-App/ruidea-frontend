import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BsChevronLeft, BsDownload, BsBoxArrowUpRight, BsArrowRepeat, BsCheckCircle } from 'react-icons/bs';

import { axiosInstance } from '../axios';
import { clearCsrf } from '../csrf';
import { passportUrl } from '../util/passport';
import { downloadMisDatos, aperturasTexto } from '../util/misDatos';
import { toast } from './ui/toast';
import InlineMessage from './ui/InlineMessage';
import LoadingScreen from './LoadingScreen';
import Navbar from './Navbar';

import '../css/registration.scss';
import '../css/misDatos.scss';

const CHIP = {
	enlace: { label: 'en tu enlace', className: 'md-chip md-chip--enlace' },
	equipo: { label: 'solo el equipo', className: 'md-chip md-chip--equipo' },
};

const Chip = ({ visibilidad }) => <span className={CHIP[visibilidad].className}>{CHIP[visibilidad].label}</span>;

const Bloque = ({ numero, titulo, children }) => (
	<section className='md-block' aria-labelledby={`md-block-${numero}`}>
		<h2 className='md-block-title' id={`md-block-${numero}`}>
			<span className='md-num' aria-hidden='true'>
				{numero}
			</span>
			{titulo}
		</h2>
		{children}
	</section>
);

// A real switch: a button with role=switch whose state is aria-checked, named by its label.
const Interruptor = ({ checked, disabled, onChange, labelId, hintId }) => (
	<button
		type='button'
		role='switch'
		aria-checked={checked}
		aria-labelledby={labelId}
		aria-describedby={hintId}
		className='md-switch'
		disabled={disabled}
		onClick={() => onChange(!checked)}
	>
		<span className='md-switch-track' aria-hidden='true'>
			<span className='md-switch-thumb' />
		</span>
		<span className='md-switch-state' aria-hidden='true'>
			{checked ? 'Sí' : 'No'}
		</span>
	</button>
);

const DescargarBoton = ({ className = 'btn-secondary' }) => {
	const [descargando, setDescargando] = useState(false);
	const [error, setError] = useState(null);
	const descargar = async () => {
		setDescargando(true);
		setError(null);
		try {
			await downloadMisDatos();
		} catch (err) {
			setError('No pudimos preparar tu copia. Inténtalo de nuevo en un momento.');
		} finally {
			setDescargando(false);
		}
	};
	return (
		<>
			<button type='button' className={className} onClick={descargar} disabled={descargando}>
				{descargando ? <span className='btn-spinner' aria-hidden='true' /> : <BsDownload aria-hidden='true' />}
				{descargando ? 'Preparando tu copia…' : 'Descargar mis datos'}
			</button>
			<InlineMessage type='error'>{error}</InlineMessage>
		</>
	);
};

const VistaDatos = ({ usuario, datos, onComunicaciones, guardando, errorComunicaciones, onBorrar }) => {
	const conEnlace = datos.estado === 'aceptado' && Boolean(datos.enlace);
	const n = conEnlace ? 1 : 0;
	return (
		<>
			<Link className='md-back' to='/dashboard'>
				<BsChevronLeft aria-hidden='true' /> Volver a mi panel
			</Link>
			<h1 className='md-title' tabIndex={-1}>
				Mis datos
			</h1>
			<p className='md-lead'>Son tuyos. Aquí ves lo que guardamos, para qué, y puedes descargarlo o borrarlo.</p>

			<Bloque numero={1} titulo='Lo que guardamos'>
				<p className='md-text'>
					<Chip visibilidad='enlace' /> lo ve quien abre tu enlace o tu código QR. <Chip visibilidad='equipo' /> lo ven
					solo las personas de RUIDEA que revisan las solicitudes.
				</p>
				<ul className='md-groups'>
					{datos.grupos.map(grupo => (
						<li key={grupo.clave} className='md-group'>
							<div className='md-group-head'>
								<h3>{grupo.titulo}</h3>
								<Chip visibilidad={grupo.visibilidad} />
							</div>
							<dl>
								{grupo.campos.map(campo => (
									<div key={campo.clave} className='md-row'>
										<dt>{campo.etiqueta}</dt>
										<dd>{campo.valor}</dd>
									</div>
								))}
							</dl>
						</li>
					))}
				</ul>
			</Bloque>

			{conEnlace && (
				<Bloque numero={2} titulo='Tu enlace'>
					<p className='md-text'>{aperturasTexto(datos.enlace)}</p>
					<a className='btn-secondary' href={passportUrl(usuario)} target='_blank' rel='noopener noreferrer'>
						<BsBoxArrowUpRight aria-hidden='true' /> Ver lo que ven ellos
					</a>
				</Bloque>
			)}

			<Bloque numero={2 + n} titulo='Correos de DISFAM'>
				<div className='md-switch-row'>
					<div>
						<span className='md-switch-label' id='md-noticias'>
							Noticias y novedades
						</span>
						<p className='md-hint' id='md-noticias-hint'>
							Los avisos de tu solicitud te llegan igual.
						</p>
					</div>
					<Interruptor
						checked={datos.aceptoRecibirInfo}
						disabled={guardando}
						onChange={onComunicaciones}
						labelId='md-noticias'
						hintId='md-noticias-hint'
					/>
				</div>
				<InlineMessage type='error'>{errorComunicaciones}</InlineMessage>
			</Bloque>

			<Bloque numero={3 + n} titulo='Una copia para ti'>
				<p className='md-text'>
					Te bajas un archivo ZIP con un PDF fácil de leer, tus datos en datos.json y los documentos que subiste.
				</p>
				<DescargarBoton />
			</Bloque>

			<Bloque numero={4 + n} titulo='Borrar mi cuenta'>
				<p className='md-text'>Borra tus datos y tus documentos. Tu pasaporte deja de funcionar.</p>
				<button type='button' className='md-btn-danger-outline' onClick={onBorrar}>
					Borrar mi cuenta…
				</button>
			</Bloque>
		</>
	);
};

const VistaConfirmar = ({ estado, onCancelar, onConfirmar, borrando, errorBorrar }) => (
	<>
		<h1 className='md-title' tabIndex={-1}>
			¿Borrar tu cuenta?
		</h1>
		<button type='button' className='btn-primary md-keep' onClick={onCancelar}>
			No, quiero mantener mi cuenta
		</button>

		<section className='md-block' aria-labelledby='md-consecuencias'>
			<h2 className='md-block-title' id='md-consecuencias'>
				Si la borras, pasa esto:
			</h2>
			<ol className='md-steps'>
				<li>Borramos tus datos y tu informe. No se pueden recuperar.</li>
				<li>
					{estado === 'aceptado'
						? 'Tu pasaporte, su código QR y su enlace dejan de funcionar. Quien los abra verá «no encontrado».'
						: 'Tu solicitud se cancela. Nadie la va a revisar.'}
				</li>
				<li>Te enviamos un correo para confirmar que tu cuenta está borrada.</li>
				<li>Más adelante puedes volver a solicitar tu Pasaporte DEA.</li>
			</ol>
		</section>

		<div className='md-offer'>
			<p>Antes de borrar, puedes guardar una copia de tus datos.</p>
			<DescargarBoton />
		</div>

		<div className='md-danger-zone'>
			<button type='button' className='md-btn-danger' onClick={onConfirmar} disabled={borrando}>
				{borrando && <span className='btn-spinner' aria-hidden='true' />}
				Sí, borrar mi cuenta
			</button>
			<InlineMessage type='error'>{errorBorrar}</InlineMessage>
		</div>
	</>
);

const VistaBorrada = () => (
	<section className='md-block md-done'>
		<span className='md-done-icon' aria-hidden='true'>
			<BsCheckCircle size={36} />
		</span>
		<h1 className='md-title' tabIndex={-1}>
			Tu cuenta está borrada
		</h1>
		<p className='md-text'>Borramos tus datos y tus documentos. Te enviamos un correo para confirmarlo.</p>
		<p className='md-text'>Si algún día quieres tu Pasaporte DEA, puedes volver a solicitarlo.</p>
		<Link className='btn-primary md-keep' to='/'>
			Ir a la página de inicio
		</Link>
	</section>
);

const MisDatos = () => {
	const [usuario, setUsuario] = useState(null);
	const [datos, setDatos] = useState(null);
	const [error, setError] = useState(false);
	const [vista, setVista] = useState('datos'); // 'datos' | 'confirmar' | 'borrada'
	const [guardando, setGuardando] = useState(false);
	const [errorComunicaciones, setErrorComunicaciones] = useState(null);
	const [borrando, setBorrando] = useState(false);
	const [errorBorrar, setErrorBorrar] = useState(null);
	const shell = useRef(null);
	const firstView = useRef(true);

	const cargar = useCallback(async () => {
		setError(false);
		try {
			const [me, misDatos] = await Promise.all([
				axiosInstance.get('/usuario/me'),
				axiosInstance.get('/usuario/me/datos'),
			]);
			setUsuario(me.data);
			setDatos(misDatos.data);
		} catch (err) {
			setError(true);
		}
	}, []);

	useEffect(() => {
		cargar();
	}, [cargar]);

	// Each view starts at its title, for keyboard and screen-reader users too.
	useEffect(() => {
		if (firstView.current) {
			firstView.current = false;
			return;
		}
		const title = shell.current && shell.current.querySelector('.md-title');
		if (title) title.focus();
	}, [vista]);

	const cambiarComunicaciones = async aceptoRecibirInfo => {
		setGuardando(true);
		setErrorComunicaciones(null);
		try {
			const res = await axiosInstance.patch('/usuario/me/comunicaciones', { aceptoRecibirInfo });
			setDatos(d => ({ ...d, aceptoRecibirInfo: res.data.aceptoRecibirInfo }));
			toast.success(
				res.data.aceptoRecibirInfo ? 'Te enviaremos noticias y novedades.' : 'Ya no te enviaremos noticias.',
			);
		} catch (err) {
			setErrorComunicaciones('No pudimos guardar el cambio. Inténtalo de nuevo.');
		} finally {
			setGuardando(false);
		}
	};

	const borrarCuenta = async () => {
		setBorrando(true);
		setErrorBorrar(null);
		try {
			await axiosInstance.delete('/usuario/me');
			clearCsrf();
			setVista('borrada');
		} catch (err) {
			setErrorBorrar('No pudimos borrar tu cuenta. Inténtalo de nuevo en un momento.');
			setBorrando(false);
		}
	};

	if (vista !== 'borrada' && !datos && !error) return <LoadingScreen />;

	return (
		<div className='dashboard-div-main'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Mis datos | RUIDEA</title>
			</Helmet>
			{/* A new Navbar after the deletion checks the session again, so it shows the signed-out links. */}
			<Navbar key={vista === 'borrada' ? 'fuera' : 'dentro'} />
			<main className='dash md'>
				<div className='md-shell' ref={shell}>
					{vista === 'borrada' ? (
						<VistaBorrada />
					) : error ? (
						<section className='md-block'>
							<h1 className='md-title'>No pudimos cargar tus datos</h1>
							<p className='md-text'>Revisa tu conexión e inténtalo de nuevo.</p>
							<button type='button' className='btn-primary md-keep' onClick={cargar}>
								<BsArrowRepeat aria-hidden='true' /> Reintentar
							</button>
						</section>
					) : vista === 'confirmar' ? (
						<VistaConfirmar
							estado={datos.estado}
							onCancelar={() => setVista('datos')}
							onConfirmar={borrarCuenta}
							borrando={borrando}
							errorBorrar={errorBorrar}
						/>
					) : (
						<VistaDatos
							usuario={usuario}
							datos={datos}
							onComunicaciones={cambiarComunicaciones}
							guardando={guardando}
							errorComunicaciones={errorComunicaciones}
							onBorrar={() => setVista('confirmar')}
						/>
					)}
				</div>
			</main>
		</div>
	);
};

export default MisDatos;
