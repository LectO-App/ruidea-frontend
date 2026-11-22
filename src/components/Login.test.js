import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Login from './Login';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const renderLogin = () => {
	axiosInstance.post.mockResolvedValue({ status: 200 });
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Login history={{ push: jest.fn() }} />
			</MemoryRouter>
		</HelmetProvider>
	);
};

beforeEach(() => jest.clearAllMocks());

test.each(['Correo electrónico', 'Contraseña'])('pressing Enter in %s sends the login', async field => {
	const user = userEvent.setup();
	renderLogin();

	await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
	await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
	await user.type(screen.getByLabelText(field), '{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/login', { user: 'ana@example.com', password: 'secreta123' })
	);
});

test('pressing Enter in the forgot-password email sends the reset link request', async () => {
	const user = userEvent.setup();
	renderLogin();

	await user.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }));
	const dialog = await screen.findByRole('dialog', { name: '¿Olvidaste tu contraseña?' });
	const email = dialog.querySelector('#forgot-email');
	await user.type(email, 'ana@example.com{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/usuario/forgot-password', { email: 'ana@example.com' })
	);
	expect(axiosInstance.post).not.toHaveBeenCalledWith('/usuario/login', expect.anything());
});
