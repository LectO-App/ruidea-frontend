import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

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
