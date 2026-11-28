import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'flag-icon-css/css/flag-icon.min.css';

import logoRuidea from '../img/svg/logo-ruidea.svg';
import logoRuideaPNG from '../img/png/logo-ruidea.png';
import { deasOf } from '../util/deas';
import { fechaLarga, horaComprobacion } from '../util/fechas';
import { paddedPassportNumber } from '../util/passport';

// Country name -> ISO-3166 alpha-2, for the flag shown beside the country (matches the
// list of countries offered in registration / the downloaded passport).
const PAIS_ISO = {
	España: 'es', Andorra: 'ad', Argentina: 'ar', Bolivia: 'bo', Brasil: 'br',
	Chile: 'cl', Colombia: 'co', 'Costa Rica': 'cr', Cuba: 'cu', Ecuador: 'ec',
	'El Salvador': 'sv', Guatemala: 'gt', México: 'mx', Nicaragua: 'ni', Panamá: 'pa',
	Paraguay: 'py', Perú: 'pe', Portugal: 'pt', 'República Dominicana': 'do',
	Uruguay: 'uy', Venezuela: 've',
};

// The device clock, read again every second. A screenshot keeps the time it was taken.
const useAhora = () => {
	const [ahora, setAhora] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setAhora(new Date()), 1000);
		return () => clearInterval(id);
	}, []);
	return ahora;
};

export const VerificarLayout = ({ pais, children }) => (
	<div className='verif'>
		<header className='verif-header'>
			<div className='verif-header__brand'>
				<picture>
					<source srcSet={logoRuidea} type='image/svg+xml' />
					<img src={logoRuideaPNG} alt='RUIDEA' className='verif-header__logo' />
				</picture>
				<span className='verif-header__title'>Pasaporte DEA</span>
			</div>
			{pais && (
				<p className='verif-header__pais'>
					{PAIS_ISO[pais] && <span className={`flag-icon flag-icon-${PAIS_ISO[pais]}`} aria-hidden='true' />}
					<span>{pais}</span>
				</p>
			)}
		</header>
		<main className='verif-main'>{children}</main>
		<footer className='verif-footer'>
			<p>
				Registro de RUIDEA y{' '}
				<a href='https://disfam.org' target='_blank' rel='noopener noreferrer'>
					Disfam
				</a>{' '}
				· Sistema desarrollado por el equipo de{' '}
				<a href='https://lecto.app' target='_blank' rel='noopener noreferrer'>
					LectO
				</a>
			</p>
		</footer>
	</div>
);

const Sello = () => {
	const ahora = useAhora();
	return (
		<section className='verif-card verif-sello' aria-labelledby='verif-sello-titulo'>
			<div className='verif-sello__marca' aria-hidden='true'>
				<svg className='verif-sello__anillo' viewBox='0 0 64 64'>
					<circle cx='32' cy='32' r='29' />
				</svg>
				<svg className='verif-sello__check' viewBox='0 0 24 24'>
					<path d='M5 12.5l4.5 4.5L19 7.5' />
				</svg>
			</div>
			<div>
				<h1 id='verif-sello-titulo' className='verif-sello__titulo'>
					Pasaporte DEA válido
				</h1>
				<p className='verif-sello__hora' aria-live='off'>
					Comprobado ahora: <time dateTime={ahora.toISOString()}>{horaComprobacion(ahora)}</time>
				</p>
			</div>
			<p className='verif-sello__nota'>
				La hora avanza mientras mira la página. Una captura de pantalla no cambia. La dirección debe ser{' '}
				<strong>pasaporte.dea.ong</strong>.
			</p>
		</section>
	);
};

const PasaporteValido = ({ pasaporte, ejemplo = false }) => {
	const deas = deasOf(pasaporte.diagnostico);
	return (
		<VerificarLayout pais={pasaporte.paisResidencia}>
			{ejemplo && <p className='verif-ejemplo'>Ejemplo con datos ficticios.</p>}
			<Sello />

			<section className='verif-card' aria-labelledby='verif-persona'>
				<h2 id='verif-persona' className='verif-card__titulo'>
					¿Es esta persona?
				</h2>
				<p className='verif-nombre'>
					{pasaporte.nombre} {pasaporte.apellidos}
				</p>
				<dl className='verif-datos'>
					<div>
						<dt>Nacimiento</dt>
						<dd>{fechaLarga(pasaporte.fechaNacimiento)}</dd>
					</div>
					<div>
						<dt>Documento</dt>
						<dd>
							<span className='verif-sr'>Termina en </span>
							<span aria-hidden='true'>•••• </span>
							{pasaporte.documentoFinal}
						</dd>
					</div>
					<div>
						<dt>Pasaporte</dt>
						<dd>N.º {paddedPassportNumber(pasaporte.numeroPasaporte)}</dd>
					</div>
				</dl>
				<p className='verif-card__nota'>Compare el nombre, la fecha y el final del documento con su DNI o pasaporte.</p>
			</section>

			{deas.length > 0 && (
				<section className='verif-card' aria-labelledby='verif-deas'>
					<h2 id='verif-deas' className='verif-card__titulo'>
						Dificultad acreditada
					</h2>
					<ul className='verif-deas'>
						{deas.map(dea => (
							<li key={dea.key}>
								<span className='verif-deas__nombre'>{dea.name}</span>
								<span className='verif-deas__texto'>{dea.text}</span>
							</li>
						))}
					</ul>
				</section>
			)}

			<section className='verif-card' aria-labelledby='verif-significa'>
				<h2 id='verif-significa' className='verif-card__titulo'>
					¿Qué significa?
				</h2>
				<p>
					RUIDEA emitió este pasaporte tras revisar un informe de un profesional. Le rogamos que tenga en cuenta
					estas circunstancias y los derechos que recoge la ley. La persona sabe qué le ayuda: pregúntele.
				</p>
			</section>

			<Link to='/verificar/numero' className='verif-btn verif-btn--ghost'>
				Comprobar otro pasaporte
			</Link>
		</VerificarLayout>
	);
};

export default PasaporteValido;
