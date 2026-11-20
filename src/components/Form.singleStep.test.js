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
	textosOtro: {},
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

const withMotivos = (motivosRevision, extra = {}) =>
	axiosInstance.get.mockResolvedValue({ data: { ...record, motivosRevision, ...extra } });

test('paso opens only that step: the heading is the item title, the tip under it', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	expect(await screen.findByRole('heading', { level: 1, name: 'Revisa el diagnóstico' })).toBeInTheDocument();
	expect(screen.getByText('Marca solo lo que dice el informe.')).toBeInTheDocument();
	expect(screen.queryByText(/Paso/)).not.toBeInTheDocument();
	expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
	expect(screen.queryByText('Lo que te pedimos aquí')).not.toBeInTheDocument();
	expect(screen.queryByText(/Cambia solo esta parte/)).not.toBeInTheDocument();
	expect(screen.queryByText('Sube otra foto del informe')).not.toBeInTheDocument();
});

test('saving the step stores it without sending the application and returns to the dashboard', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	await userEvent.click(await screen.findByRole('checkbox', { name: 'Discalculia' }));
	await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	expect(axiosInstance.put).toHaveBeenCalledTimes(1);
	const [url, body] = axiosInstance.put.mock.calls[0];
	expect(url).toBe('/inscripcion/actualizar');
	expect(body.enviar).toBe(false);
	expect(body.diagnostico).toEqual({ ...record.diagnostico, discalculia: true });
	expect(body).not.toHaveProperty('csrfToken');
});

test('"Volver" is a link back to the dashboard that saves nothing', async () => {
	visit('/inscribirse?paso=diagnostico&volver=panel');

	const volver = await screen.findByRole('link', { name: 'Volver' });
	expect(volver).toHaveAttribute('href', '/dashboard');
	await userEvent.click(volver);
	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	expect(axiosInstance.put).not.toHaveBeenCalled();
});

test('a report reason shows only the report uploader', async () => {
	withMotivos(['informe-ilegible']);
	visit('/inscribirse?paso=documentos&volver=panel');

	expect(await screen.findByRole('heading', { level: 1, name: 'Sube otra foto del informe' })).toBeInTheDocument();
	expect(screen.getByText('Con buena luz y la hoja entera.')).toBeInTheDocument();
	expect(screen.getByText('Informe de diagnóstico')).toBeInTheDocument();
	expect(screen.queryByText('DNI, NIE o pasaporte')).not.toBeInTheDocument();
	expect(screen.getByText('Solo lo ve el equipo médico.')).toBeInTheDocument();
	expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('the documents step needs a new file before it saves', async () => {
	withMotivos(['documento-identidad']);
	visit('/inscribirse?paso=documentos&volver=panel');

	expect(await screen.findByText('DNI, NIE o pasaporte')).toBeInTheDocument();
	expect(screen.queryByText('Informe de diagnóstico')).not.toBeInTheDocument();
	await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
	expect(screen.getByText('Adjunta un archivo nuevo.')).toBeInTheDocument();
	expect(axiosInstance.post).not.toHaveBeenCalled();
});

test('several reasons for one step: the step name, then a short list', async () => {
	withMotivos(['informe-ilegible', 'documento-identidad']);
	visit('/inscribirse?paso=documentos&volver=panel');

	expect(await screen.findByRole('heading', { level: 1, name: 'Documentos' })).toBeInTheDocument();
	const items = screen.getAllByRole('listitem').map((li) => li.textContent);
	expect(items).toEqual(['Sube otra foto del informe Con buena luz y la hoja entera.', 'Sube otra foto de tu documento Las dos caras, sin reflejos.']);
	expect(screen.getByText('Informe de diagnóstico')).toBeInTheDocument();
	expect(screen.getByText('DNI, NIE o pasaporte')).toBeInTheDocument();
});

test('a document number reason shows only the type and the number', async () => {
	withMotivos(['numero-documento'], { tipoDocumento: 'pasaporte' });
	visit('/inscribirse?paso=residencia&volver=panel');

	expect(await screen.findByLabelText('Número de documento')).toBeInTheDocument();
	expect(screen.getByLabelText('Tipo de documento')).toBeInTheDocument();
	expect(screen.queryByLabelText('Localidad')).not.toBeInTheDocument();
	expect(screen.queryByText('Teléfono móvil')).not.toBeInTheDocument();

	await userEvent.clear(screen.getByLabelText('Número de documento'));
	await userEvent.type(screen.getByLabelText('Número de documento'), 'SINT0002');
	await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	const body = axiosInstance.put.mock.calls[0][1];
	expect(body.numeroDocumento).toBe('SINT0002');
	expect(body.localidadResidencia).toBe(record.localidadResidencia);
	expect(body.numeroTelefono).toBe(record.numeroTelefono);
});

test('a name reason shows only the name fields and keeps the rest', async () => {
	withMotivos(['nombre-no-coincide']);
	visit('/inscribirse?paso=datos&volver=panel');

	expect(await screen.findByLabelText('Nombre')).toBeInTheDocument();
	expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
	expect(screen.queryByText('¿Para quién es el pasaporte?')).not.toBeInTheDocument();
	expect(screen.queryByText(/Fecha de nacimiento/i)).not.toBeInTheDocument();

	await userEvent.clear(screen.getByLabelText('Apellidos'));
	await userEvent.type(screen.getByLabelText('Apellidos'), 'Sintética Dos');
	await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
	expect(await screen.findByText('Panel de prueba')).toBeInTheDocument();
	const body = axiosInstance.put.mock.calls[0][1];
	expect(body.apellidos).toBe('Sintética Dos');
	expect(body.fechaNacimiento).toBe(record.fechaNacimiento);
});

test('a guardian reason shows only the guardian fields', async () => {
	withMotivos(['datos-tutor']);
	visit('/inscribirse?paso=datos&volver=panel');

	expect(await screen.findByLabelText('Tu nombre')).toBeInTheDocument();
	expect(screen.getByLabelText('¿Qué relación tienes con la persona?')).toBeInTheDocument();
	expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
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

test('an "Otro" reason shows the specialist text as the heading and the whole step', async () => {
	withMotivos(['otro-residencia'], { textosOtro: { 'otro-residencia': 'Escribe el lugar de nacimiento completo.' } });
	visit('/inscribirse?paso=residencia&volver=panel');

	expect(await screen.findByRole('heading', { level: 1, name: 'Escribe el lugar de nacimiento completo.' })).toBeInTheDocument();
	expect(screen.getByLabelText('Localidad')).toBeInTheDocument();
	expect(screen.getByLabelText('Número de documento')).toBeInTheDocument();
});
