import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import CheckPassport from './CheckPassport';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { post: jest.fn() } }));

// Synthetic values only.
const fillAndSubmit = async (doc = ' 40.111.222 ') => {
	const history = { push: jest.fn() };
	render(
		<HelmetProvider>
			<MemoryRouter>
				<CheckPassport history={history} />
			</MemoryRouter>
		</HelmetProvider>
	);
	await userEvent.type(screen.getByLabelText('Número de Pasaporte DEA'), '1001');
	await userEvent.type(screen.getByLabelText('Número de documento del titular'), doc);
	await userEvent.type(screen.getByLabelText('Clave de verificación'), 'clave-de-prueba');
	await userEvent.click(screen.getByRole('button', { name: 'Validar' }));
	return history;
};

beforeEach(() => axiosInstance.post.mockReset());

test('sends the passport number and the document number, and opens the page for that pair', async () => {
	axiosInstance.post.mockResolvedValue({ data: { correcto: true, existe: true } });
	const history = await fillAndSubmit();
	await waitFor(() => expect(history.push).toHaveBeenCalled());
	expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/verificarCheckPassword', {
		pasaporte: '1001',
		documento: '40.111.222',
		password: 'clave-de-prueba',
	});
	expect(history.push).toHaveBeenCalledWith('/verificar/40.111.222/1001');
});

test('still works against a backend that answers with the stored document number', async () => {
	axiosInstance.post.mockResolvedValue({ data: { correcto: true, documento: '40.111.222', existe: true } });
	const history = await fillAndSubmit('40111222');
	await waitFor(() => expect(history.push).toHaveBeenCalledWith('/verificar/40.111.222/1001'));
});

test('a refusal shows one combined message and does not navigate', async () => {
	axiosInstance.post.mockRejectedValue({ response: { status: 401, data: { correcto: false } } });
	const history = await fillAndSubmit();
	expect(await screen.findByText(/Revisa el número de Pasaporte DEA, el número de documento/)).toBeInTheDocument();
	expect(history.push).not.toHaveBeenCalled();
});

test('the document number is required', async () => {
	const history = { push: jest.fn() };
	render(
		<HelmetProvider>
			<MemoryRouter>
				<CheckPassport history={history} />
			</MemoryRouter>
		</HelmetProvider>
	);
	await userEvent.type(screen.getByLabelText('Número de Pasaporte DEA'), '1001');
	await userEvent.type(screen.getByLabelText('Clave de verificación'), 'clave-de-prueba');
	await userEvent.click(screen.getByRole('button', { name: 'Validar' }));
	expect(await screen.findByText('Ingresa el número de documento del titular')).toBeInTheDocument();
	expect(axiosInstance.post).not.toHaveBeenCalled();
});
