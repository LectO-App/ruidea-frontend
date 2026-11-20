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

test('the heading says who asked and the total; a text line counts what is done', () => {
	checklist();
	expect(screen.getByRole('heading', { name: 'El equipo médico te pide 2 cambios' })).toBeInTheDocument();
	expect(screen.getByText('1 de 2 hechos')).toBeInTheDocument();
	expect(screen.queryByText(/Has cambiado/)).not.toBeInTheDocument();
});

test('each item is one link with its title and tip; done shows "Hecho"', () => {
	checklist();
	const items = screen.getAllByRole('listitem');
	expect(items).toHaveLength(2);

	const informe = within(items[0]).getByRole('link');
	expect(informe).toHaveAccessibleName('Sube otra foto del informe Con buena luz y la hoja entera.');
	expect(informe).toHaveAttribute('href', '/inscribirse?paso=documentos&volver=panel');
	expect(within(informe).queryByText('Hecho')).not.toBeInTheDocument();

	const numero = within(items[1]).getByRole('link');
	expect(numero).toHaveAttribute('href', '/inscribirse?paso=residencia&volver=panel');
	expect(within(numero).getByText('Revisa el número de documento')).toBeInTheDocument();
	expect(within(numero).getByText('Hecho')).toBeInTheDocument();
	expect(numero).toHaveClass('is-done');
});

test('the specialist message shows below the items, in sentence case', () => {
	checklist();
	const label = screen.getByText('Mensaje del especialista');
	expect(screen.getByText('Gracias por tu paciencia.')).toBeInTheDocument();
	const list = screen.getByRole('list');
	expect(list.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('without a message there is no message block', () => {
	checklist({ mensajeMedico: '' });
	expect(screen.queryByText('Mensaje del especialista')).not.toBeInTheDocument();
});

test('when every item is done the heading says so and the progress line goes away', () => {
	checklist({ cambiosDesdeRevision: ['residencia', 'documentos'] });
	expect(screen.getByRole('heading', { name: 'Todo listo. Envíala de nuevo.' })).toBeInTheDocument();
	expect(screen.queryByText(/de 2 hechos/)).not.toBeInTheDocument();
});

test('"Enviar de nuevo" is enabled even with items left', () => {
	checklist({ cambiosDesdeRevision: [] });
	expect(screen.getByRole('button', { name: 'Enviar de nuevo' })).toBeEnabled();
});

test('reasons this build does not know are left out', () => {
	checklist({ motivosRevision: ['informe-ilegible', 'motivo-nuevo'], cambiosDesdeRevision: [] });
	expect(screen.getAllByRole('listitem')).toHaveLength(1);
	expect(screen.getByRole('heading', { name: 'El equipo médico te pide 1 cambio' })).toBeInTheDocument();
	expect(screen.getByText('0 de 1 hecho')).toBeInTheDocument();
});

test('the dashboard shows only the checklist and "Enviar de nuevo" sends the application back', async () => {
	axiosInstance.get.mockResolvedValue({ data: revision });
	axiosInstance.post.mockResolvedValue({ data: { usuario: { ...revision, estado: 'pendiente' } } });
	dashboard();

	expect(await screen.findByRole('heading', { name: 'El equipo médico te pide 2 cambios' })).toBeInTheDocument();
	expect(screen.queryByText('Tu solicitud necesita una revisión')).not.toBeInTheDocument();
	expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
	expect(screen.queryByRole('link', { name: 'Editar inscripción' })).not.toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: 'Enviar de nuevo' }));
	expect(axiosInstance.post).toHaveBeenCalledWith('/inscripcion/reenviar');
	expect(await screen.findByRole('heading', { name: 'Tu solicitud está en camino' })).toBeInTheDocument();
});

test('a revision with only a note keeps the full edit form', async () => {
	axiosInstance.get.mockResolvedValue({ data: { ...revision, motivosRevision: undefined, cambiosDesdeRevision: undefined } });
	dashboard();

	expect(await screen.findByRole('link', { name: 'Editar inscripción' })).toHaveAttribute('href', '/inscribirse');
	expect(screen.getByRole('heading', { name: 'Tu solicitud necesita una revisión' })).toBeInTheDocument();
	expect(screen.getByText('Gracias por tu paciencia.')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Enviar de nuevo' })).not.toBeInTheDocument();
});

test('an "Otro" item uses the specialist text as its title, with the step name above', () => {
	checklist({
		motivosRevision: ['otro-diagnostico'],
		textosOtro: { 'otro-diagnostico': 'Marca también la dislexia.' },
		cambiosDesdeRevision: [],
		mensajeMedico: '',
	});
	const link = within(screen.getByRole('listitem')).getByRole('link');
	expect(link).toHaveAccessibleName('Diagnóstico Marca también la dislexia.');
	expect(link).toHaveAttribute('href', '/inscribirse?paso=diagnostico&volver=panel');
	expect(screen.queryByText(/Lee el mensaje del especialista/)).not.toBeInTheDocument();
	expect(screen.queryByText(/Otro cambio/)).not.toBeInTheDocument();
});

test('an "Otro" item gets "Hecho" once its step changed', () => {
	checklist({ motivosRevision: ['otro-datos'], textosOtro: { 'otro-datos': 'Añade el segundo apellido.' }, cambiosDesdeRevision: ['datos'] });
	expect(within(screen.getByRole('listitem')).getByText('Hecho')).toBeInTheDocument();
});
