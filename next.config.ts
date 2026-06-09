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
  async redirects() {
    return [
      // El botón general de "Reservar" lleva al apartado de Ocio. Esta redirección
      // captura cualquier enlace antiguo o guardado a /reservar.
      { source: "/reservar", destination: "/ocio", permanent: false },
    ];
  },
};

export default nextConfig;
