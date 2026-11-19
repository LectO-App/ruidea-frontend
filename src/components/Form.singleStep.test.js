import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Form from './Form';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), put: jest.fn(), post: jest.fn(), patch: jest.fn() } }));

// Synthetic values only.
const record = {
	_id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
	nombre: 'Prueba',
	apellidos: 'Sintética',
	paisResidencia: 'Argentina',
	localidadResidencia: 'Ciudad Ficticia',
	lugarNacimiento: 'Pueblo Ficticio',
	numeroDocumento: 'SINT-0001',
	fechaNacimiento: '2010-01-01T00:00:00.000Z',
	correoElectronico: 'prueba@example.test',
	numeroTelefono: '+5491136622676',
	diagnostico: { dislexia: true, discalculia: false, disortografía: false, dispraxia: false, tdah: false },
	aceptoSolicitud: true,
	estado: 'revision',
	motivosRevision: ['diagnostico-no-coincide', 'informe-ilegible'],
	csrfToken: 'csrf-de-prueba',
};

const visit = path =>
	render(
		<HelmetProvider>
			<MemoryRouter initialEntries={[path]}>
				<Switch>
					<Route path='/inscribirse' component={Form} />
					<Route path='/dashboard' render={() => <p>Panel de prueba</p>} />
				</Switch>
			</MemoryRouter>
		</HelmetProvider>
	);

beforeEach(() => {
	jest.clearAllMocks();
	axiosInstance.get.mockResolvedValue({ data: record });
	axiosInstance.put.mockResolvedValue({ data: { update: record } });
	axiosInstance.post.mockResolvedValue({ data: {} });
});

test('paso opens only that step, with what was asked for it', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	expect(await screen.findByRole('heading', { name: 'Diagnóstico' })).toBeInTheDocument();
	expect(screen.getByText('Cambia solo esta parte. Al guardar, vuelves a tu panel.')).toBeInTheDocument();
	expect(screen.queryByText(/Paso/)).not.toBeInTheDocument();
	expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
	expect(screen.getByText('El diagnóstico no coincide con el informe.')).toBeInTheDocument();
	expect(screen.queryByText('El informe no se lee bien.')).not.toBeInTheDocument();
});

test('saving the step stores it without sending the application and returns to the dashboard', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	await userEvent.click(await screen.findByRole('checkbox', { name: 'Discalculia' }));
	await userEvent.click(screen.getByRole('button', { name: /Guardar y volver/ }));

	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	expect(axiosInstance.put).toHaveBeenCalledTimes(1);
	const [url, body] = axiosInstance.put.mock.calls[0];
	expect(url).toBe('/inscripcion/actualizar');
	expect(body.enviar).toBe(false);
	expect(body.diagnostico).toEqual({ ...record.diagnostico, discalculia: true });
	expect(body).not.toHaveProperty('csrfToken');
});

test('"Volver al panel" leaves without saving', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	await userEvent.click(await screen.findByRole('button', { name: /Volver al panel/ }));
	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	expect(axiosInstance.put).not.toHaveBeenCalled();
});

test('the documents step needs a new file before it saves', async () => {
	visit('/inscribirse?paso=documentos&volver=panel');

	await userEvent.click(await screen.findByRole('button', { name: /Guardar y volver/ }));
	expect(screen.getByText('Adjunta al menos un archivo nuevo.')).toBeInTheDocument();
	expect(axiosInstance.post).not.toHaveBeenCalled();
});

test('without paso the full form starts at the first step, as before', async () => {
	visit('/inscribirse');

	expect(await screen.findByRole('heading', { name: 'Tus datos' })).toBeInTheDocument();
	expect(screen.getByText(/de 5/)).toBeInTheDocument();
	expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('an unknown paso opens the full form', async () => {
	visit('/inscribirse?paso=revision&volver=panel');

	expect(await screen.findByRole('heading', { name: 'Tus datos' })).toBeInTheDocument();
});
