import React from 'react';
import { TextEncoder } from 'util';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import MostrarPasaporte from './MostrarPasaporte';
import { axiosInstance } from '../axios';
import QRCode from 'qrcode';

// jsdom has no TextEncoder; qrcode needs it to encode the link.
global.TextEncoder = TextEncoder;

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn() } }));

// Synthetic values only.
const approved = {
	_id: 'u1',
	nombre: 'Ana',
	apellidos: 'Prueba Ejemplo',
	emailVerificado: true,
	estado: 'aceptado',
	numeroPasaporte: 1042,
	numeroDocumento: '00000000T',
	shareToken: 'token-de-prueba',
};

beforeEach(() => jest.spyOn(QRCode, 'toString'));

const renderShow = data => {
	axiosInstance.get.mockResolvedValue({ data });
	return render(
		<HelmetProvider>
			<MemoryRouter initialEntries={['/mostrar']}>
				<Switch>
					<Route path='/mostrar' component={MostrarPasaporte} />
					<Route path='/dashboard'>Panel</Route>
				</Switch>
			</MemoryRouter>
		</HelmetProvider>
	);
};

afterEach(() => {
	delete window.speechSynthesis;
	delete window.SpeechSynthesisUtterance;
	delete navigator.wakeLock;
	axiosInstance.get.mockReset();
	jest.restoreAllMocks();
});

test('shows the name, the padded number and a QR code for the share link', async () => {
	renderShow(approved);

	expect(await screen.findByText('Ana Prueba Ejemplo')).toBeInTheDocument();
	expect(axiosInstance.get).toHaveBeenCalledWith('/usuario/me');
	expect(screen.getByText('N.º 0001042')).toBeInTheDocument();
	expect(screen.getByRole('heading', { level: 1, name: 'Pasaporte DEA' })).toBeInTheDocument();

	const qr = await screen.findByAltText('Código QR de verificación del Pasaporte DEA');
	expect(qr.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
	expect(QRCode.toString.mock.calls[0][0]).toBe(`${window.location.origin}/verificar/token-de-prueba`);

	expect(
		screen.getByText(
			'Tengo una dificultad específica del aprendizaje. Este es mi Pasaporte DEA. Le pido que tenga en cuenta mis necesidades.'
		)
	).toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Volver' })).toHaveAttribute('href', '/dashboard');
	expect(screen.queryByText('00000000T')).not.toBeInTheDocument();
});

test('the QR code falls back to the legacy number link without a share token', async () => {
	renderShow({ ...approved, shareToken: undefined });
	await screen.findByAltText('Código QR de verificación del Pasaporte DEA');
	expect(QRCode.toString.mock.calls[0][0]).toBe(`${window.location.origin}/verificar/00000000T/1042`);
});

test.each([
	['pending', { ...approved, estado: 'pendiente' }],
	['unverified email', { ...approved, emailVerificado: false }],
])('redirects to the dashboard when the application is not approved (%s)', async (_, data) => {
	renderShow(data);
	expect(await screen.findByText('Panel')).toBeInTheDocument();
});

test('hides Leer en voz alta when speech synthesis is unavailable', async () => {
	renderShow(approved);
	await screen.findByText('Ana Prueba Ejemplo');
	expect(screen.queryByRole('button', { name: 'Leer en voz alta' })).not.toBeInTheDocument();
});

test('Leer en voz alta reads the sentence in Spanish and a second press stops it', async () => {
	const speak = jest.fn();
	const cancel = jest.fn();
	window.speechSynthesis = { speak, cancel };
	window.SpeechSynthesisUtterance = function (text) {
		this.text = text;
	};
	renderShow(approved);

	await userEvent.click(await screen.findByRole('button', { name: 'Leer en voz alta' }));
	expect(speak).toHaveBeenCalledTimes(1);
	const utterance = speak.mock.calls[0][0];
	expect(utterance.lang).toBe('es-ES');
	expect(utterance.text).toMatch(/^Tengo una dificultad específica del aprendizaje/);

	await userEvent.click(screen.getByRole('button', { name: 'Detener lectura' }));
	expect(cancel).toHaveBeenCalled();
	expect(screen.getByRole('button', { name: 'Leer en voz alta' })).toBeInTheDocument();
});

test('keeps the screen on while open, re-requests it when visible again and releases it on leave', async () => {
	const sentinels = [];
	const request = jest.fn(async () => {
		const s = { release: jest.fn().mockResolvedValue(), addEventListener: jest.fn() };
		sentinels.push(s);
		return s;
	});
	navigator.wakeLock = { request };
	const { unmount } = renderShow(approved);

	expect(await screen.findByText('La pantalla se queda encendida mientras lo muestras.')).toBeInTheDocument();
	expect(request).toHaveBeenCalledWith('screen');

	sentinels[0].released = true; // the browser drops the lock while the page is hidden
	await act(async () => {
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

	unmount();
	expect(sentinels[sentinels.length - 1].release).toHaveBeenCalled();
});

test('the footer line is hidden when the wake lock is refused', async () => {
	navigator.wakeLock = { request: jest.fn().mockRejectedValue(new Error('NotAllowedError')) };
	renderShow(approved);
	await screen.findByText('Ana Prueba Ejemplo');
	await waitFor(() => expect(navigator.wakeLock.request).toHaveBeenCalled());
	expect(screen.queryByText('La pantalla se queda encendida mientras lo muestras.')).not.toBeInTheDocument();
});

describe('the copy on this device', () => {
	const networkError = () => Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' });
	const saveCopy = () =>
		window.localStorage.setItem(
			'ruidea-pasaporte',
			JSON.stringify({
				nombre: 'Ana',
				apellidos: 'Prueba Ejemplo',
				numeroPasaporte: '0001042',
				url: `${window.location.origin}/verificar/token-de-prueba`,
				guardadoEn: '2026-11-20T09:30:00.000Z',
			})
		);
	const renderOffline = () => {
		axiosInstance.get.mockRejectedValue(networkError());
		return render(
			<HelmetProvider>
				<MemoryRouter initialEntries={['/mostrar']}>
					<Route path='/mostrar' component={MostrarPasaporte} />
				</MemoryRouter>
			</HelmetProvider>
		);
	};

	afterEach(() => window.localStorage.clear());

	test('online, it says the passport is ready without internet and Quitar de este móvil removes it', async () => {
		saveCopy();
		renderShow(approved);
		expect(await screen.findByRole('heading', { name: 'Listo también sin internet' })).toBeInTheDocument();
		expect(
			screen.getByText('Este móvil guarda tu nombre, tu número de pasaporte y el código QR, para enseñarlo sin conexión.')
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'Quitar de este móvil' }));
		expect(window.localStorage.getItem('ruidea-pasaporte')).toBeNull();
		expect(screen.getByRole('status')).toHaveTextContent('Quitado de este móvil.');
	});

	test('with no connection it shows the saved passport with the offline note and its date', async () => {
		saveCopy();
		renderOffline();

		expect(await screen.findByText('Ana Prueba Ejemplo')).toBeInTheDocument();
		expect(screen.getByText('N.º 0001042')).toBeInTheDocument();
		const note = screen.getByRole('status');
		expect(note).toHaveTextContent('Sin conexión: copia de este móvil.');
		expect(note).toHaveTextContent('Comprobado en línea el 20 de noviembre de 2026');
		expect(note).toHaveTextContent('Quien escanee el QR lo comprueba en su propio móvil.');
		await screen.findByAltText('Código QR de verificación del Pasaporte DEA');
		expect(QRCode.toString.mock.calls[0][0]).toBe(`${window.location.origin}/verificar/token-de-prueba`);
		expect(screen.queryByRole('button', { name: 'Quitar de este móvil' })).not.toBeInTheDocument();
	});

	test('offline, read aloud and the wake lock keep working', async () => {
		saveCopy();
		const speak = jest.fn();
		window.speechSynthesis = { speak, cancel: jest.fn() };
		window.SpeechSynthesisUtterance = function (text) {
			this.text = text;
		};
		navigator.wakeLock = {
			request: jest.fn(async () => ({ release: jest.fn().mockResolvedValue(), addEventListener: jest.fn() })),
		};
		renderOffline();

		await userEvent.click(await screen.findByRole('button', { name: 'Leer en voz alta' }));
		expect(speak).toHaveBeenCalledTimes(1);
		expect(await screen.findByText('La pantalla se queda encendida mientras lo muestras.')).toBeInTheDocument();
	});

	test('offline with no copy, the error stays', async () => {
		renderOffline();
		expect(await screen.findByRole('heading', { name: 'No pudimos cargar tu pasaporte' })).toBeInTheDocument();
	});

	test('a 401 while online shows the error, not the copy', async () => {
		saveCopy();
		axiosInstance.get.mockRejectedValue(Object.assign(new Error('401'), { response: { status: 401 } }));
		render(
			<HelmetProvider>
				<MemoryRouter initialEntries={['/mostrar']}>
					<Route path='/mostrar' component={MostrarPasaporte} />
				</MemoryRouter>
			</HelmetProvider>
		);
		expect(await screen.findByRole('heading', { name: 'No pudimos cargar tu pasaporte' })).toBeInTheDocument();
		expect(screen.queryByText('Ana Prueba Ejemplo')).not.toBeInTheDocument();
	});
});
