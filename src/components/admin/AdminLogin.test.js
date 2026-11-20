import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdminLogin from './AdminLogin';
import { axiosInstance } from '../../axios';

jest.mock('../../axios', () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
beforeEach(() => {
	jest.clearAllMocks();
	axiosInstance.get.mockRejectedValue(new Error('401'));
	axiosInstance.post.mockResolvedValue({ status: 200 });
});

test.each(['Usuario', 'Contraseña'])('pressing Enter in %s sends the admin login', async field => {
	const user = userEvent.setup();
	render(<AdminLogin history={{ push: jest.fn() }} />);

	await user.type(screen.getByLabelText('Usuario'), 'revisora');
	await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
	await user.type(screen.getByLabelText(field), '{Enter}');

	await waitFor(() =>
		expect(axiosInstance.post).toHaveBeenCalledWith('/admin/login', { user: 'revisora', password: 'secreta123' })
	);
});
