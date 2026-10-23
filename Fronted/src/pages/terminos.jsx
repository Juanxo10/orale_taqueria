import LegalPage, { B, Contacto, Sec, Ul } from "../components/LegalPage";

const SECCIONES = [
  { id: "aceptacion", titulo: "Quiénes somos y aceptación" },
  { id: "requisitos", titulo: "Requisitos para pedir" },
  { id: "pedidos", titulo: "Cómo funcionan los pedidos" },
  { id: "precios", titulo: "Precios y formas de pago" },
  { id: "entrega", titulo: "Entrega y recogida" },
  { id: "cancelaciones", titulo: "Cancelaciones, cambios y retracto" },
  { id: "calidad", titulo: "Calidad del pedido y alergias" },
  { id: "alcohol", titulo: "Bebidas alcohólicas" },
  { id: "pqr", titulo: "Peticiones, quejas y reclamos" },
  { id: "uso", titulo: "Uso del sitio y propiedad intelectual" },
  { id: "responsabilidad", titulo: "Responsabilidad" },
  { id: "general", titulo: "Datos personales, cambios y ley aplicable" },
];

export default function Terminos() {
  const n = (id) => SECCIONES.findIndex((s) => s.id === id) + 1;
  const sec = (id) => ({ id, n: n(id), titulo: SECCIONES[n(id) - 1].titulo });

  return (
    <LegalPage
      titulo="Términos de Servicio"
      secciones={SECCIONES}
      intro="Estos términos explican cómo funciona el servicio de pedidos en línea de Órale Taquería: qué puedes esperar de nosotros y qué esperamos de ti. Al hacer un pedido o usar este sitio declaras que los leíste y los aceptas."
    >
      <Sec {...sec("aceptacion")}>
        <p>El servicio lo presta:</p>
        <Contacto />
      </Sec>

      <Sec {...sec("requisitos")}>
        <Ul>
          <li>Debes ser mayor de 18 años para hacer pedidos.</li>
          <li>Debes darnos datos reales y completos (nombre, celular y, para domicilio, dirección y barrio) para poder entregarte y contactarte.</li>
          <li>El domicilio cubre Acacías, Meta, y las zonas que podamos atender. Si tu dirección queda fuera, te lo avisaremos.</li>
        </Ul>
      </Sec>

      <Sec {...sec("pedidos")}>
        <Ul>
          <li>Solo recibimos pedidos cuando la tienda está abierta. Si está cerrada, el sitio te lo indica y no puedes pedir.</li>
          <li>
            Tu pedido queda confirmado al enviarlo si pagas en efectivo al recibir, o cuando Wompi aprueba tu pago si pagas en línea. Mientras el pago
            esté pendiente, el pedido no se prepara.
          </li>
          <li>
            Los productos se preparan al momento. Si alguno se agota, tenemos un dato incorrecto, no logramos contactarte o sospechamos de un pedido
            falso, podemos cancelar el pedido o la parte afectada. Te avisaremos y, si ya habías pagado, te devolvemos el dinero.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("precios")}>
        <Ul>
          <li>Los precios se muestran en pesos colombianos (COP) y son los vigentes al momento de tu pedido.</li>
          <li>
            El valor del domicilio y el total se muestran en el resumen antes de que confirmes. Si eliges recoger en tienda, no pagas domicilio.
          </li>
          <li><B>Efectivo contraentrega:</B> pagas al recibir tu pedido.</li>
          <li>
            <B>Pago en línea (tarjeta, PSE o Nequi):</B> se hace en la plataforma de Wompi, que procesa tus datos de pago. Nosotros no los vemos ni los
            guardamos. Si tu banco rechaza el pago, el pedido queda cancelado y no se te cobra.
          </li>
          <li>
            Si un pago en línea debe devolverse (por ejemplo, porque cancelamos el pedido), lo devolvemos por el mismo medio de pago lo antes posible y,
            en todo caso, dentro de los plazos de la ley.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("entrega")}>
        <Ul>
          <li>
            El tiempo de entrega que ves (por ejemplo, 30 a 45 minutos) es un estimado. Puede cambiar por la cantidad de pedidos, el clima o el tráfico.
          </li>
          <li>Debes estar disponible y atender el teléfono o WhatsApp para recibir tu pedido en la dirección que indicaste.</li>
          <li>
            Si no podemos entregarte por una causa que depende de ti (dirección incorrecta o no logramos contactarte), podemos cancelar el pedido.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("cancelaciones")}>
        <Ul>
          <li>
            Para cancelar o cambiar un pedido, comunícate cuanto antes por teléfono o WhatsApp. Si ya empezamos a prepararlo, puede que no sea posible.
          </li>
          <li>
            <B>Derecho de retracto:</B> por ser alimentos y bebidas preparados al momento, que se deterioran con rapidez, el derecho de retracto de las
            compras a distancia no aplica a estos productos (Ley 1480 de 2011, art. 47). Esto no afecta tus derechos si el pedido llega mal.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("calidad")}>
        <Ul>
          <li>
            Si tu pedido llega incompleto, equivocado o en mal estado, avísanos lo antes posible, el mismo día, con tu número de pedido y, si puedes, una
            foto. Lo resolveremos reponiendo el producto o devolviéndote el dinero, según el caso, sin perjuicio de tus derechos como consumidor.
          </li>
          <li>
            <B>Alergias:</B> puedes indicarlas en las notas del pedido y haremos lo posible por tenerlas en cuenta. Pero preparamos varios productos en la
            misma cocina, por lo que no podemos garantizar que no haya trazas de alérgenos. Si tu alergia es grave, consúltanos antes de pedir.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("alcohol")}>
        <Ul>
          <li>La venta de bebidas alcohólicas está prohibida a menores de 18 años (Ley 124 de 1994).</li>
          <li>Al pedir bebidas alcohólicas declaras ser mayor de edad. Al entregar, podemos pedirte un documento de identidad y no entregar el producto si no lo presentas.</li>
          <li><B>El exceso de alcohol es perjudicial para la salud. Consume con responsabilidad.</B></li>
        </Ul>
      </Sec>

      <Sec {...sec("pqr")}>
        <p>
          Puedes enviarnos una sugerencia, queja o reclamo desde la página{" "}
          <a className="text-primary underline" href="/sugerencias">Sugerencias y reclamos</a> o por teléfono y WhatsApp. Los leemos todos y te
          responderemos lo antes posible. Si no estás de acuerdo con nuestra respuesta, puedes acudir a la Superintendencia de Industria y Comercio (SIC),
          autoridad de protección al consumidor.
        </p>
      </Sec>

      <Sec {...sec("uso")}>
        <Ul>
          <li>No uses el sitio para hacer pedidos falsos, intentar fraudes, afectar su funcionamiento o acceder a zonas que no son públicas.</li>
          <li>
            La marca Órale, el logo, las fotos, los textos y el diseño del sitio son de Órale Taquería o se usan con permiso. No puedes copiarlos ni usarlos
            comercialmente sin autorización por escrito.
          </li>
        </Ul>
      </Sec>

      <Sec {...sec("responsabilidad")}>
        <p>
          Nos esforzamos por mantener el sitio disponible, pero no garantizamos que funcione sin interrupciones ni errores. No somos responsables de fallas
          que dependan de terceros (internet, tu banco, Wompi, tu dispositivo). Nada de lo aquí dicho limita los derechos que la ley te da como consumidor.
        </p>
      </Sec>

      <Sec {...sec("general")}>
        <Ul>
          <li>
            <B>Datos personales:</B> los tratamos como explica nuestra{" "}
            <a className="text-primary underline" href="/privacidad">Política de Privacidad</a>.
          </li>
          <li>
            <B>Cambios:</B> podemos actualizar estos términos. La versión vigente es la publicada en esta página, con su fecha. Los cambios no afectan los
            pedidos ya confirmados.
          </li>
          <li><B>Ley aplicable:</B> estos términos se rigen por las leyes de Colombia, y cualquier diferencia se resolverá ante las autoridades colombianas competentes.</li>
        </Ul>
      </Sec>
    </LegalPage>
  );
}
