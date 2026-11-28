import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const approved = { _id: 'u1', nombre: 'Ana', emailVerificado: true, estado: 'aceptado', shareToken: 'tok-viejo' };

const hoy = new Date();
hoy.setHours(10, 42, 0, 0);
const CHECKS = {
	dias: 90,
	total: 3,
	comprobaciones: [
		{ fecha: hoy.toISOString(), tipo: 'qr_o_enlace', pais: 'ES', dispositivo: 'mobile' },
		{ fecha: '2026-10-03T09:15:00.000Z', tipo: 'entidad', pais: 'AR', dispositivo: 'desktop', entidad: 'Universidad de Ejemplo' },
		{ fecha: '2026-09-20T18:00:00.000Z', tipo: 'entidad', pais: null, dispositivo: 'other', entidad: 'una entidad verificadora' },
	],
};

let me;
let checks;
beforeEach(() => {
	me = { ...approved };
	checks = () => Promise.resolve({ data: CHECKS });
	axiosInstance.get.mockReset();
	axiosInstance.post.mockReset();
	axiosInstance.get.mockImplementation(url => {
		if (url === '/usuario/me') return Promise.resolve({ data: me });
		if (url === '/usuario/me/comprobaciones') return checks();
		return Promise.reject(new Error(`unexpected ${url}`));
	});
});

const renderDashboard = () =>
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</HelmetProvider>
	);

const openHistory = async user => {
	renderDashboard();
	const button = await screen.findByRole('button', { name: '¿Quién ha comprobado mi pasaporte?' });
	await user.click(button);
	return { button, dialog: await screen.findByRole('dialog', { name: '¿Quién ha comprobado mi pasaporte?' }) };
};

test('the approved panel has the history button but no history list', async () => {
	renderDashboard();
	const button = await screen.findByRole('button', { name: '¿Quién ha comprobado mi pasaporte?' });
	expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
	expect(screen.queryByRole('list', { name: 'Comprobaciones de tu pasaporte' })).not.toBeInTheDocument();
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(axiosInstance.get).not.toHaveBeenCalledWith('/usuario/me/comprobaciones');
});

test('a pending application has no history button', async () => {
	me = { ...approved, estado: 'pendiente' };
	renderDashboard();
	await screen.findByText('Tu solicitud está en camino');
	expect(screen.queryByRole('button', { name: '¿Quién ha comprobado mi pasaporte?' })).not.toBeInTheDocument();
});

test('the modal lists each check with its kind, the count and the privacy note', async () => {
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);

	expect(await within(dialog).findByText('3 veces en los últimos 90 días')).toBeInTheDocument();
	const list = within(dialog).getByRole('list', { name: 'Comprobaciones de tu pasaporte' });
	const items = within(list).getAllByRole('listitem');
	expect(items).toHaveLength(3);
	expect(items[0]).toHaveTextContent('Hoy, 10:42');
	expect(items[0]).toHaveTextContent('Alguien escaneó tu QR o abrió tu enlace · desde un móvil · España');
	expect(items[1]).toHaveTextContent('Lo comprobó Universidad de Ejemplo con tu número de pasaporte y tu documento');
	expect(items[1]).toHaveTextContent('desde un ordenador · Argentina');
	expect(items[2]).toHaveTextContent('Lo comprobó una entidad verificadora con tu número de pasaporte y tu documento');
	for (const item of items) expect(item.querySelector('[aria-hidden="true"] svg')).not.toBeNull();

	expect(within(dialog).getByText('Solo tú ves esta lista. No guardamos la dirección IP de quien lo comprueba.')).toBeInTheDocument();
	expect(within(dialog).getByText('¿Alguna no te suena, o compartiste el enlace con quien no debías?')).toBeInTheDocument();
	expect(within(dialog).getByRole('button', { name: 'Cambiar mi enlace y mi QR' })).toBeInTheDocument();
});

test('one check reads in the singular', async () => {
	checks = () => Promise.resolve({ data: { dias: 90, total: 1, comprobaciones: CHECKS.comprobaciones.slice(0, 1) } });
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	expect(await within(dialog).findByText('1 vez en los últimos 90 días')).toBeInTheDocument();
});

test('an empty history says nobody has checked it yet', async () => {
	checks = () => Promise.resolve({ data: { dias: 90, total: 0, comprobaciones: [] } });
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	expect(await within(dialog).findByText('Todavía nadie lo ha comprobado')).toBeInTheDocument();
	expect(within(dialog).queryByRole('list')).not.toBeInTheDocument();
	expect(within(dialog).getByRole('button', { name: 'Cambiar mi enlace y mi QR' })).toBeInTheDocument();
});

test('a failed load shows an error with a retry, and the retry loads the list', async () => {
	checks = () => Promise.reject(new Error('network'));
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos cargar la lista');

	checks = () => Promise.resolve({ data: CHECKS });
	await user.click(within(dialog).getByRole('button', { name: 'Reintentar' }));
	expect(await within(dialog).findByRole('list', { name: 'Comprobaciones de tu pasaporte' })).toBeInTheDocument();
});

test('the modal shows a loading state while the list is on its way', async () => {
	checks = () => new Promise(() => {});
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	expect(within(dialog).getByRole('status')).toHaveTextContent('Cargando');
});

test('Escape closes the modal and returns focus to the history button', async () => {
	const user = userEvent.setup();
	const { button, dialog } = await openHistory(user);
	await within(dialog).findByRole('list');
	await user.keyboard('{Escape}');
	await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	expect(button).toHaveFocus();
});

test('changing the link asks first, and Ahora no goes back to the list without calling the server', async () => {
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	await user.click(await within(dialog).findByRole('button', { name: 'Cambiar mi enlace y mi QR' }));

	const confirm = await screen.findByRole('dialog', { name: '¿Cambiar tu enlace?' });
	expect(confirm).toHaveTextContent('Tu pasaporte sigue igual. Solo cambia la dirección para verlo.');
	const steps = within(confirm).getAllByRole('listitem');
	expect(steps).toHaveLength(3);
	expect(steps[0]).toHaveTextContent('El QR y los enlaces que has compartido desde RUIDEA dejan de funcionar.');
	expect(steps[1]).toHaveTextContent('Tienes un QR nuevo al momento.');
	expect(steps[2]).toHaveTextContent('Si lo imprimiste, descarga el PDF otra vez.');
	expect(within(confirm).getByRole('button', { name: 'Sí, cambiar mi enlace' }).querySelector('svg[aria-hidden="true"]')).not.toBeNull();

	await user.click(within(confirm).getByRole('button', { name: 'Ahora no' }));
	expect(await screen.findByRole('dialog', { name: '¿Quién ha comprobado mi pasaporte?' })).toBeInTheDocument();
	expect(axiosInstance.post).not.toHaveBeenCalled();
});

test('confirming changes the link, refreshes the panel links and tells the holder to download again', async () => {
	axiosInstance.post.mockImplementation(url => {
		if (url !== '/usuario/me/enlace') return Promise.reject(new Error(url));
		me = { ...approved, shareToken: 'tok-nuevo' };
		return Promise.resolve({ data: { shareToken: 'tok-nuevo' } });
	});
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	expect(screen.getByRole('link', { name: 'Abrir pasaporte', hidden: true })).toHaveAttribute('href', expect.stringContaining('tok-viejo'));
	const meCalls = () => axiosInstance.get.mock.calls.filter(([url]) => url === '/usuario/me').length;
	const before = meCalls();
	await user.click(await within(dialog).findByRole('button', { name: 'Cambiar mi enlace y mi QR' }));
	await user.click(await screen.findByRole('button', { name: 'Sí, cambiar mi enlace' }));

	expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/me/enlace');
	const done = await screen.findByRole('dialog', { name: 'Tu enlace es nuevo' });
	expect(within(done).getByRole('status')).toHaveTextContent('Descarga tu pasaporte otra vez');
	await waitFor(() =>
		expect(screen.getByRole('link', { name: 'Abrir pasaporte', hidden: true })).toHaveAttribute('href', expect.stringContaining('tok-nuevo'))
	);
	expect(meCalls()).toBe(before + 1);
});

test('a failed change keeps the confirm step and says so', async () => {
	axiosInstance.post.mockRejectedValue({ response: { status: 500, data: { message: 'Error interno' } } });
	const user = userEvent.setup();
	const { dialog } = await openHistory(user);
	await user.click(await within(dialog).findByRole('button', { name: 'Cambiar mi enlace y mi QR' }));
	await user.click(await screen.findByRole('button', { name: 'Sí, cambiar mi enlace' }));

	const confirm = await screen.findByRole('dialog', { name: '¿Cambiar tu enlace?' });
	expect(await within(confirm).findByRole('alert')).toHaveTextContent('No pudimos cambiar tu enlace. Inténtalo de nuevo.');
});
