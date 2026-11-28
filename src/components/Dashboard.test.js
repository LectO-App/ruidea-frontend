import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';
import { toast } from './ui/toast';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));
jest.mock('./ui/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Synthetic values only.
const renderDashboard = data => {
	axiosInstance.get.mockResolvedValue({ data });
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</HelmetProvider>
	);
};

const approved = { _id: 'u1', nombre: 'Ana', emailVerificado: true, estado: 'aceptado', shareToken: 'tok' };

test('the approved dashboard leads with Mostrar mi pasaporte and keeps the other four as secondary', async () => {
	renderDashboard(approved);

	const show = await screen.findByRole('link', { name: 'Mostrar mi pasaporte' });
	expect(show).toHaveAttribute('href', '/mostrar');
	expect(show).toHaveClass('btn-primary');
	expect(screen.getByText('Para enseñarlo en un examen, en el aeropuerto o en la consulta.')).toBeInTheDocument();
	expect(screen.getByText('Ya puedes mostrar, descargar y compartir tu Pasaporte DEA.')).toBeInTheDocument();

	for (const name of ['Descargar PDF', 'Descargar JPG', 'Copiar enlace']) {
		expect(screen.getByRole('button', { name })).toHaveClass('btn-secondary');
	}
	expect(screen.getByRole('link', { name: 'Abrir pasaporte' })).toHaveClass('btn-secondary');
});

test('a pending application has no Mostrar mi pasaporte button', async () => {
	renderDashboard({ ...approved, estado: 'pendiente' });
	await screen.findByText('Tu solicitud está en camino');
	expect(screen.queryByRole('link', { name: 'Mostrar mi pasaporte' })).not.toBeInTheDocument();
});

const draft = {
	_id: 'd1',
	estado: 'borrador',
	emailVerificado: false,
	correoElectronico: 'd1@example.test',
	progreso: {
		pasos: [
			{ clave: 'datos', titulo: 'Tus datos', completo: true },
			{ clave: 'residencia', titulo: 'Residencia y documento', completo: false },
			{ clave: 'diagnostico', titulo: 'Diagnóstico', completo: false },
			{ clave: 'documentos', titulo: 'Documentos', completo: false },
			{ clave: 'revision', titulo: 'Revisar y enviar', completo: false },
		],
	},
};

test('a draft says the application is not sent yet, lists what is left and links to the form', async () => {
	renderDashboard(draft);

	expect(await screen.findByRole('heading', { name: 'Tu solicitud aún no está enviada' })).toBeInTheDocument();
	const steps = screen.getByRole('list', { name: 'Pasos de tu solicitud' });
	expect(steps).toHaveTextContent('Tus datosHecho');
	expect(steps).toHaveTextContent('DiagnósticoFalta');
	expect(screen.getByRole('link', { name: 'Continuar mi solicitud' })).toHaveAttribute('href', '/inscribirse');
	expect(screen.getByText('Hola')).toBeInTheDocument();
});

test('a draft never sees wording that says it was sent or is waiting for review', async () => {
	renderDashboard({ ...draft, emailVerificado: true, nombre: 'Ana' });
	await screen.findByRole('heading', { name: 'Tu solicitud aún no está enviada' });
	expect(screen.queryByText(/en camino|recibida|revisar tu solicitud|Confirma tu correo/)).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /Reenviar el correo/ })).not.toBeInTheDocument();
});

describe('Enviarme el pasaporte por correo', () => {
	afterEach(() => {
		axiosInstance.post.mockReset();
		window.localStorage.clear();
	});

	test('an approved holder can send the passport to their own address', async () => {
		axiosInstance.post.mockResolvedValue({ data: { ok: true } });
		renderDashboard(approved);
		const button = await screen.findByRole('button', { name: 'Enviarme el pasaporte por correo' });
		await userEvent.click(button);
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/enviar-pasaporte');
		expect(toast.success).toHaveBeenCalledWith('Te enviamos el pasaporte a tu correo.');
	});

	test('the rate limit gets its own message', async () => {
		axiosInstance.post.mockRejectedValue(Object.assign(new Error('429'), { response: { status: 429 } }));
		renderDashboard(approved);
		await userEvent.click(await screen.findByRole('button', { name: 'Enviarme el pasaporte por correo' }));
		expect(toast.error).toHaveBeenCalledWith('Ya lo pediste varias veces. Inténtalo de nuevo dentro de una hora.');
	});

	test('a pending application has no email button', async () => {
		renderDashboard({ ...approved, estado: 'pendiente' });
		await screen.findByText('Tu solicitud está en camino');
		expect(screen.queryByRole('button', { name: 'Enviarme el pasaporte por correo' })).not.toBeInTheDocument();
	});

	test('offline with a copy, the error card offers the saved passport', async () => {
		window.localStorage.setItem('ruidea-pasaporte', JSON.stringify({ numeroPasaporte: '0001042', url: 'x', guardadoEn: '2026-11-20T09:30:00Z' }));
		axiosInstance.get.mockRejectedValue(new Error('Network Error'));
		render(
			<HelmetProvider>
				<MemoryRouter>
					<Dashboard />
				</MemoryRouter>
			</HelmetProvider>
		);
		expect(await screen.findByRole('link', { name: 'Mostrar mi pasaporte' })).toHaveAttribute('href', '/mostrar');
	});
});
