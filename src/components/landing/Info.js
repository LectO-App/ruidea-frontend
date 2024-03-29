import React from 'react';

import pasaporte from '../../img/svg/pasaporte-illustration.svg';
import pasaportePNG from '../../img/png/pasaporte-illustration.png';

const Info = () => {
	return (
		<section className='section-que-es-ruidea'>
			<div id='que-es-ruidea'></div>

			<div className='titulo-info'>
				<h1>¿Qué es RUIDEA?</h1>
				<p>
					Es el Registro con el que las personas con DEA obtienen un documento verificado, con el fin de que las
					administraciones y las autoridades puedan tener en consideración la legislación vigente y las circunstancias
					que concurren en la persona portadora del pasaporte.
				</p>
			</div>

			<div>
				<div className='item'>
					<div className='container-imagen'>
						<picture>
							<source srcSet={pasaporte} type='image/svg+xml' />
							<img src={pasaportePNG} alt='Ilustración Pasaporte' />
						</picture>
					</div>
					<div className='container-texto'>
						<h2>¿Cómo funciona?</h2>
							<div className="container-textos">
						      <p>
							La persona con algún tipo de dificultad específica del
							aprendizaje (discalculia, dislexia, disortografía, dispraxia y/o
							tda-h) se inscribe en el Registro, aportando un documento que
							avale dicha dificultad, así como, una identificación para poder
							confirmar la validez de ambos documentos.
						      </p>
						      <p>
							Una vez comprobada dicha validez, el sistema envía el pasaporte
							digital a la dirección de correo electrónico facilitada.
						      </p>
						      <p>
							Las autoridades e instituciones podrán verificar la validez del
							documento a través de esta página web o mediante un código QR.
						      </p>
						    </div>
					</div>
				</div>
			</div>
		
			<div className="titulo-info">
							<p>
								Dicho documento es emitido por la Organización Iberoamericana DISFAM, como único representante del
								colectivo en la gran mayoría de países Iberoamericanos.
							</p>
							<p>
								Además, RUIDEA cuenta con el apoyo de la gran mayoría de Países Iberoamericanos, que a través de sus
								Ministerios de Educación, brindaron su apoyo unánime en la Comisión Iberoamericana de Dislexia y otras
								DEAs, celebrada el día 13 de noviembre de 2020.
							</p>
			</div>
		</section>
	);
};

export default Info;
