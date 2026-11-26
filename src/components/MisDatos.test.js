import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import MisDatos from './MisDatos';
import { axiosInstance } from '../axios';
import { downloadMisDatos } from '../util/misDatos';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), patch: jest.fn(), delete: jest.fn(), post: jest.fn() } }));
jest.mock('../util/misDatos', () => ({ ...jest.requireActual('../util/misDatos'), downloadMisDatos: jest.fn() }));

// Synthetic values only.
const me = { _id: 'u1', nombre: 'Ana', estado: 'aceptado', emailVerificado: true, shareToken: 'token-de-prueba' };
const datos = {
	estado: 'aceptado',
	aceptoRecibirInfo: true,
	grupos: [
		{
			clave: 'persona',
			titulo: 'Nombre y apellidos',
			visibilidad: 'enlace',
			campos: [{ clave: 'nombre', etiqueta: 'Nombre', valor: 'Ana' }],
		},
		{
			clave: 'contacto',
			titulo: 'Correo y teléfono',
			visibilidad: 'equipo',
			campos: [{ clave: 'correoElectronico', etiqueta: 'Correo', valor: 'u1@example.test' }],
		},
	],
	enlace: { veces: 3, dias: ['2026-11-20', '2026-11-18'] },
};

const renderPage = ({ usuario = me, misDatos = datos } = {}) => {
	axiosInstance.get.mockImplementation(url =>
		Promise.resolve({ data: url === '/usuario/me/datos' ? misDatos : usuario })
	);
	render(
		<HelmetProvider>
			<MemoryRouter>
				<MisDatos />
			</MemoryRouter>
		</HelmetProvider>
	);
};

const blockTitles = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);

beforeEach(() => jest.clearAllMocks());

test('an approved holder sees the five numbered blocks, the chips and the link openings as dates', async () => {
	renderPage();
	expect(await screen.findByRole('heading', { level: 1, name: 'Mis datos' })).toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Volver a mi panel' })).toHaveAttribute('href', '/dashboard');
	expect(
		screen.getByText('Son tuyos. Aquí ves lo que guardamos, para qué, y puedes descargarlo o borrarlo.')
	).toBeInTheDocument();
	expect(blockTitles()).toEqual([
		'1Lo que guardamos',
		'2Tu enlace',
		'3Correos de DISFAM',
		'4Una copia para ti',
		'5Borrar mi cuenta',
	]);

	const persona = screen.getByRole('heading', { name: 'Nombre y apellidos' }).closest('li');
	expect(within(persona).getByText('en tu enlace')).toHaveClass('md-chip--enlace');
	const contacto = screen.getByRole('heading', { name: 'Correo y teléfono' }).closest('li');
	expect(within(contacto).getByText('solo el equipo')).toHaveClass('md-chip--equipo');
	expect(within(contacto).getByText('u1@example.test')).toBeInTheDocument();

	expect(
		screen.getByText('Lo abrieron 3 veces en los últimos 30 días: 20 de noviembre, 18 de noviembre.')
	).toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Ver lo que ven ellos' })).toHaveAttribute(
		'href',
		`${window.location.origin}/verificar/token-de-prueba`
	);
});

test('before a passport is issued there is no Tu enlace block and the others renumber', async () => {
	renderPage({ usuario: { ...me, estado: 'pendiente' }, misDatos: { ...datos, estado: 'pendiente', enlace: null } });
	await screen.findByRole('heading', { level: 1, name: 'Mis datos' });
	expect(blockTitles()).toEqual(['1Lo que guardamos', '2Correos de DISFAM', '3Una copia para ti', '4Borrar mi cuenta']);
	expect(screen.queryByRole('link', { name: 'Ver lo que ven ellos' })).not.toBeInTheDocument();
});

test('the newsletter control is a labelled switch that saves only aceptoRecibirInfo', async () => {
	axiosInstance.patch.mockResolvedValue({ data: { aceptoRecibirInfo: false } });
	renderPage();
	const sw = await screen.findByRole('switch', { name: 'Noticias y novedades' });
	expect(sw).toHaveAttribute('aria-checked', 'true');
	expect(sw).toHaveAccessibleDescription('Los avisos de tu solicitud te llegan igual.');

	sw.focus();
	await userEvent.keyboard(' ');
	expect(axiosInstance.patch).toHaveBeenCalledWith('/usuario/me/comunicaciones', { aceptoRecibirInfo: false });
	expect(await screen.findByRole('switch', { name: 'Noticias y novedades' })).toHaveAttribute('aria-checked', 'false');
});

test('a failed switch change keeps the old state and says so', async () => {
	axiosInstance.patch.mockRejectedValue(new Error('network'));
	renderPage();
	await userEvent.click(await screen.findByRole('switch', { name: 'Noticias y novedades' }));
	expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar el cambio');
	expect(screen.getByRole('switch', { name: 'Noticias y novedades' })).toHaveAttribute('aria-checked', 'true');
});

test('Descargar mis datos downloads the copy', async () => {
	downloadMisDatos.mockResolvedValue();
	renderPage();
	await userEvent.click(await screen.findByRole('button', { name: 'Descargar mis datos' }));
	expect(downloadMisDatos).toHaveBeenCalledTimes(1);
});

describe('the confirmation screen', () => {
	const openConfirmation = async () => {
		renderPage();
		await userEvent.click(await screen.findByRole('button', { name: 'Borrar mi cuenta…' }));
		return screen.findByRole('heading', { level: 1, name: '¿Borrar tu cuenta?' });
	};

	test('puts keeping the account first, lists the consequences, offers a download and asks for nothing typed', async () => {
		const title = await openConfirmation();
		expect(title).toHaveFocus();

		const buttons = within(screen.getByRole('main')).getAllByRole('button');
		const keep = screen.getByRole('button', { name: 'No, quiero mantener mi cuenta' });
		const erase = screen.getByRole('button', { name: 'Sí, borrar mi cuenta' });
		expect(buttons[0]).toBe(keep);
		expect(buttons[buttons.length - 1]).toBe(erase);
		expect(keep).toHaveClass('btn-primary');
		expect(screen.getByRole('button', { name: 'Descargar mis datos' })).toBeInTheDocument();

		const steps = within(screen.getByRole('list')).getAllByRole('listitem');
		expect(steps.map(s => s.textContent)).toEqual([
			'Borramos tus datos y tu informe. No se pueden recuperar.',
			'Tu pasaporte, su código QR y su enlace dejan de funcionar. Quien los abra verá «no encontrado».',
			'Te enviamos un correo para confirmar que tu cuenta está borrada.',
			'Más adelante puedes volver a solicitar tu Pasaporte DEA.',
		]);
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		expect(document.querySelector('input[type="password"]')).toBeNull();
	});

	test('No, quiero mantener mi cuenta goes back without deleting anything', async () => {
		await openConfirmation();
		await userEvent.click(screen.getByRole('button', { name: 'No, quiero mantener mi cuenta' }));
		expect(await screen.findByRole('heading', { level: 1, name: 'Mis datos' })).toHaveFocus();
		expect(axiosInstance.delete).not.toHaveBeenCalled();
	});

	test('Sí, borrar mi cuenta deletes it and shows the calm done page', async () => {
		axiosInstance.delete.mockResolvedValue({ data: { ok: true } });
		await openConfirmation();
		await userEvent.click(screen.getByRole('button', { name: 'Sí, borrar mi cuenta' }));
		expect(axiosInstance.delete).toHaveBeenCalledWith('/usuario/me');
		expect(await screen.findByRole('heading', { level: 1, name: 'Tu cuenta está borrada' })).toHaveFocus();
		expect(screen.getByRole('link', { name: 'Ir a la página de inicio' })).toHaveAttribute('href', '/');
	});

	test('a failed deletion stays on the confirmation screen and says so', async () => {
		axiosInstance.delete.mockRejectedValue(new Error('network'));
		await openConfirmation();
		await userEvent.click(screen.getByRole('button', { name: 'Sí, borrar mi cuenta' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos borrar tu cuenta');
		expect(screen.getByRole('heading', { level: 1, name: '¿Borrar tu cuenta?' })).toBeInTheDocument();
	});
});
