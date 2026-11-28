import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const unconfirmed = { _id: 'u1', nombre: 'Ana', estado: 'pendiente', emailVerificado: false, correoElectronico: 'ana@gmial.com' };

const renderDashboard = data => {
	axiosInstance.get.mockResolvedValue({ data });
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</HelmetProvider>
	);
	return screen.findByRole('heading', { name: 'Falta un paso: confirma tu correo' });
};

const httpError = (status, data) => Object.assign(new Error('http'), { response: { status, data } });

beforeEach(() => {
	axiosInstance.post.mockReset();
});

describe('the unconfirmed card', () => {
	test('shows the address large, marks the likely typo and fixes it in one tap', async () => {
		await renderDashboard(unconfirmed);
		expect(screen.getByText('Tu solicitud está guardada. La revisaremos cuando confirmes tu correo.')).toBeInTheDocument();
		expect(screen.getByText('Te lo enviamos a')).toBeInTheDocument();
		expect(screen.getByText('gmial.com').tagName).toBe('MARK');
		expect(screen.getByText(/¿Quisiste decir/)).toHaveTextContent('¿Quisiste decir gmail.com?');

		axiosInstance.post.mockResolvedValueOnce({ data: { correoElectronico: 'ana@gmail.com' } });
		await userEvent.click(screen.getByRole('button', { name: 'Sí, cambiar a gmail.com' }));

		expect(axiosInstance.post).toHaveBeenCalledWith('/emailVerification/correo', { correoElectronico: 'ana@gmail.com' });
		expect(await screen.findByText('ana@gmail.com')).toHaveClass('email-address');
		expect(screen.getByRole('status')).toHaveTextContent('Te enviamos un código nuevo');
		expect(screen.queryByText(/¿Quisiste decir/)).not.toBeInTheDocument();
	});

	test('shows no hint for an address with a known or unknown domain', async () => {
		await renderDashboard({ ...unconfirmed, correoElectronico: 'ana@colegio-ejemplo.es' });
		expect(screen.getByText('ana@colegio-ejemplo.es')).toBeInTheDocument();
		expect(screen.queryByText(/¿Quisiste decir/)).not.toBeInTheDocument();
		expect(document.querySelector('mark')).toBeNull();
	});

	test('a failed fix says so in plain Spanish and keeps the address', async () => {
		await renderDashboard(unconfirmed);
		axiosInstance.post.mockRejectedValueOnce(httpError(409, { message: 'Ya hay una cuenta con este correo.' }));
		await userEvent.click(screen.getByRole('button', { name: 'Sí, cambiar a gmail.com' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Ya hay una cuenta con este correo.');
		expect(screen.getByText('gmial.com')).toBeInTheDocument();
	});

	test('Reenviar el correo stays as a link-style button and resends', async () => {
		await renderDashboard(unconfirmed);
		axiosInstance.post.mockResolvedValueOnce({ data: 'ok' });
		const resend = screen.getByRole('button', { name: 'Reenviar el correo' });
		expect(resend).toHaveClass('btn-link');
		await userEvent.click(resend);
		expect(axiosInstance.post).toHaveBeenCalledWith('/emailVerification/resend');
	});
});

describe('the code entry', () => {
	test('is one labelled numeric field the phone can fill from the email', async () => {
		await renderDashboard(unconfirmed);
		const field = screen.getByLabelText('Escribe el código del correo');
		expect(field).toHaveAttribute('autocomplete', 'one-time-code');
		expect(field).toHaveAttribute('inputmode', 'numeric');
		expect(screen.getAllByRole('textbox')).toHaveLength(1);
		expect(screen.queryByText(/segundos|minutos/)).not.toBeInTheDocument();
	});

	test('pasting the whole code fills it, and Confirmar shows the normal pending status', async () => {
		await renderDashboard(unconfirmed);
		const field = screen.getByLabelText('Escribe el código del correo');
		await userEvent.click(field);
		await userEvent.paste('482 913');
		expect(field).toHaveValue('482913');

		axiosInstance.post.mockResolvedValueOnce({ data: { emailVerificado: true } });
		await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
		expect(axiosInstance.post).toHaveBeenCalledWith('/emailVerification/codigo', { codigo: '482913' });
		expect(await screen.findByText('Tu solicitud está en camino')).toBeInTheDocument();
	});

	test('a short or wrong code is explained under the field', async () => {
		await renderDashboard(unconfirmed);
		const field = screen.getByLabelText('Escribe el código del correo');
		await userEvent.type(field, '12a3');
		expect(field).toHaveValue('123');
		await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Escribe los 6 números del código.');
		expect(axiosInstance.post).not.toHaveBeenCalled();

		await userEvent.type(field, '456');
		axiosInstance.post.mockRejectedValueOnce(httpError(400, { message: 'El código no es correcto.' }));
		await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('El código no es correcto.');
		expect(field).toHaveAttribute('aria-describedby', 'codigo-correo-error');
		expect(screen.getByRole('heading', { name: 'Falta un paso: confirma tu correo' })).toBeInTheDocument();
	});
});

describe('the change screen', () => {
	const openChange = async () => {
		await renderDashboard(unconfirmed);
		await userEvent.click(screen.getByRole('button', { name: 'Mi correo es otro' }));
		return screen.getByLabelText('Tu correo');
	};

	test('says nothing is lost and has no Léelo despacio box', async () => {
		await openChange();
		expect(screen.getByRole('heading', { name: 'Escribe tu correo bien' })).toBeInTheDocument();
		expect(screen.getByText('Te enviaremos un código nuevo. No pierdes nada de lo que ya enviaste.')).toBeInTheDocument();
		expect(screen.getByText('Desde ahora, entra en RUIDEA con este correo.')).toBeInTheDocument();
		expect(screen.queryByText(/Léelo despacio/)).not.toBeInTheDocument();
	});

	test('a known domain gets the green check', async () => {
		const field = await openChange();
		await userEvent.type(field, 'ana@outlook.es');
		expect(screen.getByText(/outlook\.es es un correo conocido/)).toHaveTextContent(
			'outlook.es es un correo conocido. Revisa también lo que va antes de la @.'
		);
		expect(screen.queryByText(/¿Quisiste decir/)).not.toBeInTheDocument();
	});

	test('a near miss gets the ¿Quisiste decir…? hint, which fixes the field', async () => {
		const field = await openChange();
		await userEvent.type(field, 'ana@hotmial.com');
		expect(screen.getByText(/¿Quisiste decir/)).toHaveTextContent('¿Quisiste decir hotmail.com?');
		await userEvent.click(screen.getByRole('button', { name: 'Sí, cambiar a hotmail.com' }));
		expect(field).toHaveValue('ana@hotmail.com');
		expect(axiosInstance.post).not.toHaveBeenCalled();
		expect(screen.getByText(/es un correo conocido/)).toBeInTheDocument();
	});

	test('an unknown domain gets no message at all', async () => {
		const field = await openChange();
		await userEvent.type(field, 'ana@colegio-ejemplo.es');
		const feedback = document.getElementById('nuevo-correo-feedback');
		expect(feedback).toBeEmptyDOMElement();
		expect(screen.queryByText(/desconocido|no conocemos/i)).not.toBeInTheDocument();
	});

	test('sending saves the address and goes back to the card with it', async () => {
		const field = await openChange();
		await userEvent.type(field, '  Ana@Colegio-Ejemplo.es ');
		axiosInstance.post.mockResolvedValueOnce({ data: { correoElectronico: 'ana@colegio-ejemplo.es' } });
		await userEvent.click(screen.getByRole('button', { name: 'Enviar el código a este correo' }));
		expect(axiosInstance.post).toHaveBeenCalledWith('/emailVerification/correo', { correoElectronico: 'ana@colegio-ejemplo.es' });
		const box = (await screen.findByText('Te lo enviamos a')).parentElement;
		expect(within(box).getByText('ana@colegio-ejemplo.es')).toBeInTheDocument();
	});

	test('an incomplete or taken address is explained, and Volver goes back', async () => {
		const field = await openChange();
		await userEvent.type(field, 'ana@gmail');
		await userEvent.click(screen.getByRole('button', { name: 'Enviar el código a este correo' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Ese correo no está completo.');
		expect(axiosInstance.post).not.toHaveBeenCalled();

		await userEvent.type(field, '.com');
		axiosInstance.post.mockRejectedValueOnce(httpError(409, { message: 'Ya hay una cuenta con este correo.' }));
		await userEvent.click(screen.getByRole('button', { name: 'Enviar el código a este correo' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Ya hay una cuenta con este correo.');

		await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
		expect(screen.getByRole('heading', { name: 'Falta un paso: confirma tu correo' })).toBeInTheDocument();
	});
});
