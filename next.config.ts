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
};

export default nextConfig;
