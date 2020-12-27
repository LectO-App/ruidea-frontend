import React, { lazy } from 'react';

const Navbar = lazy(() => import('./Navbar'));
const Footer = lazy(() => import('./Footer'));

const PrivacyPolicy = () => {
	return (
		<>
			<Navbar />
			<div className='privacy-policy'>
				<h1>Política de privacidad de RUIDEA</h1>
				<ol className='roman'>
					<li>
						<p className='title'>Responsable del tratamiento</p>
						<p>
							Datos de contacto del responsable: DISFAM, con CIF G57133019, Calle Aragón 215 -Baleares- España (en
							adelante DISFAM)
						</p>
						<p>
							Datos de contacto del Delegado de Protección de Datos: puede contactar en la dirección postal antes
							señalada y/o a través de correo electrónico: <a href='mailto:info@dis.es'>info@dis.es</a>
						</p>
					</li>
					<li>
						<p className='title'>Alcance de la política</p>
						<p>
							Cuando accede y usa esta web, participa en nuestras redes sociales o utiliza cualquier otro medio que
							suponga tratamiento de datos personales se compromete a aceptar esta Política de Privacidad.
						</p>
						<p>
							En DISFAM le proporcionamos información para que, con carácter previo a la cumplimentación de sus datos
							personales, pueda acceder a la Política de Privacidad y a cualquier otra información relevante en materia
							de Protección de Datos.
						</p>
					</li>
					<li>
						<p className='title'>Finalidades del tratamiento de los datos</p>
						<p>¿Con que finalidad tratamos sus datos personales? </p>
						<p>
							Recogemos información personal necesaria para la gestión y mantenimiento de algunos de nuestros servicios,
							así como para otras finalidades establecidas en esta Política de Privacidad.
						</p>
						<p>DISFAM trata sus datos personales con las siguientes finalidades:</p>
						<ul>
							<li>Estadística</li>
							<li>Seguimiento</li>
							<li>Comunicación</li>
						</ul>
						<p>¿En qué supuestos se solicitan datos personales?</p>
						<ul>
							<li>Para efectuar la suscripción a la newsletter de DISFAM.</li>
							<li>Para requerir cualquiera de los servicios y/o productos que ofrecemos.</li>
							<li>Para atender las consultas/reclamaciones/sugerencias/felicitaciones que nos hagan llegar.</li>
							<li>Para gestionar la participación en sorteos, concurso y actos similares.</li>
							<li>Cualesquiera relacionado con las objetivos y fines de la Organización.</li>
						</ul>
						<p>¿Qué uso le daremos a la información personal que utilicemos?</p>
						<ul>
							<li>Para enviarle información sobre nuestros servicios.</li>
							<li>Para gestionar la lista de suscripciones, enviar boletines, promociones y ofertas relacionadas.</li>
							<li>Para la atención al usuario y prestar servicios de seguimiento.</li>
						</ul>
					</li>
					<li>
						<p className='title'>Legitimación</p>
						<p>Tratamos tus datos sobre la base jurídica de prestarte la información o servicios que nos solicite.</p>
						<p>
							En otros casos puede que sea necesario para la ejecución de un contrato que celebra con nosotros, también
							basados en un interés legítimo tal y como describimos en el apartado III,
						</p>
						<p>
							En cada uno de los casos, tendrá plenos derechos sobre sus datos personales y sobre el uso de los mismos y
							podrá ejercitarlos en cualquier momento.
						</p>
						<p>
							En ningún caso cederemos sus datos a terceros sin informarle previamente y requeriremos su consentimiento.
						</p>
						<p>
							El envío de datos de carácter personal es obligatorio para contactar y poder atender la petición que nos
							haga llegar. Asimismo, el no facilitar los datos personales solicitados o el no aceptar la presente
							política de privacidad supone la imposibilidad de suscribirse y procesar las solicitudes realizadas en
							esta web.
						</p>
					</li>
					<li>
						<p className='title'>Destinatarios</p>
						<p>¿A quiénes cedemos sus datos? </p>
						<ol className='numbers'>
							<li>
								Organismos Públicos competentes, Ministerios, Consejerías de las Comunidades Autónomas, Fuerzas y
								Cuerpos de Seguridad del Estado, Jueces y Tribunales, cuando DISFAM tenga la obligación legal de
								facilitarlos.
							</li>
							<li>Organizaciones de las que DISFAM es miembro para los mimos fines y objetivos.</li>
							<li>
								En ningún caso tus datos de carácter personal son compartidos con terceras empresas sin obtener tu
								consentimiento previo, salvo que la cesión de tus datos fuese necesaria para el mantenimiento de la
								relación contigo, así como en los casos previstos por la normativa de protección de datos vigente en
								cada momento.
							</li>
						</ol>
					</li>
					<li>
						<p className='title'>Derechos de protección de datos</p>
						<p>¿Cómo se pueden ejercitar los derechos? </p>
						<p>
							Puedes enviar una comunicación por escrito al domicilio social de DISFAM o a la dirección de correo
							electrónico <a href='mailto:info@dis.es'>info@dis.es</a>, incluyendo en ambos casos fotocopia de su DNI u
							otro documento identificativo similar, para solicitar el ejercicio de los derechos siguientes:
						</p>
						<ul>
							<li>Derecho a solicitar el acceso a los datos personales.</li>
							<li>Derecho a solicitar su rectificación, o a la supresión de los mismos. </li>
							<li>Derecho a oponerse al tratamiento. </li>
						</ul>
						<p>¿Cómo puede reclamar ante la Autoridad de Control? </p>
						<p>
							Si un usuario considera que hay un problema con la forma en que DISFAM está manejando sus datos, puede
							dirigir sus reclamaciones al Delegado de Protección de Datos o a la{' '}
							<a href='https://www.aepd.es/es'>autoridad de control en protección de datos</a> que corresponda, siendo
							la <a href='https://www.aepd.es/es'>Agencia Española de Protección de Datos</a> la indicada en el caso de
							España.
						</p>
					</li>
					<li>
						<p className='title'>Seguridad</p>
						<p>
							En DISFAM mantenemos los más altos niveles de seguridad exigidos por la Ley para proteger tus datos de
							carácter personal frente a pérdidas fortuitas y a accesos, tratamientos o revelaciones no autorizados,
							habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que
							están expuestos. Cuando recibimos tus datos, utilizamos rigurosos procedimientos y funciones de seguridad
							para impedir cualquier acceso no autorizado.
						</p>
					</li>
					<li>
						<p className='title'>Confidencialidad</p>
						<p>
							Los datos personales que se puedan recoger serán tratados con absoluta confidencialidad, comprometiéndonos
							a guardar secreto respecto de los mismos y garantizando el deber de guardarlos adoptando todas las medidas
							necesarias que eviten su alteración, pérdida y tratamiento o acceso no autorizado, de acuerdo con lo
							establecido en la legislación aplicable.
						</p>
					</li>
					<li>
						<p className='title'>Responsabilidad</p>
						<p>
							El usuario será el único responsable a causa de la cumplimentación de los formularios con datos falsos,
							inexactos, incompletos o no actualizados.
						</p>
					</li>
					<li>
						<p className='title'>Cookies</p>
						<p>
							Nuestro sitio web utiliza “cookies" para recabar información sobre la forma de utilización del Sitio Web.{' '}
						</p>
					</li>
				</ol>
			</div>
			<Footer />
		</>
	);
};

export default PrivacyPolicy;
