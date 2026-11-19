import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from './Dashboard';
import { axiosInstance } from '../axios';

jest.mock('../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const renderDashboard = data => {
	axiosInstance.get.mockResolvedValue({ data });
	render(
		<HelmetProvider>
			<MemoryRouter>
				<Dashboard />
			</MemoryRouter>
		</HelmetProvider>
	);
};

const approved = { _id: 'u1', nombre: 'Ana', emailVerificado: true, estado: 'aceptado', shareToken: 'tok' };

test('the approved dashboard leads with Mostrar mi pasaporte and keeps the other four as secondary', async () => {
	renderDashboard(approved);

	const show = await screen.findByRole('link', { name: 'Mostrar mi pasaporte' });
	expect(show).toHaveAttribute('href', '/mostrar');
	expect(show).toHaveClass('btn-primary');
	expect(screen.getByText('Para enseñarlo en un examen, en el aeropuerto o en la consulta.')).toBeInTheDocument();
	expect(screen.getByText('Ya puedes mostrar, descargar y compartir tu Pasaporte DEA.')).toBeInTheDocument();

	for (const name of ['Descargar PDF', 'Descargar JPG', 'Copiar enlace']) {
		expect(screen.getByRole('button', { name })).toHaveClass('btn-secondary');
	}
	expect(screen.getByRole('link', { name: 'Abrir pasaporte' })).toHaveClass('btn-secondary');
});

test('a pending application has no Mostrar mi pasaporte button', async () => {
	renderDashboard({ ...approved, estado: 'pendiente' });
	await screen.findByText('Tu solicitud está en camino');
	expect(screen.queryByRole('link', { name: 'Mostrar mi pasaporte' })).not.toBeInTheDocument();
});
