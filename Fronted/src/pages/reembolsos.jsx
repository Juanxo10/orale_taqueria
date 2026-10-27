import LegalPage, { B, Contacto, Sec, Ul } from "../components/LegalPage";

const SECCIONES = [
  { id: "cancelar", titulo: "Cómo cancelar un pedido" },
  { id: "reembolsos", titulo: "Cuándo te devolvemos el dinero" },
  { id: "plazos", titulo: "Plazos y medio de devolución" },
  { id: "no", titulo: "Cuándo no aplica" },
  { id: "contacto", titulo: "Cómo solicitarlo" },
];

export default function Reembolsos() {
  const n = (id) => SECCIONES.findIndex((s) => s.id === id) + 1;
  const sec = (id) => ({ id, n: n(id), titulo: SECCIONES[n(id) - 1].titulo });

  return (
    <LegalPage
      titulo="Cancelaciones y Reembolsos"
      secciones={SECCIONES}
      intro="Así manejamos las cancelaciones y las devoluciones de dinero de los pedidos hechos en este sitio. Complementa los Términos de Servicio."
    >
      <Sec {...sec("cancelar")}>
        <Ul>
          <li>Puedes cancelar sin costo mientras tu pedido no haya empezado a prepararse. Escríbenos o llámanos cuanto antes por teléfono o WhatsApp con tu número de pedido.</li>
          <li>Si ya empezamos a prepararlo, puede que no sea posible cancelarlo, porque son alimentos hechos al momento.</li>
          <li>Nosotros podemos cancelar un pedido si no podemos entregarlo, si falta un producto o si no logramos contactarte. En ese caso no se te cobra.</li>
        </Ul>
      </Sec>

      <Sec {...sec("reembolsos")}>
        <p>Te devolvemos el dinero (o reponemos el producto, si lo prefieres) cuando:</p>
        <Ul>
          <li>Cancelamos tu pedido y ya habías pagado en línea.</li>
          <li>Tu pedido llega incompleto, equivocado o en mal estado y nos avisas el mismo día, con tu número de pedido y, si puedes, una foto.</li>
          <li>Se te cobró dos veces o un valor distinto al del pedido.</li>
        </Ul>
        <p>Por ser alimentos preparados al momento, el derecho de retracto no aplica (Ley 1480 de 2011, art. 47), pero esto no limita tu derecho a reclamar por un producto defectuoso.</p>
      </Sec>

      <Sec {...sec("plazos")}>
        <Ul>
          <li><B>Pagos en caja (recogida en tienda):</B> no se cobra nada si el pedido se cancela; si ya pagaste, te devolvemos el dinero en el momento o por transferencia.</li>
          <li><B>Pagos en línea (Wompi):</B> aprobamos la devolución en un máximo de 5 días hábiles y se hace por el mismo medio de pago. Que el dinero se vea reflejado puede tardar entre 5 y 15 días hábiles adicionales, según tu banco o entidad.</li>
          <li>Si tu banco rechaza el pago, el pedido queda cancelado y no se te cobra.</li>
        </Ul>
      </Sec>

      <Sec {...sec("no")}>
        <Ul>
          <li>Pedidos entregados correctamente en la dirección indicada y que fueron preparados según lo pedido.</li>
          <li>Cancelaciones pedidas cuando el pedido ya salió a domicilio.</li>
          <li>Cambios de opinión sobre el sabor o gusto personal.</li>
        </Ul>
      </Sec>

      <Sec {...sec("contacto")}>
        <p>Escríbenos por cualquiera de estos medios y te respondemos lo antes posible:</p>
        <Contacto />
        <p>Si no estás de acuerdo con nuestra respuesta, puedes acudir a la Superintendencia de Industria y Comercio (SIC).</p>
      </Sec>
    </LegalPage>
  );
}
