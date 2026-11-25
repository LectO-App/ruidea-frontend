import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AiOutlineMail } from 'react-icons/ai';

import InlineMessage from './ui/InlineMessage';

// Short wait before "Enviarlo otra vez" works, so an impatient second tap doesn't replace a
// link that is still on its way (each new link replaces the previous one).
const COOLDOWN_SECONDS = 30;

// "Mira tu correo": shown after a sign-in link was requested.
const CheckEmail = ({ email, resend, onChangeEmail }) => {
	const heading = useRef(null);
	const [wait, setWait] = useState(COOLDOWN_SECONDS);
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		heading.current.focus();
	}, []);

	useEffect(() => {
		if (wait <= 0) return undefined;
		const timer = setTimeout(() => setWait(w => w - 1), 1000);
		return () => clearTimeout(timer);
	}, [wait]);

	const sendAgain = async () => {
		setSending(true);
		setMessage(null);
		setError(null);
		try {
			await resend();
			setMessage('Te lo enviamos otra vez.');
			setWait(COOLDOWN_SECONDS);
		} catch (err) {
			setError('No pudimos enviarlo. Espera un rato y vuelve a intentarlo.');
		}
		setSending(false);
	};

	return (
		<div className='reg auth'>
			<Helmet>
				<title>Mira tu correo | RUIDEA</title>
			</Helmet>

			<div className='auth-shell'>
				<div className='reg-step auth-card'>
					<header className='auth-head'>
						<AiOutlineMail className='auth-icon' size={56} aria-hidden='true' />
						<h1 className='auth-title' tabIndex={-1} ref={heading}>
							Mira tu correo
						</h1>
						<p className='auth-sub'>
							Lo enviamos a <strong className='auth-email'>{email}</strong>
						</p>
					</header>

					<ol className='auth-steps'>
						<li>Abre el correo «Entra a RUIDEA».</li>
						<li>Toca el botón Entrar a RUIDEA.</li>
						<li>Vuelves a la pantalla que querías abrir.</li>
					</ol>

					<p className='auth-note'>
						Sirve 15 minutos y una sola vez. Ábrelo en el dispositivo donde quieres entrar. Si no lo ves, mira en
						Spam o Promociones.
					</p>

					<div aria-live='polite'>
						<InlineMessage type='success'>{message}</InlineMessage>
					</div>
					<InlineMessage type='error'>{error}</InlineMessage>

					<button type='button' className='btn-secondary auth-submit' onClick={sendAgain} disabled={sending || wait > 0}>
						{sending ? 'Enviando…' : wait > 0 ? `Enviarlo otra vez (en ${wait} s)` : 'Enviarlo otra vez'}
					</button>

					<p className='auth-footer'>
						<button type='button' className='auth-link auth-link--target' onClick={onChangeEmail}>
							Me equivoqué de correo
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default CheckEmail;
