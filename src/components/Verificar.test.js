import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import Verificar from './Verificar';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { post: jest.fn() } }));

// Synthetic values only. Same routes as App.js.
const TOKEN = 'T'.repeat(42) + '0';
const usuario = {
	nombre: 'Prueba',
	apellidos: 'Sintética',
	paisResidencia: 'España',
	numeroDocumento: '40.111.222',
	numeroPasaporte: 1001,
	fechaNacimiento: '2012-05-01T00:00:00.000Z',
	diagnostico: { dislexia: true, discalculia: false },
	estado: 'aceptado',
};

const visit = path =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<Switch>
				<Route exact path='/verificar/:token' component={Verificar} />
				<Route path='/verificar/:nroDocumento/:nroPasaporte' component={Verificar} />
			</Switch>
		</MemoryRouter>
	);

beforeEach(() => {
	axiosInstance.post.mockReset();
	axiosInstance.post.mockResolvedValue({ data: { existe: true, usuario } });
});

test('a share-token link asks the API by token and shows the passport', async () => {
	const { container } = visit('/verificar/' + TOKEN);
	expect(await screen.findByText('Pasaporte N° 0001001')).toBeInTheDocument();
	expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/verificar/' + TOKEN);
	expect(screen.getByText('40.111.222')).toBeInTheDocument();
	expect(container.textContent).not.toContain(TOKEN);
});

test('the token page and the legacy number page render the same content', async () => {
	const byToken = visit('/verificar/' + TOKEN);
	await screen.findByText('Pasaporte N° 0001001');
	const tokenHtml = byToken.container.innerHTML;
	byToken.unmount();

	const byNumber = visit('/verificar/40.111.222/1001');
	await screen.findByText('Pasaporte N° 0001001');
	expect(axiosInstance.post).toHaveBeenLastCalledWith('/usuario/verificar/40.111.222/1001');
	expect(byNumber.container.innerHTML).toBe(tokenHtml);
});

test('an unknown token shows the not-found screen', async () => {
	axiosInstance.post.mockResolvedValue({ data: { existe: false } });
	visit('/verificar/' + TOKEN);
	expect(await screen.findByText('No encontramos ese Pasaporte DEA')).toBeInTheDocument();
});
