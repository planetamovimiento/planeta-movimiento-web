import Link from 'next/link'

const links = [
  { label: 'Cumpleaños', href: '/servicios/cumpleanos' },
  { label: 'Campamentos', href: '/servicios/campamentos' },
  { label: 'Eventos', href: '/servicios/eventos' },
  { label: 'Talleres', href: '/servicios/talleres' },
  { label: 'Club', href: '/club' },
  { label: 'Colchonetas', href: '/colchonetas' },
]

export default function Footer() {
  return (
    <footer className="bg-pm-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white font-bold">Planeta</span>
              <span className="text-pm-red font-bold">Movimiento</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Centro de referencia en actividades de movimiento y circo en Cuenca.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              {[
                { label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              ].map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label} className="text-white/50 hover:text-pm-red transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Actividades</h3>
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <Link key={link.label} href={link.href} className="text-white/70 text-sm hover:text-pm-red transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>Polígono Los Palancares, 8 · 16004 Cuenca</p>
              <p><a href="mailto:info@planetamovimiento.com" className="hover:text-pm-red transition-colors">info@planetamovimiento.com</a></p>
              <p><a href="tel:+34657606465" className="hover:text-pm-red transition-colors">657 60 64 65</a> · <a href="tel:+34630412595" className="hover:text-pm-red transition-colors">630 41 25 95</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <span>© {new Date().getFullYear()} Planeta Carlos S.L. · Planeta Movimiento. Todos los derechos reservados.</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center">
            <Link href="/terminos-y-condiciones" className="hover:text-pm-red transition-colors">Términos y Condiciones</Link>
            <Link href="/politica-privacidad" className="hover:text-pm-red transition-colors">Privacidad</Link>
            <Link href="/politica-cookies" className="hover:text-pm-red transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
