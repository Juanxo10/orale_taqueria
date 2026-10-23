import LegalPage, { B, Contacto, Sec, Ul } from "../components/LegalPage";
import { abrirPreferencias } from "../data/preferencias";

const SECCIONES = [
  { id: "responsable", titulo: "Quién es el responsable" },
  { id: "datos", titulo: "Qué datos recogemos" },
  { id: "finalidades", titulo: "Para qué los usamos" },
  { id: "autorizacion", titulo: "Tu autorización" },
  { id: "terceros", titulo: "Con quién los compartimos" },
  { id: "internacional", titulo: "Transferencia a otros países" },
  { id: "derechos", titulo: "Tus derechos" },
  { id: "ejercer", titulo: "Cómo ejercer tus derechos" },
  { id: "cookies", titulo: "Cookies y almacenamiento en tu navegador" },
  { id: "seguridad", titulo: "Seguridad" },
  { id: "conservacion", titulo: "Cuánto tiempo los conservamos" },
  { id: "cambios", titulo: "Cambios a esta política" },
];

export default function Privacidad() {
  const n = (id) => SECCIONES.findIndex((s) => s.id === id) + 1;
  const sec = (id) => ({ id, n: n(id), titulo: SECCIONES[n(id) - 1].titulo });

  return (
    <LegalPage
      titulo="Política de Privacidad"
      secciones={SECCIONES}
      intro="En Órale Taquería cuidamos tus datos. Aquí te contamos qué información personal recogemos cuando haces un pedido, nos escribes o visitas este sitio, para qué la usamos, con quién la compartimos y cómo puedes ejercer tus derechos. Esta política se rige por la Ley 1581 de 2012, el Decreto 1377 de 2013 (incorporado en el Decreto 1074 de 2015) y demás normas colombianas de protección de datos personales."
    >
      <Sec {...sec("responsable")}>
        <p>El responsable del tratamiento de tus datos personales es:</p>
        <Contacto />
      </Sec>

      <Sec {...sec("datos")}>
        <Ul>
          <li>
            <B>Cuando haces un pedido:</B> tu nombre, tu celular o WhatsApp y, solo si pides domicilio, la dirección, el barrio y una referencia
            para llegar. Opcionalmente, las notas que quieras dejarnos. Además guardamos lo que pediste, su valor, el método de pago, el estado del
            pedido, la fecha y hora, y la fecha y hora en que aceptaste esta política.
          </li>
          <li>
            <B>Cuando pagas en línea:</B> el pago se hace en la página de Wompi. <B>Nosotros no recibimos ni guardamos el número de tu tarjeta, tus
            claves ni los datos de tu cuenta bancaria.</B> Wompi solo nos informa si el pago fue aprobado, rechazado o está pendiente, y el
            identificador de la transacción.
          </li>
          <li>
            <B>Cuando nos escribes</B> una sugerencia, queja o reclamo: el tipo de mensaje, tu mensaje y tu nombre (que es opcional).
          </li>
          <li>
            <B>Datos técnicos:</B> para que el sitio funcione y sea seguro, los servidores pueden registrar tu dirección IP y datos básicos de tu
            navegador.
          </li>
        </Ul>
        <p>
          <B>Datos sensibles.</B> No te pedimos datos sensibles. Si en las notas del pedido nos cuentas que tienes una alergia u otra condición de
          salud, es totalmente opcional: lo usamos solo para preparar tu pedido con cuidado. Eres libre de no darlo.
        </p>
        <p>
          <B>Menores de edad.</B> Nuestro servicio de pedidos es para mayores de 18 años y no recogemos a propósito datos de menores.
        </p>
      </Sec>

      <Sec {...sec("finalidades")}>
        <Ul>
          <li>Recibir, preparar, cobrar y entregar tu pedido (a domicilio o para recoger en tienda).</li>
          <li>Contactarte por llamada o WhatsApp sobre tu pedido: confirmación, demoras, dirección o entrega.</li>
          <li>Verificar tu pago y gestionar cancelaciones y reembolsos.</li>
          <li>Atender tus sugerencias, quejas y reclamos.</li>
          <li>Llevar nuestra contabilidad y cumplir obligaciones legales, tributarias y requerimientos de autoridades.</li>
          <li>Hacer estadísticas internas de ventas (por ejemplo, qué productos se piden más) sin identificarte.</li>
          <li>Cuidar la seguridad del servicio y prevenir pedidos falsos o fraudulentos.</li>
        </Ul>
        <p>
          <B>No vendemos tus datos</B> ni los usamos para publicidad de terceros. Si algún día queremos enviarte promociones, te pediremos una
          autorización aparte.
        </p>
      </Sec>

      <Sec {...sec("autorizacion")}>
        <p>
          Al marcar la casilla de aceptación antes de enviar tu pedido nos das tu autorización previa, expresa e informada para tratar tus datos
          con las finalidades de esta política. Guardamos la fecha y la hora como prueba. Sin esa autorización no podemos tomar el pedido.
        </p>
        <p>
          En el formulario de sugerencias, al enviarlo aceptas esta política; puedes dejar el nombre en blanco. Puedes revocar tu autorización cuando
          quieras (ver “Tus derechos”), salvo que la ley o un contrato nos obliguen a conservar los datos.
        </p>
      </Sec>

      <Sec {...sec("terceros")}>
        <p>Solo compartimos los datos que cada uno necesita para prestar el servicio:</p>
        <Ul>
          <li><B>Wompi</B> (pasarela de pagos): procesa tu pago en línea bajo sus propios términos y política de privacidad.</li>
          <li><B>Supabase</B> (base de datos): almacena la información de los pedidos en servidores seguros.</li>
          <li><B>Proveedor de alojamiento</B> del sitio web, para que la página esté disponible.</li>
          <li><B>Google:</B> el mapa de la página de Ubicación (solo si aceptas las cookies) y las tipografías del sitio (Google Fonts).</li>
          <li><B>WhatsApp (Meta):</B> cuando conversamos contigo por ese canal.</li>
          <li><B>Nuestro equipo</B> de cocina, caja y entregas: solo lo necesario para atender tu pedido.</li>
          <li><B>Autoridades,</B> cuando la ley nos lo exija.</li>
        </Ul>
      </Sec>

      <Sec {...sec("internacional")}>
        <p>
          Algunos de estos proveedores, como Supabase, guardan información en servidores ubicados en Estados Unidos. Ese país es reconocido por la
          Superintendencia de Industria y Comercio (SIC) como un país con nivel adecuado de protección de datos. Al aceptar esta política autorizas esa
          transferencia.
        </p>
      </Sec>

      <Sec {...sec("derechos")}>
        <p>Como titular de tus datos tienes derecho a:</p>
        <Ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de la autorización que nos diste.</li>
          <li>Que te informemos cómo hemos usado tus datos.</li>
          <li>Revocar tu autorización y pedir que eliminemos tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
          <li>Acceder gratis a tus datos personales.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (<a className="text-primary underline" href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">www.sic.gov.co</a>) por infracciones a la ley.</li>
        </Ul>
      </Sec>

      <Sec {...sec("ejercer")}>
        <p>
          Escríbenos o llámanos por cualquiera de los canales de contacto de la sección 1 e indícanos tu nombre, el celular con el que hiciste el
          pedido y qué quieres solicitar. Te responderemos así:
        </p>
        <Ul>
          <li><B>Consultas:</B> máximo 10 días hábiles. Si necesitamos más tiempo, te avisamos el motivo y respondemos en máximo 5 días hábiles más.</li>
          <li><B>Reclamos</B> (corregir, suprimir o revocar): máximo 15 días hábiles, prorrogables por 8 días hábiles más con aviso previo.</li>
        </Ul>
        <p>Antes de acudir a la SIC debes haber hecho primero tu consulta o reclamo con nosotros.</p>
      </Sec>

      <Sec {...sec("cookies")}>
        <p>
          <B>No usamos cookies de publicidad ni de analítica propias.</B> Para que el sitio funcione guardamos en tu navegador (almacenamiento local) lo
          siguiente:
        </p>
        <Ul>
          <li><B>Tu carrito</B> mientras compras (necesario para que puedas hacer el pedido).</li>
          <li><B>El resumen de tu último pedido,</B> solo mientras la pestaña esté abierta. Se borra al cerrarla.</li>
          <li><B>Tu decisión sobre las cookies,</B> para no preguntarte en cada visita.</li>
        </Ul>
        <p>Y, de terceros:</p>
        <Ul>
          <li><B>Google Maps</B> (mapa de la página de Ubicación): solo se carga si aceptas todas las cookies, y Google puede usar sus propias cookies.</li>
          <li><B>Google Fonts:</B> al cargar las tipografías, tu navegador se conecta a servidores de Google, que reciben tu dirección IP.</li>
          <li><B>Wompi:</B> al pagar, su sitio puede usar sus propias cookies.</li>
        </Ul>
        <p>
          Puedes cambiar tu elección cuando quieras con el botón de abajo o con el enlace “Preferencias de cookies” del pie de página, y borrar los datos
          del sitio desde la configuración de tu navegador. Si tu navegador bloquea el almacenamiento local, el sitio sigue funcionando, pero tu carrito solo se conserva mientras no recargues la página.
        </p>
        <button
          type="button"
          onClick={abrirPreferencias}
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary-container text-white font-label-md text-sm"
        >
          Cambiar mis preferencias de cookies
        </button>
      </Sec>

      <Sec {...sec("seguridad")}>
        <p>
          Tomamos medidas razonables para proteger tus datos: conexiones cifradas (HTTPS), acceso al panel interno solo para el personal autorizado y con
          contraseña, contraseñas del personal guardadas de forma cifrada, y una base de datos con acceso restringido. Ningún sistema es 100 % infalible;
          si llegáramos a tener un incidente que afecte tus datos, lo gestionaremos conforme a la ley.
        </p>
      </Sec>

      <Sec {...sec("conservacion")}>
        <p>
          Guardamos los datos de tus pedidos mientras sean necesarios para las finalidades de esta política y durante los plazos que exijan las normas
          contables, tributarias y de protección al consumidor. Los mensajes de sugerencias, quejas y reclamos los conservamos mientras sea necesario para
          atenderlos. Cuando ya no se necesiten, los eliminamos o los anonimizamos.
        </p>
      </Sec>

      <Sec {...sec("cambios")}>
        <p>
          Podemos actualizar esta política. Publicaremos la nueva versión en esta página con su fecha y, si el cambio es sustancial, te lo informaremos por
          un medio eficiente antes de aplicarlo.
        </p>
      </Sec>
    </LegalPage>
  );
}
