import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import OfflinePassportLink from './OfflinePassportLink';

const COPY = JSON.stringify({ numeroPasaporte: '0001042', url: 'x', guardadoEn: '2026-11-20T09:30:00Z' });
const setOnline = value => Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });

const renderAt = path =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<OfflinePassportLink />
		</MemoryRouter>
	);

afterEach(() => {
	window.localStorage.clear();
	setOnline(true);
});

test('offline with a saved passport, other pages link to it', () => {
	window.localStorage.setItem('ruidea-pasaporte', COPY);
	setOnline(false);
	renderAt('/inscribirse');
	expect(screen.getByRole('status')).toHaveTextContent('Sin conexión. Tu pasaporte está guardado en este móvil.');
	expect(screen.getByRole('link', { name: 'Mostrar mi pasaporte' })).toHaveAttribute('href', '/mostrar');
});

test('it appears when the connection drops and goes when it comes back', () => {
	window.localStorage.setItem('ruidea-pasaporte', COPY);
	renderAt('/');
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	setOnline(false);
	act(() => window.dispatchEvent(new Event('offline')));
	expect(screen.getByRole('status')).toBeInTheDocument();
	setOnline(true);
	act(() => window.dispatchEvent(new Event('online')));
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test.each(['/mostrar', '/verificar/abc', '/admin/solicitudes'])('it is not shown on %s', path => {
	window.localStorage.setItem('ruidea-pasaporte', COPY);
	setOnline(false);
	renderAt(path);
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('offline with no copy, nothing is shown', () => {
	setOnline(false);
	renderAt('/');
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
