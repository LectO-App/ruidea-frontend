import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import AdminSolicitud from './AdminSolicitud';
import { axiosInstance } from '../../axios';

jest.mock('../../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const usuario = {
	_id: ID,
	nombre: 'Prueba',
	apellidos: 'Sintética',
	correoElectronico: 'prueba@example.test',
	diagnostico: { dislexia: true },
	estado: 'pendiente',
	motivosRevision: ['informe-ilegible', 'otro-datos'],
	textosOtro: { 'otro-datos': 'Añade el segundo apellido' },
	cambiosDesdeRevision: ['documentos', 'datos'],
};

const history = { push: jest.fn() };
const visit = () =>
	render(
		<MemoryRouter>
			<AdminSolicitud match={{ params: { id: ID } }} history={history} />
		</MemoryRouter>
	);

beforeEach(() => {
	jest.clearAllMocks();
	axiosInstance.post.mockImplementation(url =>
		Promise.resolve({ data: url === `/admin/solicitudes/${ID}` ? { usuario } : { ok: true } })
	);
});

test('the second review shows what was asked and what changed', async () => {
	visit();
	expect(await screen.findByText('Lo que se pidió cambiar')).toBeInTheDocument();
	expect(screen.getByText('El informe no se lee bien')).toBeInTheDocument();
	expect(screen.getByText('Otro cambio en Datos personales: Añade el segundo apellido')).toBeInTheDocument();
	const changed = screen.getByText('Qué cambió').nextElementSibling;
	expect(within(changed).getAllByRole('listitem').map(li => li.textContent)).toEqual(['Documentos', 'Datos personales']);
});

test('the revision modal is a grouped checklist that sends the chosen reasons', async () => {
	visit();
	await userEvent.click(await screen.findByRole('button', { name: 'Pedir revisión' }));

	const documentos = screen.getByRole('group', { name: 'Documentos' });
	await userEvent.click(within(documentos).getByRole('checkbox', { name: 'El informe no se lee bien' }));
	await userEvent.click(screen.getByRole('checkbox', { name: 'Revisa la fecha de nacimiento' }));
	await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

	expect(axiosInstance.post).toHaveBeenCalledWith('/admin/respuesta', {
		estado: 'revision',
		mensajeMedico: '',
		motivosRevision: ['informe-ilegible', 'fecha-nacimiento'],
		textosOtro: {},
		emailUsuario: 'prueba@example.test',
	});
});

test('the modal asks for a reason or a note before sending', async () => {
	visit();
	await userEvent.click(await screen.findByRole('button', { name: 'Pedir revisión' }));
	await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

	expect(screen.getByRole('alert')).toHaveTextContent('Elige al menos un motivo o escribe un mensaje.');
	expect(axiosInstance.post).not.toHaveBeenCalledWith('/admin/respuesta', expect.anything());
});

test('each "Otro" reason is last in its group and reveals its own required text', async () => {
	visit();
	await userEvent.click(await screen.findByRole('button', { name: 'Pedir revisión' }));

	for (const [grupo, titulo] of [
		['Datos personales', 'Otro cambio en Datos personales'],
		['Residencia y documento', 'Otro cambio en Residencia y documento'],
		['Diagnóstico', 'Otro cambio en Diagnóstico'],
		['Documentos', 'Otro cambio en Documentos'],
	]) {
		const boxes = within(screen.getByRole('group', { name: grupo })).getAllByRole('checkbox');
		expect(boxes[boxes.length - 1]).toHaveAccessibleName(titulo);
	}

	const documentos = screen.getByRole('group', { name: 'Documentos' });
	expect(within(documentos).queryByRole('textbox')).toBeNull();
	await userEvent.click(screen.getByRole('checkbox', { name: 'Otro cambio en Documentos' }));
	const texto = within(documentos).getByRole('textbox', { name: 'Qué tiene que cambiar (obligatorio)' });
	expect(texto).toHaveAttribute('maxLength', '140');
	expect(texto).toHaveAccessibleDescription('0 de 140');

	// A note alone is not enough: the "Otro" needs its own text.
	await userEvent.type(screen.getByLabelText('Mensaje para la persona (opcional)'), 'Gracias');
	await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
	expect(screen.getByRole('alert')).toHaveTextContent('Escribe qué hay que cambiar en cada «Otro».');
	expect(texto).toHaveFocus();
	expect(axiosInstance.post).not.toHaveBeenCalledWith('/admin/respuesta', expect.anything());

	await userEvent.type(texto, 'Sube la otra cara');
	expect(texto).toHaveAccessibleDescription('17 de 140');
	await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
	expect(axiosInstance.post).toHaveBeenCalledWith('/admin/respuesta', {
		estado: 'revision',
		mensajeMedico: 'Gracias',
		motivosRevision: ['otro-documentos'],
		textosOtro: { 'otro-documentos': 'Sube la otra cara' },
		emailUsuario: 'prueba@example.test',
	});
});
