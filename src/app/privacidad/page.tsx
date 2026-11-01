import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_CONTACT_EMAIL, LegalDocument } from '@/components/common/LegalDocument';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Vitrina Market',
  description: 'Qué datos recoge Vitrina Market, para qué los usa y cómo puedes pedir que los borremos.',
};

export default function PrivacidadPage() {
  return (
    <LegalDocument title="Política de Privacidad">
      <p>
        Vitrina Market es un marketplace de Santa Cruz, Bolivia, que conecta a compradores con tiendas locales. Esta política explica
        qué datos tratamos cuando usas el sitio, para qué y qué control tienes sobre ellos.
      </p>

      <section>
        <h2>1. Datos que recogemos</h2>
        <ul>
          <li><strong>Cuenta:</strong> nombre, correo electrónico y foto de perfil si entras con Google; número de celular si entras con un código por SMS o WhatsApp.</li>
          <li><strong>Entrega:</strong> la dirección y la ubicación que marcas en el mapa, las referencias para el repartidor y tu celular de contacto.</li>
          <li><strong>Pedidos:</strong> productos, montos, horario de entrega elegido, método de pago (efectivo o QR al recibir) y estado del pedido.</li>
          <li><strong>Tiendas:</strong> si vendes, los datos de tu tienda, tus productos y, si la conectas, la información pública básica de tu cuenta de TikTok.</li>
          <li><strong>Técnicos:</strong> una cookie de sesión para mantenerte conectado y registros básicos del servidor para seguridad y errores.</li>
        </ul>
      </section>

      <section>
        <h2>2. Para qué los usamos</h2>
        <ul>
          <li>Crear tu cuenta e iniciar sesión.</li>
          <li>Procesar tus pedidos y coordinar la entrega con la tienda y el repartidor.</li>
          <li>Avisarte sobre el estado de tus pedidos.</li>
          <li>Mostrar las tiendas y sus transmisiones en vivo.</li>
          <li>Prevenir fraude y mantener el servicio seguro.</li>
        </ul>
        <p className="mt-2">No vendemos tus datos ni los usamos para publicidad de terceros.</p>
      </section>

      <section>
        <h2>3. Datos de tu cuenta de Google</h2>
        <p>
          Si eliges «Continuar con Google», solo pedimos los permisos <code>openid</code>, <code>email</code> y <code>profile</code>, es decir,
          tu nombre, correo y foto de perfil. Los usamos únicamente para identificarte en Vitrina Market. No accedemos a tu Gmail,
          contactos, archivos ni otros servicios de Google.
        </p>
        <p className="mt-2">
          El uso y la transferencia a cualquier otra aplicación de la información recibida de las APIs de Google cumplirán la{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Política de Datos del Usuario de los Servicios de las APIs de Google
          </a>, incluidos los requisitos de Uso Limitado.
        </p>
      </section>

      <section>
        <h2>4. Con quién los compartimos</h2>
        <ul>
          <li><strong>La tienda y el repartidor</strong> de tu pedido reciben tu nombre, celular y dirección de entrega, solo para entregarlo.</li>
          <li><strong>Proveedores técnicos</strong> que alojan el servicio o envían códigos de acceso (por ejemplo Vercel, Railway, Google/Firebase y Meta/WhatsApp), que tratan los datos por cuenta nuestra.</li>
          <li><strong>Autoridades</strong>, cuando la ley lo exija.</li>
        </ul>
      </section>

      <section>
        <h2>5. Cuánto tiempo los guardamos</h2>
        <p>
          Guardamos tus datos mientras tengas una cuenta. Los registros de pedidos pueden conservarse el tiempo que exijan las
          obligaciones contables y legales aplicables.
        </p>
      </section>

      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes pedirnos ver, corregir o borrar tus datos, o cerrar tu cuenta, escribiendo a{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. También puedes quitar el acceso de Vitrina Market a tu cuenta
          de Google en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.
        </p>
      </section>

      <section>
        <h2>7. Seguridad y menores</h2>
        <p>
          Usamos conexiones cifradas (HTTPS) y limitamos el acceso a los datos a quien lo necesita. El servicio no está dirigido a
          menores de 18 años sin autorización de sus padres o tutores.
        </p>
      </section>

      <section>
        <h2>8. Cambios</h2>
        <p>
          Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha. Consulta también nuestros{' '}
          <Link href="/terminos">Términos y Condiciones</Link>.
        </p>
      </section>
    </LegalDocument>
  );
}
