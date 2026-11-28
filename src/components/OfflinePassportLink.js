import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BsPhone } from 'react-icons/bs';

import { loadOfflinePassport } from '../util/offlinePassport';

const useOnline = () => {
	const [online, setOnline] = useState(() => navigator.onLine !== false);
	useEffect(() => {
		const update = () => setOnline(navigator.onLine !== false);
		window.addEventListener('online', update);
		window.addEventListener('offline', update);
		return () => {
			window.removeEventListener('online', update);
			window.removeEventListener('offline', update);
		};
	}, []);
	return online;
};

// With no connection, every page except the passport itself and the public verify pages
// offers the passport copy saved on this device.
const OfflinePassportLink = () => {
	const online = useOnline();
	const { pathname } = useLocation();
	if (online || pathname === '/mostrar' || pathname.startsWith('/verificar') || pathname.startsWith('/admin')) return null;
	if (!loadOfflinePassport()) return null;
	return (
		<div className='offline-bar' role='status'>
			<p>Sin conexión. Tu pasaporte está guardado en este móvil.</p>
			<Link className='offline-bar__link' to='/mostrar'>
				<BsPhone aria-hidden='true' /> Mostrar mi pasaporte
			</Link>
		</div>
	);
};

export default OfflinePassportLink;
