import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Login from './Login';
import { ProtectedRoute } from '../protected.route';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const renderLogin = (state, push = jest.fn()) => {
	axiosInstance.post.mockResolvedValue({ status: 200, data: {} });
	render(
		<HelmetProvider>
			<MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
				<Login history={{ push }} />
			</MemoryRouter>
		</HelmetProvider>
	);
	return push;
};

const showPassword = user => user.click(screen.getByRole('button', { name: 'Entrar con mi contraseña' }));

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.useRealTimers());

test('the sign-in screen leads with the email link and hides the password', () => {
	renderLogin();
	expect(screen.getByRole('heading', { name: 'Entrar a RUIDEA' })).toBeInTheDocument();
	expect(screen.getByText('No necesitas recordar ninguna contraseña.')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Enviarme un enlace' })).toHaveClass('btn-primary');
	expect(screen.getByText('Te llega un correo. Tocas el botón y ya estás dentro.')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Entrar con mi contraseña' })).toHaveClass('btn-secondary');
	expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Crea una' })).toHaveAttribute('href', '/inscribirse');
});

test('Enviarme un enlace asks for the link with the page the person wanted, then shows Mira tu correo', async () => {
	const user = userEvent.setup();
	renderLogin({ from: { pathname: '/mostrar', search: '', hash: '' } });

	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/enlace', { email: 'ana@example.com', next: '/mostrar' })
	);
	expect(await screen.findByRole('heading', { name: 'Mira tu correo' })).toHaveFocus();
	expect(screen.getByText('ana@example.com')).toBeInTheDocument();
	const steps = screen.getAllByRole('listitem').map(li => li.textContent);
	expect(steps).toEqual([
		'Abre el correo «Entra a RUIDEA».',
		'Toca el botón Entrar a RUIDEA.',
		'Vuelves a la pantalla que querías abrir.',
	]);
	expect(screen.getByText(/Sirve 15 minutos y una sola vez/)).toBeInTheDocument();
	expect(screen.getByText(/Spam o Promociones/)).toBeInTheDocument();
	expect(screen.getByText(/en el dispositivo donde quieres entrar/)).toBeInTheDocument();
});

test('without a saved page the link request sends no next path', async () => {
	const user = userEvent.setup();
	renderLogin();
	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
	await user.click(screen.getByRole('button', { name: 'Enviarme un enlace' }));
	await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/enlace', { email: 'ana@example.com' }));
});

test('Enviarlo otra vez waits a short cooldown, sends again and says so', async () => {
	jest.useFakeTimers();
	const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
	renderLogin();
	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com{Enter}');
	await screen.findByRole('heading', { name: 'Mira tu correo' });

	const again = screen.getByRole('button', { name: /Enviarlo otra vez/ });
	expect(again).toBeDisabled();
	for (let s = 0; s < 30; s += 1) act(() => jest.advanceTimersByTime(1000));
	expect(again).toBeEnabled();
	await user.click(again);

	await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(2));
	expect(await screen.findByText('Te lo enviamos otra vez.')).toBeInTheDocument();
	expect(again).toBeDisabled();
});

test('Me equivoqué de correo goes back to the form with the email to fix', async () => {
	const user = userEvent.setup();
	renderLogin();
	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com{Enter}');
	await user.click(await screen.findByRole('button', { name: 'Me equivoqué de correo' }));

	const email = screen.getByLabelText('Correo electrónico');
	expect(email).toHaveValue('ana@example.com');
	expect(email).toHaveFocus();
});

test('a failed link request says so and stays on the form', async () => {
	const user = userEvent.setup();
	renderLogin();
	axiosInstance.post.mockRejectedValueOnce({ response: { status: 429 } });
	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com{Enter}');
	expect(await screen.findByRole('alert')).toHaveTextContent('Pediste muchos enlaces');
	expect(screen.queryByRole('heading', { name: 'Mira tu correo' })).not.toBeInTheDocument();
});

test.each(['Correo electrónico', 'Contraseña'])('with the password shown, pressing Enter in %s sends the login', async field => {
	const user = userEvent.setup();
	renderLogin();

	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
	await showPassword(user);
	expect(screen.getByLabelText('Contraseña')).toHaveFocus();
	await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
	await user.type(screen.getByLabelText(field), '{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/login', { user: 'ana@example.com', password: 'secreta123' })
	);
	expect(axiosInstance.post).not.toHaveBeenCalledWith('/usuario/enlace', expect.anything());
});

test('the password reveal toggle shows and hides the password', async () => {
	const user = userEvent.setup();
	renderLogin();
	await showPassword(user);
	const password = screen.getByLabelText('Contraseña');
	expect(password).toHaveAttribute('type', 'password');
	await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
	expect(password).toHaveAttribute('type', 'text');
	expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
});

test('password sign-in returns to the saved page, never to another site', async () => {
	const user = userEvent.setup();
	const push = renderLogin({ from: { pathname: '//evil.example/x' } });
	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
	await showPassword(user);
	await user.type(screen.getByLabelText('Contraseña'), 'secreta123{Enter}');
	await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
});

test('pressing Enter in the forgot-password email sends the reset link request', async () => {
	const user = userEvent.setup();
	renderLogin();

	await showPassword(user);
	await user.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }));
	const dialog = await screen.findByRole('dialog', { name: '¿Olvidaste tu contraseña?' });
	const email = dialog.querySelector('#forgot-email');
	await user.type(email, 'ana@example.com{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/forgot-password', { email: 'ana@example.com' })
	);
	expect(axiosInstance.post).not.toHaveBeenCalledWith('/usuario/login', expect.anything());
});

test('a signed-out visitor of a protected page signs in and lands back on it', async () => {
	const user = userEvent.setup();
	axiosInstance.get.mockRejectedValueOnce({ response: { status: 401 } }).mockResolvedValue({ data: {} });
	axiosInstance.post.mockResolvedValue({ status: 200, data: {} });
	render(
		<HelmetProvider>
			<MemoryRouter initialEntries={['/mostrar']}>
				<Switch>
					<Route path='/login' component={Login} />
					<ProtectedRoute exact path='/mostrar' component={() => <h1>Pasaporte</h1>} />
				</Switch>
			</MemoryRouter>
		</HelmetProvider>
	);

	await user.type(await screen.findByLabelText('Correo electrónico'), 'ana@example.com');
	await showPassword(user);
	await user.type(screen.getByLabelText('Contraseña'), 'secreta123{Enter}');

	expect(await screen.findByRole('heading', { name: 'Pasaporte' })).toBeInTheDocument();
});
