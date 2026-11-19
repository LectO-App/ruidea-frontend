import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import RevisionChecklist from './RevisionChecklist';
import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const revision = {
	_id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
	nombre: 'Prueba',
	emailVerificado: true,
	estado: 'revision',
	motivosRevision: ['informe-ilegible', 'numero-documento'],
	cambiosDesdeRevision: ['residencia'],
	mensajeMedico: 'Gracias por tu paciencia.',
};

const checklist = (props = {}) =>
	render(
		<MemoryRouter>
			<RevisionChecklist
				motivosRevision={revision.motivosRevision}
				cambiosDesdeRevision={revision.cambiosDesdeRevision}
				mensajeMedico={revision.mensajeMedico}
				onReenviar={() => {}}
				{...props}
			/>
		</MemoryRouter>
	);

const dashboard = () =>
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</HelmetProvider>
	);

beforeEach(() => {
	axiosInstance.get.mockReset();
	axiosInstance.post.mockReset();
});

test('the checklist counts what is left, in text', () => {
	checklist();
	expect(screen.getByRole('heading', { name: 'Falta poco: 1 cosa por cambiar' })).toBeInTheDocument();
	expect(screen.getByText('Has cambiado 1 de 2.')).toBeInTheDocument();
});

test('each reason shows its title, its tip and a link that opens only its step', () => {
	checklist();
	const items = screen.getAllByRole('listitem');
	expect(items).toHaveLength(2);

	const informe = within(items[0]);
	expect(informe.getByText('El informe no se lee bien')).toBeInTheDocument();
	expect(informe.getByText(/Haz la foto con buena luz y con la hoja entera/)).toBeInTheDocument();
	expect(informe.queryByText('Hecho')).not.toBeInTheDocument();
	expect(informe.getByRole('link', { name: /^Cambiar el informe\s*: El informe no se lee bien$/ })).toHaveAttribute(
		'href',
		'/inscribirse?paso=documentos&volver=panel'
	);

	const numero = within(items[1]);
	expect(numero.getByText('Hecho')).toBeInTheDocument();
	expect(numero.getByRole('link', { name: /^Cambiar otra vez\s*: El número de documento no coincide$/ })).toHaveAttribute(
		'href',
		'/inscribirse?paso=residencia&volver=panel'
	);
});

test('the specialist note shows below the list, in sentence case', () => {
	checklist();
	expect(screen.getByText('Mensaje del especialista')).toBeInTheDocument();
	expect(screen.getByText('Gracias por tu paciencia.')).toBeInTheDocument();
});

test('when every item is done the heading says so', () => {
	checklist({ cambiosDesdeRevision: ['residencia', 'documentos'] });
	expect(screen.getByRole('heading', { name: 'Ya está todo: envía tu solicitud de nuevo' })).toBeInTheDocument();
	expect(screen.getByText('Has cambiado 2 de 2.')).toBeInTheDocument();
});

test('reasons this build does not know are left out', () => {
	checklist({ motivosRevision: ['informe-ilegible', 'motivo-nuevo'], cambiosDesdeRevision: [] });
	expect(screen.getAllByRole('listitem')).toHaveLength(1);
	expect(screen.getByRole('heading', { name: 'Falta poco: 1 cosa por cambiar' })).toBeInTheDocument();
});

test('the dashboard shows the checklist and "Enviar de nuevo" sends the application back', async () => {
	axiosInstance.get.mockResolvedValue({ data: revision });
	axiosInstance.post.mockResolvedValue({ data: { usuario: { ...revision, estado: 'pendiente' } } });
	dashboard();

	expect(await screen.findByRole('heading', { name: 'Falta poco: 1 cosa por cambiar' })).toBeInTheDocument();
	expect(screen.queryByRole('link', { name: 'Editar inscripción' })).not.toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: 'Enviar de nuevo' }));
	expect(axiosInstance.post).toHaveBeenCalledWith('/inscripcion/reenviar');
	expect(await screen.findByRole('heading', { name: 'Tu solicitud está en camino' })).toBeInTheDocument();
});

test('a revision with only a note keeps the full edit form', async () => {
	axiosInstance.get.mockResolvedValue({ data: { ...revision, motivosRevision: undefined, cambiosDesdeRevision: undefined } });
	dashboard();

	expect(await screen.findByRole('link', { name: 'Editar inscripción' })).toHaveAttribute('href', '/inscribirse');
	expect(screen.getByText('Gracias por tu paciencia.')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Enviar de nuevo' })).not.toBeInTheDocument();
});
