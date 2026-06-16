import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
	BsAward,
	BsClock,
	BsClipboard,
	BsXCircle,
	BsEnvelope,
	BsDownload,
	BsLink45Deg,
	BsBoxArrowUpRight,
	BsArrowRepeat,
	BsCheckCircle,
} from 'react-icons/bs';

import { toast } from './ui/toast';
import Modal from './ui/Modal';
import InlineMessage from './ui/InlineMessage';
import StatusSteps from './StatusSteps';

import logoLecto from '../img/webp/logo-lecto.webp';
import logoLectoPNG from '../img/png/logo-lecto.png';
import logoDisfam from '../img/webp/logo-disfam.webp';
import logoDisfamPNG from '../img/png/logo-disfam.png';

import DashboardSkeleton from './DashboardSkeleton';

import Navbar from './Navbar';
import { getFileFromServer } from '../util/getFileFromServer';

import '../css/registration.scss';

// Soporte / contacto address shown on the rejection state.
const SUPPORT_EMAIL = 'pasaporte@dea.ong';

// "Where am I?" steps for the waiting state. The first is already done by the time the
// user reaches the dashboard; review is the active stage. No dates — review is volunteer
// work, so we orient without ever promising a timeline.
const PENDING_STEPS = [
	{
		key: 'recibida',
		icon: BsCheckCircle,
		title: 'Solicitud recibida',
		desc: 'Tenemos tu solicitud y tus documentos.',
	},
	{
		key: 'revision',
		icon: BsClipboard,
		title: 'Revisión médica',
		desc: 'Un especialista la revisará y te avisaremos por correo en cuanto haya novedades.',
	},
	{
		key: 'emitido',
		icon: BsAward,
		title: 'Pasaporte emitido',
		desc: 'Cuando se apruebe, podrás descargar y compartir tu Pasaporte DEA.',
	},
];

// What each application state means to the user, plus the tone used to colour the status
// badge. Keeps the JSX a single lookup instead of a four-way switch.
const STATUS = {
	aceptado: {
		tone: 'ok',
		Icon: BsAward,
		title: 'Tu solicitud fue aprobada',
		desc: 'Ya puedes descargar y compartir tu Pasaporte DEA.',
	},
	pendiente: {
		tone: 'wait',
		Icon: BsClock,
		title: 'Tu solicitud está en camino',
		desc: 'Gracias por enviarla. Esto es lo que sigue:',
	},
	revision: {
		tone: 'warn',
		Icon: BsClipboard,
		title: 'Tu solicitud necesita una revisión',
		desc: 'Un especialista te dejó un mensaje. Revísalo, corrige lo necesario y vuelve a enviarla.',
	},
	rechazado: {
		tone: 'danger',
		Icon: BsXCircle,
		title: 'Tu solicitud fue rechazada',
		desc: 'Si crees que se trata de un error, ponte en contacto con nosotros.',
	},
};

const Dashboard = () => {
	const [data, setData] = useState({});
	const [loaded, setLoaded] = useState(false); // first /usuario/me fetch has resolved
	const [error, setError] = useState(false); // the /usuario/me fetch failed — show the retry card
	const [downloading, setDownloading] = useState(null); // 'pdf' | 'img' — per-button spinner
	const [resending, setResending] = useState(false); // resend-verification request in flight
	const [resendError, setResendError] = useState(null); // inline failure shown under the resend button
	const [shareUrl, setShareUrl] = useState(null); // shown when the clipboard API is unavailable

	const fetchFromAPI = async () => {
		// Always resolve the loading state (finally) so a failed request can never leave the
		// page stuck on the skeleton forever — on error we render the retry card instead.
		setError(false);
		setLoaded(false);
		try {
			// Server returns the record bound to the session — no id from a client cookie (§1.5).
			const res = await axiosInstance.get(`/usuario/me`);
			setData(res.data);
		} catch (err) {
			setError(true);
		} finally {
			setLoaded(true);
		}
	};

	useEffect(() => {
		fetchFromAPI();
	}, []);

	const downloadFile = async type => {
		setDownloading(type);
		try {
			await getFileFromServer(type, data._id);
		} catch (err) {
			// A download is a background action — a transient toast is the right channel.
			toast.error('No pudimos generar el archivo. Inténtalo de nuevo.');
		} finally {
			setDownloading(null);
		}
	};

	const passportUrl = () => `${window.location.origin}/verificar/${data.numeroDocumento}/${data.numeroPasaporte}`;

	const copyPassportLink = async () => {
		const url = passportUrl();
		try {
			await navigator.clipboard.writeText(url);
			toast.success('Enlace copiado');
		} catch (err) {
			// Clipboard API unavailable (e.g. non-HTTPS) — show the link so it can be copied manually.
			setShareUrl(url);
		}
	};

	const resendVerification = async () => {
		setResending(true);
		setResendError(null);
		try {
			await axiosInstance.post(`/emailVerification/resend`);
			// Success is a background confirmation — toast is correct here.
			toast.success('Te reenviamos el correo de verificación.');
		} catch (err) {
			// The whole point of this branch is to unblock the user, so its failure goes inline,
			// right under the button — not a toast that auto-dismisses out of sight.
			setResendError('No pudimos reenviar el correo. Inténtalo de nuevo en un momento.');
		} finally {
			setResending(false);
		}
	};

	// Initial load: show the skeleton (same chrome + layout as the loaded view). The overlay
	// spinner below is reserved for blocking actions (file downloads) once data is present.
	if (!loaded) return <DashboardSkeleton />;

	// Fetch failed: a transient network blip must never become a permanent dead skeleton.
	// Same card chrome, but offering a way out.
	if (error) {
		return (
			<div className='dashboard-div-main'>
				<Helmet>
					<meta charSet='utf-8' />
					<title>Mi panel | RUIDEA</title>
				</Helmet>
				<Navbar />
				<main className='dash'>
					<div className='dash-shell'>
						<section className='status-card status-card--enter tone-danger'>
							<span className='status-badge' aria-hidden='true'>
								<BsXCircle size={38} />
							</span>
							<h1 className='status-title'>No pudimos cargar tu panel</h1>
							<p className='status-desc'>
								Hubo un problema al obtener tu solicitud. Revisa tu conexión e inténtalo de nuevo.
							</p>
							<div className='status-actions'>
								<button className='btn-primary' onClick={fetchFromAPI}>
									<BsArrowRepeat aria-hidden='true' /> Reintentar
								</button>
							</div>
						</section>
					</div>
				</main>
			</div>
		);
	}

	const meta = STATUS[data.estado];

	return (
		<div className='dashboard-div-main'>
			<Helmet>
				<meta charSet='utf-8' />
				<title>Mi panel | RUIDEA</title>
			</Helmet>
			<Navbar />
			<main className='dash'>
				<div className='dash-shell'>
					<p className='dash-greeting'>Hola, {data.nombre}</p>

					{data.emailVerificado && meta ? (
						<section
							className={`status-card status-card--enter tone-${meta.tone}${
								data.estado === 'aceptado' ? ' status-card--celebrate' : ''
							}`}
						>
							<span className='status-badge' aria-hidden='true'>
								<meta.Icon size={38} />
							</span>
							<h1 className='status-title'>{meta.title}</h1>
							<p className='status-desc'>{meta.desc}</p>

							{data.estado === 'pendiente' && <StatusSteps steps={PENDING_STEPS} activeKey='revision' />}

							{data.estado === 'revision' && data.mensajeMedico && (
								<div className='status-note'>
									<span className='status-note-label'>Mensaje del especialista</span>
									<p>{data.mensajeMedico}</p>
								</div>
							)}

							{data.estado === 'aceptado' && (
								<div className='status-actions grid status-actions--stagger'>
									<button className='btn-primary' onClick={() => downloadFile('pdf')} disabled={!!downloading}>
										{downloading === 'pdf' ? (
											<span className='btn-spinner' aria-hidden='true' />
										) : (
											<BsDownload aria-hidden='true' />
										)}
										Descargar PDF
									</button>
									<button className='btn-secondary' onClick={() => downloadFile('img')} disabled={!!downloading}>
										{downloading === 'img' ? (
											<span className='btn-spinner' aria-hidden='true' />
										) : (
											<BsDownload aria-hidden='true' />
										)}
										Descargar JPG
									</button>
									<button className='btn-secondary' onClick={copyPassportLink}>
										<BsLink45Deg aria-hidden='true' /> Copiar enlace
									</button>
									<a className='btn-secondary' href={passportUrl()} target='_blank' rel='noopener noreferrer'>
										<BsBoxArrowUpRight aria-hidden='true' /> Abrir pasaporte
									</a>
								</div>
							)}

							{data.estado === 'revision' && (
								<div className='status-actions'>
									<Link
										className='btn-primary'
										to={{ pathname: '/inscribirse', state: { mensajeMedico: data.mensajeMedico } }}
									>
										Editar inscripción
									</Link>
								</div>
							)}

							{data.estado === 'rechazado' && (
								<div className='status-actions'>
									<a className='btn-secondary' href={`mailto:${SUPPORT_EMAIL}`}>
										<BsEnvelope aria-hidden='true' /> Escribir a soporte
									</a>
								</div>
							)}
						</section>
					) : (
						<section className='status-card status-card--enter tone-warn'>
							<span className='status-badge' aria-hidden='true'>
								<BsEnvelope size={36} />
							</span>
							<h1 className='status-title'>Confirma tu correo para continuar</h1>
							<p className='status-desc'>
								Te enviamos un enlace a <strong>{data.correoElectronico || 'tu correo'}</strong>. Ábrelo para
								confirmar tu correo y que un especialista pueda revisar tu solicitud. Si no lo ves, revisa la
								carpeta de spam.
							</p>
							<div className='status-actions'>
								<button className='btn-primary' onClick={resendVerification} disabled={resending}>
									{resending ? (
										<span className='btn-spinner' aria-hidden='true' />
									) : (
										<BsArrowRepeat aria-hidden='true' />
									)}
									Reenviar el correo
								</button>
							</div>
							<InlineMessage type='error'>{resendError}</InlineMessage>
						</section>
					)}

					<div className='dash-credit'>
						<span>Sistema creado por el equipo de LectO</span>
						<div className='dash-logos'>
							<picture>
								<source srcSet={logoLecto} type='image/webp' />
								<img src={logoLectoPNG} alt='LectO' />
							</picture>
							<picture>
								<source srcSet={logoDisfam} type='image/webp' />
								<img src={logoDisfamPNG} alt='Disfam' />
							</picture>
						</div>
					</div>
				</div>
			</main>

			<Modal open={!!shareUrl} onClose={() => setShareUrl(null)} title='Copia el enlace de tu pasaporte'>
				<input
					className='modal-url'
					type='text'
					readOnly
					value={shareUrl || ''}
					onFocus={e => e.target.select()}
				/>
				<div className='modal-actions'>
					<button className='btn-primary' onClick={() => setShareUrl(null)}>
						Cerrar
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default Dashboard;
