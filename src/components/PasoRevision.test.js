import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasoRevision from './PasoRevision';
import Completion from './Completion';
import { fetchPassportSample } from '../util/registrationApi';

jest.mock('../util/registrationApi', () => ({ fetchPassportSample: jest.fn() }));

// Synthetic data only.
const formData = {
	nombre: 'Lucía',
	apellidos: 'Prueba Ejemplo',
	fechaNacimiento: '1984-05-03',
	tipoDocumento: 'dni',
	numeroDocumento: '00000000T',
	paisResidencia: 'España',
	diagnostico: {},
};

const props = {
	formData,
	files: { diagnostico: [], documento: [] },
	onBack: () => {},
	onSubmit: async () => {},
	jumpToStep: () => {},
};

beforeAll(() => {
	window.scrollTo = () => {};
});

beforeEach(() => {
	URL.createObjectURL = jest.fn(() => 'blob:muestra');
	URL.revokeObjectURL = jest.fn();
	fetchPassportSample.mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
});

const check = name => screen.getByRole('group', { name });

test('the review step says the application is not sent until the send button is pressed', async () => {
	render(<PasoRevision {...props} editing={false} />);
	expect(screen.getByText('Tu solicitud aún no está enviada.')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Todo está bien\. Enviar/ })).toBeInTheDocument();
	await screen.findByRole('img');
});

test('editing a sent application saves changes and has no not-sent warning', async () => {
	render(<PasoRevision {...props} editing />);
	expect(screen.queryByText('Tu solicitud aún no está enviada.')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeInTheDocument();
	await screen.findByRole('img');
});

test('shows the sample passport drawn from the five fields, with alt text that reads the data', async () => {
	render(<PasoRevision {...props} editing={false} />);
	expect(screen.getByRole('heading', { name: /Así saldrá en tu pasaporte/ })).toHaveTextContent('Muestra');
	expect(screen.getByText('Es el pasaporte de Lucía, con sus datos. El número y el QR llegan cuando se apruebe.')).toBeInTheDocument();
	expect(screen.getByTestId('muestra-skeleton')).toBeInTheDocument();

	const img = await screen.findByRole('img');
	expect(img).toHaveAttribute('src', 'blob:muestra');
	expect(img).toHaveAttribute(
		'alt',
		'Muestra del pasaporte DEA de Lucía Prueba Ejemplo. Fecha de nacimiento: 3 de mayo de 1984. Documento: DNI 00000000T. País: España.'
	);
	expect(fetchPassportSample).toHaveBeenCalledWith({
		nombre: 'Lucía',
		apellidos: 'Prueba Ejemplo',
		fechaNacimiento: '1984-05-03',
		numeroDocumento: '00000000T',
		paisResidencia: 'España',
	});
	expect(screen.queryByTestId('muestra-skeleton')).not.toBeInTheDocument();
});

test('three checks show the name, the date in words and the document, each with Corregir', async () => {
	const jumpToStep = jest.fn();
	render(<PasoRevision {...props} jumpToStep={jumpToStep} editing={false} />);

	const nombre = check(/Nombre y apellidos/);
	expect(nombre).toHaveTextContent('Lucía Prueba Ejemplo');
	expect(nombre).toHaveTextContent('Igual que en su DNI, letra a letra y con tildes');
	const fecha = check(/Fecha de nacimiento/);
	expect(fecha).toHaveTextContent('3 de mayo de 1984');
	const documento = check(/Documento/);
	expect(documento).toHaveTextContent('DNI 00000000T');
	expect(documento).toHaveTextContent('Mira el número en su documento, cifra a cifra');

	await userEvent.click(within(nombre).getByRole('button', { name: /Corregir/ }));
	await userEvent.click(within(fecha).getByRole('button', { name: /Corregir/ }));
	await userEvent.click(within(documento).getByRole('button', { name: /Corregir/ }));
	expect(jumpToStep.mock.calls).toEqual([['datos'], ['datos'], ['residencia']]);
	expect(screen.getByText('Revisa ahora: después de aprobarlo, cambiar estos datos necesita otra revisión.')).toBeInTheDocument();
	await screen.findByRole('img');
});

test('a guardian whose child would be an adult gets a soft prompt on the date, and can still send', async () => {
	const onSubmit = jest.fn(async () => {});
	render(<PasoRevision {...props} formData={{ ...formData, esTutor: true }} onSubmit={onSubmit} editing={false} />);

	const fecha = check(/Fecha de nacimiento/);
	expect(fecha).toHaveClass('aviso');
	expect(fecha).toHaveTextContent(/Lucía tendría \d+ años\. ¿Es su fecha, no la tuya\?/);

	await userEvent.click(screen.getByRole('button', { name: /Todo está bien\. Enviar/ }));
	expect(onSubmit).toHaveBeenCalled();
	await screen.findByRole('img');
});

test('no guardian prompt for a minor, or when the applicant fills the form', async () => {
	const year = new Date().getFullYear() - 10;
	const { unmount } = render(
		<PasoRevision {...props} formData={{ ...formData, esTutor: true, fechaNacimiento: `${year}-01-01` }} editing={false} />
	);
	expect(check(/Fecha de nacimiento/)).not.toHaveClass('aviso');
	expect(screen.queryByText(/tendría/)).not.toBeInTheDocument();
	await screen.findByRole('img');
	unmount();

	render(<PasoRevision {...props} editing={false} />);
	expect(screen.queryByText(/tendría/)).not.toBeInTheDocument();
	await screen.findByRole('img');
});

test('when the sample fails, the image block is hidden and the step still sends', async () => {
	fetchPassportSample.mockRejectedValue(new Error('503'));
	const onSubmit = jest.fn(async () => {});
	render(<PasoRevision {...props} onSubmit={onSubmit} editing={false} />);

	await waitFor(() => expect(screen.queryByRole('heading', { name: /Así saldrá en tu pasaporte/ })).not.toBeInTheDocument());
	expect(screen.queryByTestId('muestra-skeleton')).not.toBeInTheDocument();
	expect(screen.queryByRole('img')).not.toBeInTheDocument();
	expect(check(/Nombre y apellidos/)).toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: /Todo está bien\. Enviar/ }));
	expect(onSubmit).toHaveBeenCalled();
});

test('the Datos personales card shows the date as dd/mm/yyyy', async () => {
	render(<PasoRevision {...props} editing={false} />);
	expect(screen.getByText('03/05/1984')).toBeInTheDocument();
	expect(screen.queryByText('1984-05-03')).not.toBeInTheDocument();
	await screen.findByRole('img');
});

test('the success screen says plainly that the application is sent', () => {
	render(<Completion data={{ mensaje: '¡Listo! Tu solicitud está en camino.' }} reduceMotion historyPush={() => {}} />);
	expect(screen.getByText('Tu solicitud está enviada. Ya no tienes que hacer nada más en el formulario.')).toBeInTheDocument();
});
