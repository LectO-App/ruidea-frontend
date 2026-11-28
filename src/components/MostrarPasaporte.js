import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'react-router-dom';
import QRCode from 'qrcode';
import { BsArrowLeft, BsVolumeUp, BsStopFill, BsArrowRepeat, BsCheckCircle } from 'react-icons/bs';

import { axiosInstance } from '../axios';
import { passportUrl, paddedPassportNumber } from '../util/passport';
import {
	isApprovedHolder,
	isNetworkError,
	loadOfflinePassport,
	removeOfflinePassport,
	offlinePassportRemoved,
	formatSavedAt,
} from '../util/offlinePassport';
import LoadingScreen from './LoadingScreen';

import '../css/registration.scss';

const SENTENCE =
	'Tengo una dificultad específica del aprendizaje. Este es mi Pasaporte DEA. Le pido que tenga en cuenta mis necesidades.';

const canSpeak = () => typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';

// Holds a Screen Wake Lock while mounted. The browser drops the lock whenever the page is hidden,
// so it is requested again each time the page becomes visible. Returns whether a lock is held.
const useWakeLock = active => {
	const [locked, setLocked] = useState(false);

	useEffect(() => {
		if (!active || !navigator.wakeLock) return undefined;
		let sentinel = null;
		let mounted = true;

		const request = async () => {
			try {
				const s = await navigator.wakeLock.request('screen');
				if (!mounted) {
					s.release();
					return;
				}
				sentinel = s;
				setLocked(true);
				s.addEventListener('release', () => mounted && setLocked(false));
			} catch (err) {
				// Refused (battery saver, permissions policy): the footer promise stays hidden.
				if (mounted) setLocked(false);
			}
		};
		const onVisible = () => {
			if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) request();
		};

		request();
		document.addEventListener('visibilitychange', onVisible);
		return () => {
			mounted = false;
			document.removeEventListener('visibilitychange', onVisible);
			if (sentinel) sentinel.release();
		};
	}, [active]);

	return locked;
};

// Online: what this device keeps for offline use, and a way to remove it.
const OfflineReady = ({ removed, onRemove }) =>
	removed ? (
		<p className='show-offline-ready' role='status'>
			Quitado de este móvil. Se guardará de nuevo cuando vuelvas a entrar con tu cuenta.
		</p>
	) : (
		<section className='show-offline-ready' aria-labelledby='show-offline-ready-title'>
			<h2 id='show-offline-ready-title'>
				<BsCheckCircle aria-hidden='true' /> Listo también sin internet
			</h2>
			<p>Este móvil guarda tu nombre, tu número de pasaporte y el código QR, para enseñarlo sin conexión.</p>
			<button type='button' className='show-btn' onClick={onRemove}>
				Quitar de este móvil
			</button>
		</section>
	);

const MostrarPasaporte = () => {
	const [usuario, setUsuario] = useState(null);
	// The copy saved on this device, shown when /usuario/me cannot be reached.
	const [copy, setCopy] = useState(null);
	const [error, setError] = useState(false);
	const [removed, setRemoved] = useState(offlinePassportRemoved);
	const [qrSrc, setQrSrc] = useState(null);
	const [speaking, setSpeaking] = useState(false);

	const load = useCallback(async () => {
		setError(false);
		try {
			const res = await axiosInstance.get('/usuario/me');
			setUsuario(res.data);
			setCopy(null);
		} catch (err) {
			const saved = isNetworkError(err) && loadOfflinePassport();
			if (saved) setCopy(saved);
			else setError(true);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const approved = isApprovedHolder(usuario);
	const passport = copy
		? copy
		: approved && {
				nombre: usuario.nombre,
				apellidos: usuario.apellidos,
				numeroPasaporte: paddedPassportNumber(usuario.numeroPasaporte),
				url: passportUrl(usuario),
		  };
	const url = passport ? passport.url : null;

	useEffect(() => {
		if (!url) return undefined;
		let active = true;
		// Dark grey ($reg-ink) on white with a 4-module quiet zone: still a high-contrast code.
		QRCode.toString(url, { type: 'svg', margin: 4, errorCorrectionLevel: 'M', color: { dark: '#2b2b33', light: '#ffffff' } })
			.then(svg => active && setQrSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`));
		return () => {
			active = false;
		};
	}, [url]);

	const screenOn = useWakeLock(!!passport);

	useEffect(() => () => canSpeak() && window.speechSynthesis.cancel(), []);

	const toggleSpeech = () => {
		if (speaking) {
			window.speechSynthesis.cancel();
			setSpeaking(false);
			return;
		}
		const utterance = new window.SpeechSynthesisUtterance(SENTENCE);
		utterance.lang = 'es-ES';
		utterance.onend = () => setSpeaking(false);
		utterance.onerror = () => setSpeaking(false);
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
		setSpeaking(true);
	};

	if (error) {
		return (
			<div className='show'>
				<Helmet>
					<title>Mostrar pasaporte | RUIDEA</title>
				</Helmet>
				<main className='show-shell show-error'>
					<h1>No pudimos cargar tu pasaporte</h1>
					<p>Revisa tu conexión e inténtalo de nuevo.</p>
					<div className='show-error-actions'>
						<button className='btn-primary' onClick={load}>
							<BsArrowRepeat aria-hidden='true' /> Reintentar
						</button>
						<Link className='btn-secondary' to='/dashboard'>
							Volver al panel
						</Link>
					</div>
				</main>
			</div>
		);
	}

	if (!usuario && !copy) return <LoadingScreen />;
	if (!passport) return <Redirect to='/dashboard' />;

	const nombre = [passport.nombre, passport.apellidos].filter(Boolean).join(' ');
	const removeCopy = () => {
		removeOfflinePassport();
		setRemoved(true);
	};

	return (
		<div className='show'>
			<Helmet>
				<title>Mostrar pasaporte | RUIDEA</title>
			</Helmet>
			<main className='show-shell'>
				<div className='show-top'>
					{copy ? (
						<button type='button' className='show-btn' onClick={load}>
							<BsArrowRepeat aria-hidden='true' /> Reintentar
						</button>
					) : (
						<Link className='show-btn' to='/dashboard'>
							<BsArrowLeft aria-hidden='true' /> Volver
						</Link>
					)}
					{canSpeak() && (
						<button className='show-btn' onClick={toggleSpeech}>
							{speaking ? <BsStopFill aria-hidden='true' /> : <BsVolumeUp aria-hidden='true' />}
							{speaking ? 'Detener lectura' : 'Leer en voz alta'}
						</button>
					)}
				</div>

				{copy && (
					<p className='show-offline' role='status'>
						Sin conexión: copia de este móvil. Comprobado en línea el {formatSavedAt(copy.guardadoEn)}. Quien escanee
						el QR lo comprueba en su propio móvil.
					</p>
				)}

				<section className='show-card' aria-labelledby='show-title'>
					<h1 className='show-band' id='show-title'>
						Pasaporte DEA
					</h1>
					<div className='show-body'>
						<p className='show-name'>{nombre}</p>
						<p className='show-number'>N.º {passport.numeroPasaporte}</p>
						<div className='show-qr'>
							{qrSrc && <img src={qrSrc} alt='Código QR de verificación del Pasaporte DEA' />}
						</div>
						<p className='show-caption'>
							Escanee el código con la cámara del móvil para comprobar que este pasaporte es válido.
						</p>
					</div>
				</section>

				<section className='show-sentence' aria-labelledby='show-sentence-label'>
					<h2 id='show-sentence-label'>Si te cuesta explicarlo, enseña o lee esto</h2>
					<p>{SENTENCE}</p>
				</section>

				{!copy && usuario.shareToken && <OfflineReady removed={removed} onRemove={removeCopy} />}

				{screenOn && <p className='show-footer'>La pantalla se queda encendida mientras lo muestras.</p>}
			</main>
		</div>
	);
};

export default MostrarPasaporte;
