import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import EntrarConEnlace from './EntrarConEnlace';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const TOKEN = 'synthetic.magic.token';

const renderPage = () =>
	render(
		<React.StrictMode>
			<HelmetProvider>
				<MemoryRouter initialEntries={[`/entrar/${TOKEN}`]}>
					<Switch>
						<Route exact path='/entrar/:token' component={EntrarConEnlace} />
						<Route path='/mostrar' render={() => <h1>Pasaporte</h1>} />
						<Route path='/dashboard' render={() => <h1>Panel</h1>} />
						<Route path='/login' render={() => <h1>Entrar a RUIDEA</h1>} />
					</Switch>
				</MemoryRouter>
			</HelmetProvider>
		</React.StrictMode>
	);

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.useRealTimers());

test('the page posts the token once from the browser, says Ya estás dentro and opens the saved page', async () => {
	jest.useFakeTimers();
	axiosInstance.post.mockResolvedValue({ data: { correcto: true, csrfToken: 'csrf', next: '/mostrar' } });
	renderPage();

	expect(screen.getByRole('status')).toHaveTextContent('Abriendo tu sesión');
	expect(await screen.findByRole('heading', { name: 'Ya estás dentro' })).toBeInTheDocument();
	expect(axiosInstance.post).toHaveBeenCalledTimes(1);
	expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/enlace/entrar', { token: TOKEN });
	expect(axiosInstance.get).not.toHaveBeenCalled();

	act(() => jest.advanceTimersByTime(2000));
	expect(await screen.findByRole('heading', { name: 'Pasaporte' })).toBeInTheDocument();
});

test('a link without a next path, or with one to another site, opens the dashboard', async () => {
	jest.useFakeTimers();
	axiosInstance.post.mockResolvedValue({ data: { correcto: true, csrfToken: 'csrf', next: 'https://evil.example/' } });
	renderPage();
	await screen.findByRole('heading', { name: 'Ya estás dentro' });
	act(() => jest.advanceTimersByTime(2000));
	expect(await screen.findByRole('heading', { name: 'Panel' })).toBeInTheDocument();
});

test('a used or expired link says so kindly and offers a new one', async () => {
	const user = userEvent.setup();
	axiosInstance.post.mockRejectedValue({ response: { status: 400, data: { correcto: false } } });
	renderPage();

	expect(await screen.findByRole('heading', { name: 'Este enlace ya no sirve' })).toBeInTheDocument();
	expect(screen.getByText(/sirven 15 minutos y una sola vez/)).toBeInTheDocument();
	await user.click(screen.getByRole('link', { name: 'Enviarme un enlace nuevo' }));
	expect(await screen.findByRole('heading', { name: 'Entrar a RUIDEA' })).toBeInTheDocument();
});
