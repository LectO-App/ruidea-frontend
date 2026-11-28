import React, { useState } from 'react';
import { BsEnvelope, BsArrowLeft, BsCheckCircle } from 'react-icons/bs';

import { axiosInstance } from '../axios';
import { toast } from './ui/toast';
import InlineMessage from './ui/InlineMessage';
import CodeField from './form/CodeField';
import { emailDomainFeedback } from '../util/identity';

const GENERIC_ERROR = 'Algo no ha funcionado. Inténtalo de nuevo en un momento.';

const serverMessage = err => {
	const data = err && err.response && err.response.data;
	if (data && data.errors && data.errors[0] && data.errors[0].message) return data.errors[0].message;
	return (data && data.message) || GENERIC_ERROR;
};

const looksComplete = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /emailVerification/correo. Answers the saved address, or throws. A 502 means the
// address was saved but the email could not be sent.
const changeEmail = async correoElectronico => {
	try {
		const res = await axiosInstance.post('/emailVerification/correo', { correoElectronico });
		return { correo: res.data.correoElectronico };
	} catch (err) {
		if (err.response && err.response.status === 502) return { correo: correoElectronico, error: serverMessage(err) };
		throw err;
	}
};

// The address in large letters. When its domain looks like a typo of a known one, that
// domain is marked.
const Address = ({ correo, feedback }) => {
	if (!feedback || feedback.kind !== 'suggest') return <p className='email-address'>{correo}</p>;
	const local = correo.slice(0, correo.lastIndexOf('@') + 1);
	return (
		<p className='email-address'>
			{local}
			<mark className='email-suspect'>{feedback.domain}</mark>
		</p>
	);
};

const SuggestHint = ({ feedback, onAccept, busy }) => (
	<div className='email-hint email-hint--suggest'>
		<p>
			¿Quisiste decir <strong>{feedback.suggestedDomain}</strong>?
		</p>
		<button type='button' className='btn-secondary' onClick={onAccept} disabled={busy}>
			{busy && <span className='btn-spinner' aria-hidden='true' />}
			Sí, cambiar a {feedback.suggestedDomain}
		</button>
	</div>
);

const ChangeEmail = ({ onBack, onChanged }) => {
	const [value, setValue] = useState('');
	const [sending, setSending] = useState(false);
	const [error, setError] = useState(null);
	const feedback = emailDomainFeedback(value);

	const submit = async e => {
		e.preventDefault();
		const correo = value.trim().toLowerCase();
		if (!looksComplete(correo)) {
			setError('Ese correo no está completo. Revisa que tenga una @ y un punto.');
			return;
		}
		setSending(true);
		setError(null);
		try {
			const result = await changeEmail(correo);
			onChanged(result);
		} catch (err) {
			setError(serverMessage(err));
			setSending(false);
		}
	};

	return (
		<section className='status-card status-card--enter tone-warn confirm-email'>
			<button type='button' className='btn-back' onClick={onBack}>
				<BsArrowLeft aria-hidden='true' /> Volver
			</button>
			<h1 className='status-title'>Escribe tu correo bien</h1>
			<p className='status-desc'>Te enviaremos un código nuevo. No pierdes nada de lo que ya enviaste.</p>
			<form className='confirm-email-form' onSubmit={submit} noValidate>
				<label htmlFor='nuevo-correo'>Tu correo</label>
				<input
					id='nuevo-correo'
					type='email'
					inputMode='email'
					autoComplete='email'
					value={value}
					onChange={e => setValue(e.target.value)}
					aria-describedby='nuevo-correo-feedback'
				/>
				<div id='nuevo-correo-feedback' aria-live='polite'>
					{feedback && feedback.kind === 'known' && (
						<p className='email-hint email-hint--known'>
							<BsCheckCircle aria-hidden='true' /> {feedback.domain} es un correo conocido. Revisa también lo que va
							antes de la @.
						</p>
					)}
					{feedback && feedback.kind === 'suggest' && (
						<SuggestHint feedback={feedback} onAccept={() => setValue(feedback.suggestion)} />
					)}
				</div>
				<InlineMessage type='error'>{error}</InlineMessage>
				<button type='submit' className='btn-primary' disabled={sending}>
					{sending && <span className='btn-spinner' aria-hidden='true' />}
					Enviar el código a este correo
				</button>
				<p className='status-hint'>Desde ahora, entra en RUIDEA con este correo.</p>
			</form>
		</section>
	);
};

// The panel for a sent application whose email is not confirmed yet: confirm with the
// 6-digit code (or the button in the email), fix a mistyped address, or resend the email.
const ConfirmEmailCard = ({ correo, onConfirmed, onEmailChanged }) => {
	const [view, setView] = useState('card');
	const [code, setCode] = useState('');
	const [checking, setChecking] = useState(false);
	const [codeError, setCodeError] = useState(null);
	const [fixing, setFixing] = useState(false);
	const [notice, setNotice] = useState(null);
	const [noticeError, setNoticeError] = useState(null);
	const [resending, setResending] = useState(false);
	const feedback = emailDomainFeedback(correo);

	const changed = ({ correo: nuevo, error }) => {
		onEmailChanged(nuevo);
		setCode('');
		setCodeError(null);
		setNotice(error ? null : 'Listo. Te enviamos un código nuevo a este correo.');
		setNoticeError(error || null);
		setView('card');
	};

	const acceptSuggestion = async () => {
		setFixing(true);
		setNoticeError(null);
		try {
			changed(await changeEmail(feedback.suggestion));
		} catch (err) {
			setNotice(null);
			setNoticeError(serverMessage(err));
		} finally {
			setFixing(false);
		}
	};

	const confirm = async e => {
		e.preventDefault();
		if (code.length !== 6) {
			setCodeError('Escribe los 6 números del código.');
			return;
		}
		setChecking(true);
		setCodeError(null);
		try {
			await axiosInstance.post('/emailVerification/codigo', { codigo: code });
			onConfirmed();
		} catch (err) {
			setCodeError(serverMessage(err));
			setChecking(false);
		}
	};

	const resend = async () => {
		setResending(true);
		setNoticeError(null);
		try {
			await axiosInstance.post('/emailVerification/resend');
			toast.success('Te reenviamos el correo de verificación.');
		} catch (err) {
			setNoticeError('No pudimos reenviar el correo. Inténtalo de nuevo en un momento.');
		} finally {
			setResending(false);
		}
	};

	if (view === 'change') return <ChangeEmail onBack={() => setView('card')} onChanged={changed} />;

	return (
		<section className='status-card status-card--enter tone-warn confirm-email'>
			<span className='status-badge' aria-hidden='true'>
				<BsEnvelope size={36} />
			</span>
			<h1 className='status-title'>Falta un paso: confirma tu correo</h1>
			<p className='status-desc'>Tu solicitud está guardada. La revisaremos cuando confirmes tu correo.</p>

			<div className='email-box'>
				<p className='email-box-label'>Te lo enviamos a</p>
				<Address correo={correo || ''} feedback={feedback} />
			</div>
			{feedback && feedback.kind === 'suggest' && (
				<SuggestHint feedback={feedback} onAccept={acceptSuggestion} busy={fixing} />
			)}
			<InlineMessage type='success'>{notice}</InlineMessage>
			<InlineMessage type='error'>{noticeError}</InlineMessage>

			<form className='confirm-email-form' onSubmit={confirm} noValidate>
				<CodeField
					id='codigo-correo'
					label='Escribe el código del correo'
					value={code}
					onChange={setCode}
					errorId={codeError ? 'codigo-correo-error' : undefined}
				/>
				<div id='codigo-correo-error'>
					<InlineMessage type='error'>{codeError}</InlineMessage>
				</div>
				<button type='submit' className='btn-primary' disabled={checking}>
					{checking && <span className='btn-spinner' aria-hidden='true' />}
					Confirmar
				</button>
			</form>

			<p className='confirm-email-or'>o pulsa el botón del correo</p>

			<button type='button' className='btn-secondary confirm-email-wide' onClick={() => setView('change')}>
				Mi correo es otro
			</button>
			<button type='button' className='btn-link' onClick={resend} disabled={resending}>
				{resending && <span className='btn-spinner' aria-hidden='true' />}
				Reenviar el correo
			</button>
		</section>
	);
};

export default ConfirmEmailCard;
