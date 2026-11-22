import React from 'react';
import { render, screen } from '@testing-library/react';
import PasoRevision from './PasoRevision';
import Completion from './Completion';

const props = {
	formData: { nombre: 'Prueba', diagnostico: {} },
	files: { diagnostico: [], documento: [] },
	onBack: () => {},
	onSubmit: async () => {},
	jumpToStep: () => {},
};

test('the review step says the application is not sent until Enviar solicitud is pressed', () => {
	render(<PasoRevision {...props} editing={false} />);
	expect(screen.getByRole('note')).toHaveTextContent('Tu solicitud aún no está enviada.');
	expect(screen.getByRole('button', { name: /Enviar solicitud/ })).toBeInTheDocument();
});

test('editing a sent application saves changes and has no not-sent warning', () => {
	render(<PasoRevision {...props} editing />);
	expect(screen.queryByRole('note')).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeInTheDocument();
});

beforeAll(() => {
	window.scrollTo = () => {};
});

test('the success screen says plainly that the application is sent', () => {
	render(<Completion data={{ mensaje: '¡Listo! Tu solicitud está en camino.' }} reduceMotion historyPush={() => {}} />);
	expect(screen.getByText('Tu solicitud está enviada. Ya no tienes que hacer nada más en el formulario.')).toBeInTheDocument();
});
