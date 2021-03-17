import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { axiosInstance } from '../../axios';

const AdminModify = props => {
	const { id } = props.match.params;
	const [user, setUser] = useState({});
	const { register, handleSubmit, errors } = useForm();

	const getUserFromAPI = useCallback(async () => {
		try {
			const res = await axiosInstance.post(`/admin/solicitudes/${id}`);
			setUser(res.data.usuario);
			console.log(res.data.usuario);
		} catch (err) {
			console.log(err);
		}
	}, [id]);

	const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

	useEffect(() => {
		getUserFromAPI();
	}, [getUserFromAPI]);

	const sendDataToAPI = async data => {
		const dataToSend = { ...data, id, estado: 'aceptado' };
		const res = await axiosInstance.post('/admin/modificarSolicitud', dataToSend);
		if (res.status === 200)
			Swal.fire({
				icon: 'success',
				title: 'Enviado!',
			}).then(() => {
				props.history.push('/admin/solicitudes');
			});
	};

	return (
		<div className='admin-modify'>
			<h1>
				Modificar los datos de la solicitud de {user.nombre} {user.apellidos}
			</h1>
			<form onSubmit={handleSubmit(sendDataToAPI)}>
				<div className='row'>
					<div className='wrapper-form'>
						<label htmlFor='nombre'>Nombre</label>
						{errors.nombre && <span className='error-message'>{errors.nombre.message}</span>}
						<input
							autoFocus
							type='text'
							name='nombre'
							id='nombre'
							defaultValue={user.nombre}
							ref={register({
								required: 'Por favor, rellene este campo',
								pattern: {
									value: /[a-zA-Z]/,
									message: 'Sólo se admiten letras y espacios.',
								},
							})}
						/>
					</div>
					<div className='wrapper-form'>
						<label htmlFor='apellidos'>Apellidos</label>
						{errors.apellidos && <span className='error-message'>{errors.apellidos.message}</span>}
						<input
							type='text'
							name='apellidos'
							id='apellidos'
							defaultValue={user.apellidos}
							ref={register({
								required: 'Por favor, rellene este campo',
								pattern: {
									value: /[a-zA-Z]/,
									message: 'Sólo se admiten letras y espacios.',
								},
							})}
						/>
					</div>
				</div>
				<div className='row'>
					<div className='wrapper-form'>
						<label htmlFor='paisResidencia'>País de residencia</label>
						{errors.paisResidencia && <span className='error-message'>{errors.paisResidencia.message}</span>}
						<select
							name='paisResidencia'
							id='paisResidencia'
							ref={register({ required: 'Por favor, rellene este campo' })}
							defaultValue={user.paisResidencia}
						>
							<option value='' disabled>
								Seleccione un país
							</option>
							<option value='Andorra'>Andorra</option>
							<option value='Argentina'>Argentina</option>
							<option value='Bolivia'>Bolivia</option>
							<option value='Brasil'>Brasil</option>
							<option value='Chile'>Chile</option>
							<option value='Colombia'>Colombia</option>
							<option value='Costa Rica'>Costa Rica</option>
							<option value='Cuba'>Cuba</option>
							<option value='Ecuador'>Ecuador</option>
							<option value='El Salvador'>El Salvador</option>
							<option value='España'>España</option>
							<option value='Guatemala'>Guatemala</option>
							<option value='México'>México</option>
							<option value='Nicaragua'>Nicaragua</option>
							<option value='Panamá'>Panamá</option>
							<option value='Paraguay'>Paraguay</option>
							<option value='Perú'>Perú</option>
							<option value='Portugal'>Portugal</option>
							<option value='República Dominicana'>República Dominicana</option>
							<option value='Uruguay'>Uruguay</option>
							<option value='Venezuela'>Venezuela</option>
						</select>
					</div>

					<div className='wrapper-form'>
						<label htmlFor='localidadResidencia'>Localidad</label>
						{errors.localidadResidencia && <span className='error-message'>{errors.localidadResidencia.message}</span>}
						<input
							type='text'
							name='localidadResidencia'
							id='localidadResidencia'
							defaultValue={user.localidadResidencia}
							ref={register({ required: 'Por favor, rellene este campo' })}
						/>
					</div>
				</div>
				<div className='row'>
					<div className='wrapper-form'>
						<label htmlFor='lugarNacimiento'>Lugar de nacimiento</label>
						{errors.lugarNacimiento && <span className='error-message'>{errors.lugarNacimiento.message}</span>}
						<input
							type='text'
							name='lugarNacimiento'
							id='lugarNacimiento'
							placeholder='Ciudad y País'
							defaultValue={user.lugarNacimiento}
							ref={register({ required: 'Por favor, rellene este campo' })}
						/>
					</div>

					<div className='wrapper-form'>
						<label htmlFor='fechaNacimiento'>Fecha de nacimiento</label>
						{errors.fechaNacimiento && <span className='error-message'>{errors.fechaNacimiento.message}</span>}
						<input
							type='date'
							name='fechaNacimiento'
							id='fechaNacimiento'
							defaultValue={user.fechaNacimiento ? user.fechaNacimiento.substring(0, 10) : ''}
							ref={register({ required: 'Por favor, rellene este campo' })}
						/>
					</div>
				</div>
				<div className='row'>
					<div className='wrapper-form'>
						<label htmlFor='numeroDocumento'>Numero de documento</label>
						{errors.numeroDocumento && <span className='error-message'>{errors.numeroDocumento.message}</span>}
						<input
							autoFocus
							type='text'
							name='numeroDocumento'
							id='numeroDocumento'
							defaultValue={user.numeroDocumento}
							ref={register({ required: 'Por favor, rellene este campo' })}
						/>
					</div>

					<div className='wrapper-form'>
						<label htmlFor='numeroTelefono'>Numero de teléfono móvil</label>
						{errors.numeroTelefono && <span className='error-message'>{errors.numeroTelefono.message}</span>}
						<input
							type='text'
							name='numeroTelefono'
							id='numeroTelefono'
							defaultValue={user.numeroTelefono}
							ref={register({
								required: 'Por favor, rellene este campo',
								pattern: {
									value: /^[0-9+ ]+$/gm,
									message: 'Por favor ingrese un número de teléfono válido',
								},
							})}
						/>
					</div>
				</div>
				<div className='row'>
					<div className='wrapper-form'>
						<label htmlFor='correoElectronico'>Correo electrónico</label>
						{errors.correoElectronico && <span className='error-message'>{errors.correoElectronico.message}</span>}
						<input
							type='text'
							name='correoElectronico'
							id='correoElectronico'
							defaultValue={user.correoElectronico}
							ref={register({
								required: 'Por favor, rellene este campo',
								pattern: {
									value: emailRegex,
									message: 'Por favor ingrese una dirección de correo válida',
								},
							})}
						/>
					</div>
				</div>
				<h3>Seleccione las dificultades</h3>
				<div className='checkbox-wrapper'>
					<input
						type='checkbox'
						name='dislexia'
						id='dislexia'
						defaultChecked={user.diagnostico?.dislexia}
						ref={register()}
					/>
					<label htmlFor='dislexia'>Dislexia</label>
				</div>
				<div className='checkbox-wrapper'>
					<input
						type='checkbox'
						name='discalculia'
						id='discalculia'
						defaultChecked={user.diagnostico?.discalculia}
						ref={register}
					/>
					<label htmlFor='discalculia'>Discalculia</label>
				</div>
				<div className='checkbox-wrapper'>
					<input
						type='checkbox'
						name='disortografía'
						id='disortografía'
						defaultChecked={user.diagnostico?.disortografía}
						ref={register}
					/>
					<label htmlFor='disortografía'>Disortografía</label>
				</div>
				<div className='checkbox-wrapper'>
					<input
						type='checkbox'
						name='dispraxia'
						id='dispraxia'
						defaultChecked={user.diagnostico?.dispraxia}
						ref={register}
					/>
					<label htmlFor='dispraxia'>Dispraxia</label>
				</div>
				<div className='checkbox-wrapper'>
					<input type='checkbox' name='tdah' id='tdah' defaultChecked={user.diagnostico?.tdah} ref={register} />
					<label htmlFor='tdah'>TDA-H</label>
				</div>
				{errors.dislexia && <h4 className='error-message'>{errors.dislexia.message}</h4>}

				<button>Enviar y aceptar solicitud</button>
			</form>
		</div>
	);
};

export default AdminModify;
