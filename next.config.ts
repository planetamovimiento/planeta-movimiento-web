import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // En los dominios de Vercel (*.vercel.app) pedimos a Google NO indexar
        // (es la versión de pruebas). Tu dominio propio NO coincide con este
        // patrón, así que cuando migres se indexará con normalidad sin tocar nada.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  // Redirecciones 301 (308 permanente) de las URLs antiguas de WordPress a las
  // nuevas, para no perder posicionamiento ni dar errores 404 tras la migración.
  async redirects() {
    return [
      // ── Cumpleaños ──
      { source: "/servicio/celebracion-de-cumpleanos", destination: "/servicios/cumpleanos", permanent: true },
      { source: "/cumpleanos-celebraciones", destination: "/servicios/cumpleanos", permanent: true },

      // ── Campamentos ──
      { source: "/servicio/campamento-familiar-el-hosquillo", destination: "/servicios/campamentos", permanent: true },

      // ── Club / actividades artísticas (Escuela de Bienestar, circo, etc.) ──
      { source: "/escuelas-artisticas/escuela-de-bienestar", destination: "/servicios/escuela-bienestar", permanent: true },
      { source: "/escuelas-artisticas/:slug*", destination: "/club", permanent: true },
      { source: "/deportes", destination: "/club", permanent: true },

      // ── Talleres intensivos ──
      { source: "/intensivos", destination: "/club/talleres-intensivos", permanent: true },

      // ── Eventos / formación ──
      { source: "/eventos/cursos-certificados", destination: "/educacion", permanent: true },
      { source: "/eventos/:slug*", destination: "/servicios/eventos", permanent: true },

      // ── Educación / refuerzo escolar ──
      { source: "/refuerzo-escolar", destination: "/educacion", permanent: true },

      // ── Artículos / otros ──
      { source: "/actividades-para-dias-de-lluvia-en-cuenca-con-ninos", destination: "/ocio", permanent: true },
      { source: "/autorizacion-uso-imagen-menores", destination: "/politica-privacidad", permanent: true },

      // ── Contacto (la web nueva no tiene página propia → home, con datos en el pie) ──
      { source: "/contacto", destination: "/", permanent: true },

      // ── Cualquier otra ficha de servicio antigua no mapeada → Ocio ──
      { source: "/servicio/:slug*", destination: "/ocio", permanent: true },
    ];
  },
};

export default nextConfig;
