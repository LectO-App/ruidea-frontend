import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import Verificar from './Verificar';
import VerificarEjemplo from './VerificarEjemplo';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { post: jest.fn() } }));

// Synthetic values only. Same routes as App.js; the API answer has the back end's public shape.
const TOKEN = 'T'.repeat(42) + '0';
const usuario = {
	nombre: 'Prueba',
	apellidos: 'Sintética',
	paisResidencia: 'España',
	documentoFinal: '1222',
	numeroPasaporte: 1001,
	fechaNacimiento: '2012-05-01T00:00:00.000Z',
	diagnostico: { dislexia: true, discalculia: false, tdah: true },
	estado: 'aceptado',
};

const visit = path =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<Switch>
				<Route exact path='/verificar/ejemplo' component={VerificarEjemplo} />
				<Route exact path='/verificar/:token' component={Verificar} />
				<Route path='/verificar/:nroDocumento/:nroPasaporte' component={Verificar} />
			</Switch>
		</MemoryRouter>
	);

const valido = () => screen.findByRole('heading', { level: 1, name: 'Pasaporte DEA válido' });

beforeEach(() => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(2026, 10, 28, 9, 3, 7));
	axiosInstance.post.mockReset();
	axiosInstance.post.mockResolvedValue({ data: { existe: true, usuario } });
});

afterEach(() => {
	jest.useRealTimers();
});

test('a share-token link asks the API by token and says the passport is valid', async () => {
	const { container } = visit('/verificar/' + TOKEN);
	await valido();
	expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/verificar/' + TOKEN);
	expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
	expect(screen.getByText('Prueba Sintética')).toBeInTheDocument();
	expect(screen.getByText('1 de mayo de 2012')).toBeInTheDocument();
	expect(screen.getByText('N.º 0001001')).toBeInTheDocument();
	expect(container.textContent).not.toContain(TOKEN);
});

test('the document shows only its last 4 characters', async () => {
	visit('/verificar/' + TOKEN);
	await valido();
	const documento = screen.getByText('Documento').nextElementSibling;
	expect(documento).toHaveTextContent('•••• 1222');
	expect(within(documento).getByText('••••', { exact: false })).toHaveAttribute('aria-hidden', 'true');
});

test('the check time ticks every second from the device clock and is not announced', async () => {
	visit('/verificar/' + TOKEN);
	await valido();
	const hora = screen.getByText('sábado 28 nov 2026, 09:03:07');
	expect(hora.closest('[aria-live]')).toHaveAttribute('aria-live', 'off');
	act(() => {
		jest.advanceTimersByTime(1000);
	});
	expect(screen.getByText('sábado 28 nov 2026, 09:03:08')).toBeInTheDocument();
});

test('each diagnosis comes with its landing description', async () => {
	visit('/verificar/' + TOKEN);
	await valido();
	const card = screen.getByRole('region', { name: 'Dificultad acreditada' });
	expect(within(card).getByText('Dislexia')).toBeInTheDocument();
	expect(within(card).getByText('Dificultad en la lectura y la decodificación de palabras.')).toBeInTheDocument();
	expect(within(card).getByText('TDA-H')).toBeInTheDocument();
	expect(within(card).queryByText('Discalculia')).toBeNull();
	expect(screen.getByRole('link', { name: 'Comprobar otro pasaporte' })).toHaveAttribute('href', '/verificar/numero');
});

test('the token page and the legacy number page render the same content', async () => {
	const byToken = visit('/verificar/' + TOKEN);
	await valido();
	const tokenHtml = byToken.container.innerHTML;
	byToken.unmount();

	jest.setSystemTime(new Date(2026, 10, 28, 9, 3, 7));
	const byNumber = visit('/verificar/40.111.222/1001');
	await valido();
	expect(axiosInstance.post).toHaveBeenLastCalledWith('/usuario/verificar/40.111.222/1001');
	expect(byNumber.container.innerHTML).toBe(tokenHtml);
});

test('the sample page shows the same design with fictitious data and asks nothing', async () => {
	visit('/verificar/ejemplo');
	await valido();
	expect(screen.getByText('Ejemplo con datos ficticios.')).toBeInTheDocument();
	expect(screen.getByText('Hugo Salas Ocaña')).toBeInTheDocument();
	expect(screen.getByText('12 de abril de 2017')).toBeInTheDocument();
	expect(screen.getByText('Documento').nextElementSibling).toHaveTextContent('•••• 427Z');
	expect(axiosInstance.post).not.toHaveBeenCalled();
});

test('an unknown token shows the not-found screen', async () => {
	axiosInstance.post.mockResolvedValue({ data: { existe: false } });
	visit('/verificar/' + TOKEN);
	expect(await screen.findByRole('heading', { level: 1, name: 'No encontramos ese Pasaporte DEA' })).toBeInTheDocument();
	expect(screen.queryByText('Pasaporte DEA válido')).toBeNull();
	expect(screen.getByRole('link', { name: 'Comprobar otro pasaporte' })).toHaveAttribute('href', '/verificar/numero');
});
