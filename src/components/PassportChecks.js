import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsArrowRepeat, BsBuilding, BsCheckCircle, BsEye, BsX } from 'react-icons/bs';

import { axiosInstance } from '../axios';
import Modal from './ui/Modal';
import InlineMessage from './ui/InlineMessage';

// "¿Quién ha comprobado mi pasaporte?": the holder's own check history (GET
// /usuario/me/comprobaciones) and the way to replace their share link and QR
// (POST /usuario/me/enlace). Lives in a modal on purpose: the panel's home view stays simple.

const TITLES = {
	list: '¿Quién ha comprobado mi pasaporte?',
	confirm: '¿Cambiar tu enlace?',
	done: 'Tu enlace es nuevo',
};

const DEVICES = { mobile: 'desde un móvil', desktop: 'desde un ordenador' };

// The API sends ISO 3166 country codes. Browsers without Intl.DisplayNames (Safari before
// 14.1) show the code.
const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['es'], { type: 'region' }) : null;
const countryName = code => (code && regionNames ? regionNames.of(code) : code || null);

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const timeFormat = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const whenText = (iso, now = new Date()) => {
	const date = new Date(iso);
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const day = sameDay(date, now) ? 'Hoy' : sameDay(date, yesterday) ? 'Ayer' : dayFormat.format(date);
	return `${day}, ${timeFormat.format(date)}`;
};

const CheckItem = ({ check }) => {
	const byEntity = check.tipo === 'entidad';
	const Icon = byEntity ? BsBuilding : BsEye;
	const what = byEntity
		? `Lo comprobó ${check.entidad} con tu número de pasaporte y tu documento`
		: 'Alguien escaneó tu QR o abrió tu enlace';
	const details = [what, DEVICES[check.dispositivo], countryName(check.pais)].filter(Boolean).join(' · ');
	return (
		<li className={`checks-item checks-item--${byEntity ? 'entidad' : 'qr'}`}>
			<span className='checks-icon' aria-hidden='true'>
				<Icon size={20} />
			</span>
			<div>
				<p className='checks-when'>{whenText(check.fecha)}</p>
				<p className='checks-what'>{details}</p>
			</div>
		</li>
	);
};

const History = ({ state, data, onRetry, onChange }) => {
	if (state === 'loading') {
		return (
			<p className='checks-loading' role='status'>
				<span className='btn-spinner' aria-hidden='true' /> Cargando la lista…
			</p>
		);
	}
	if (state === 'error') {
		return (
			<>
				<InlineMessage type='error'>No pudimos cargar la lista. Revisa tu conexión e inténtalo de nuevo.</InlineMessage>
				<div className='modal-actions'>
					<button className='btn-secondary' onClick={onRetry}>
						<BsArrowRepeat aria-hidden='true' /> Reintentar
					</button>
				</div>
			</>
		);
	}
	const { dias, total, comprobaciones } = data;
	return (
		<>
			{total === 0 ? (
				<p className='checks-empty'>
					<strong>Todavía nadie lo ha comprobado</strong>
					<span>En los últimos {dias} días nadie ha escaneado tu QR ni ha abierto tu enlace.</span>
				</p>
			) : (
				<>
					<p className='checks-count'>
						{total} {total === 1 ? 'vez' : 'veces'} en los últimos {dias} días
					</p>
					<ul className='checks-list' aria-label='Comprobaciones de tu pasaporte'>
						{comprobaciones.map(check => (
							<CheckItem key={`${check.fecha}-${check.tipo}`} check={check} />
						))}
					</ul>
					{total > comprobaciones.length && (
						<p className='checks-note'>Te mostramos las {comprobaciones.length} más recientes.</p>
					)}
				</>
			)}
			<p className='checks-note'>Solo tú ves esta lista. No guardamos la dirección IP de quien lo comprueba.</p>
			<p className='checks-note'>Si abriste tu propio enlace, también aparece aquí.</p>
			<h3 className='checks-question'>¿Alguna no te suena, o compartiste el enlace con quien no debías?</h3>
			<div className='modal-actions'>
				<button className='btn-secondary' onClick={onChange}>
					<BsArrowRepeat aria-hidden='true' /> Cambiar mi enlace y mi QR
				</button>
			</div>
		</>
	);
};

const Confirm = ({ busy, error, onConfirm, onCancel }) => (
	<>
		<p>Tu pasaporte sigue igual. Solo cambia la dirección para verlo.</p>
		<ol className='checks-steps'>
			<li>El QR y los enlaces que has compartido desde RUIDEA dejan de funcionar.</li>
			<li>Tienes un QR nuevo al momento.</li>
			<li>Si lo imprimiste, descarga el PDF otra vez.</li>
		</ol>
		<p className='checks-note'>
			Un pasaporte descargado antes de que existieran estos enlaces lleva un QR con tu número de documento. Ese QR no
			cambia.
		</p>
		<InlineMessage type='error'>{error}</InlineMessage>
		<div className='modal-actions'>
			<button className='btn-secondary' onClick={onCancel} disabled={busy}>
				<BsX aria-hidden='true' /> Ahora no
			</button>
			<button className='btn-primary btn-danger' onClick={onConfirm} disabled={busy}>
				{busy ? <span className='btn-spinner' aria-hidden='true' /> : <BsArrowRepeat aria-hidden='true' />}
				Sí, cambiar mi enlace
			</button>
		</div>
	</>
);

const Done = ({ onClose }) => (
	<>
		<InlineMessage type='success'>
			Listo: el enlace y el QR anteriores ya no abren tu pasaporte. Descarga tu pasaporte otra vez para tener el QR
			nuevo, y comparte solo el enlace nuevo.
		</InlineMessage>
		<div className='modal-actions'>
			<button className='btn-primary' onClick={onClose}>
				<BsCheckCircle aria-hidden='true' /> Entendido
			</button>
		</div>
	</>
);

const PassportChecks = ({ open, onClose, onRotated }) => {
	const [view, setView] = useState('list'); // list | confirm | done
	const [state, setState] = useState('loading'); // loading | error | ready
	const [data, setData] = useState(null);
	const [busy, setBusy] = useState(false);
	const [rotateError, setRotateError] = useState(null);
	const bodyRef = useRef(null);
	const shownView = useRef('list');

	const load = useCallback(async () => {
		setState('loading');
		try {
			const res = await axiosInstance.get('/usuario/me/comprobaciones');
			setData(res.data);
			setState('ready');
		} catch (err) {
			setState('error');
		}
	}, []);

	useEffect(() => {
		if (!open) return;
		shownView.current = 'list';
		setView('list');
		setRotateError(null);
		load();
	}, [open, load]);

	// The Modal focuses the dialog when it opens; a later change of view replaces the content
	// (and the focused button), so move focus to the new content.
	useEffect(() => {
		if (shownView.current === view) return;
		shownView.current = view;
		if (bodyRef.current) bodyRef.current.focus();
	}, [view]);

	const rotate = async () => {
		setBusy(true);
		setRotateError(null);
		try {
			const res = await axiosInstance.post('/usuario/me/enlace');
			onRotated(res.data.shareToken);
			setView('done');
		} catch (err) {
			const limited = err && err.response && err.response.status === 429;
			setRotateError(limited ? err.response.data.message : 'No pudimos cambiar tu enlace. Inténtalo de nuevo.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title={TITLES[view]}>
			<div className='checks' ref={bodyRef} tabIndex={-1}>
				{view === 'list' && (
					<History
						state={state}
						data={data}
						onRetry={load}
						onChange={() => {
							setRotateError(null);
							setView('confirm');
						}}
					/>
				)}
				{view === 'confirm' && (
					<Confirm busy={busy} error={rotateError} onConfirm={rotate} onCancel={() => setView('list')} />
				)}
				{view === 'done' && <Done onClose={onClose} />}
			</div>
			{view === 'list' && (
				<div className='modal-actions checks-close'>
					<button className='btn-secondary' onClick={onClose}>
						<BsX aria-hidden='true' /> Cerrar
					</button>
				</div>
			)}
		</Modal>
	);
};

export default PassportChecks;
