import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_CONTACT_EMAIL, LegalDocument } from '@/components/common/LegalDocument';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Vitrina Market',
  description: 'Reglas para comprar y vender en Vitrina Market.',
};

export default function TerminosPage() {
  return (
    <LegalDocument title="Términos y Condiciones">
      <p>
        Estos términos regulan el uso de Vitrina Market, un marketplace de Santa Cruz, Bolivia. Al crear una cuenta o hacer un pedido
        aceptas estas condiciones y nuestra <Link href="/privacidad">Política de Privacidad</Link>.
      </p>

      <section>
        <h2>1. Qué es Vitrina Market</h2>
        <p>
          Vitrina Market es una plataforma que muestra productos de tiendas independientes y coordina su entrega. Cada tienda vende
          sus propios productos y es responsable de su descripción, precio, stock, calidad y garantía.
        </p>
      </section>

      <section>
        <h2>2. Tu cuenta</h2>
        <ul>
          <li>Puedes entrar con Google o con un código enviado a tu celular.</li>
          <li>Debes dar datos reales y mantener tu acceso seguro. Eres responsable de lo que se haga desde tu cuenta.</li>
          <li>Podemos suspender cuentas que se usen para fraude, abuso o actividades ilegales.</li>
        </ul>
      </section>

      <section>
        <h2>3. Pedidos, entrega y pago</h2>
        <ul>
          <li>Al confirmar un pedido eliges dirección y horario de entrega. El horario es una estimación y puede variar.</li>
          <li>El pago se hace al recibir, en efectivo o por QR, salvo que la tienda indique otra cosa.</li>
          <li>Revisa el producto al recibirlo. Si no corresponde a lo publicado, puedes rechazarlo en el momento.</li>
          <li>La tienda o Vitrina Market pueden cancelar un pedido si no hay stock o no es posible entregarlo; te avisaremos.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cambios y devoluciones</h2>
        <p>
          Los cambios y devoluciones se gestionan con la tienda según su política. Si tienes un problema con un pedido, escríbenos y
          te ayudamos a resolverlo.
        </p>
      </section>

      <section>
        <h2>5. Si vendes en Vitrina Market</h2>
        <ul>
          <li>Solo puedes publicar productos que tengas derecho a vender y que sean legales en Bolivia.</li>
          <li>Tus publicaciones deben ser veraces: fotos, precios y descripciones reales.</li>
          <li>Te comprometes a preparar y entregar los pedidos aceptados en el horario acordado.</li>
          <li>Si conectas tu cuenta de TikTok, autorizas que mostremos tus transmisiones en vivo públicas dentro del sitio.</li>
          <li>Podemos retirar publicaciones o tiendas que incumplan estas reglas.</li>
        </ul>
      </section>

      <section>
        <h2>6. Uso aceptable</h2>
        <p>
          No uses el sitio para enviar spam, suplantar a otras personas, extraer datos de forma automatizada ni interferir con su
          funcionamiento.
        </p>
      </section>

      <section>
        <h2>7. Responsabilidad</h2>
        <p>
          Hacemos lo posible por que el servicio funcione bien, pero se ofrece «tal como está». En la medida que permita la ley,
          Vitrina Market no responde por los productos vendidos por las tiendas ni por daños indirectos derivados del uso del sitio.
        </p>
      </section>

      <section>
        <h2>8. Cambios y ley aplicable</h2>
        <p>
          Podemos actualizar estos términos; publicaremos la nueva versión aquí con su fecha. Se rigen por las leyes del Estado
          Plurinacional de Bolivia. Para cualquier consulta escribe a <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalDocument>
  );
}
