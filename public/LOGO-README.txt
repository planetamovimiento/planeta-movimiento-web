LOGO DE PLANETA MOVIMIENTO — cómo cambiar / restaurar
=====================================================

Toda la web usa un único archivo de logo: /logo.png
(home giratorio, header/menú, login admin, icono de la app y SEO).
Por eso, para cambiar el logo de la web basta con sustituir ese archivo.

Archivos en esta carpeta (public/):

  - logo.png            -> LOGO ACTIVO (el que se ve ahora en toda la web).
  - logo-original.png   -> LOGO ORIGINAL conservado. NO BORRAR.
  - logo-temporal.png   -> Logo provisional ("Escuela de Superhéroes").
  - logo-origen.png     -> Logo del Club Deportivo Origen (OTRA marca, NO se ha tocado).

ESTADO ACTUAL: logo.png = logo TEMPORAL (escudo "Escuela de Superhéroes").

-----------------------------------------------------
RESTAURAR EL LOGO ORIGINAL (cuando se indique):
  Opción a mano: copia "logo-original.png", pégalo en esta carpeta y
  renómbralo a "logo.png" (sobrescribiendo el actual).

  Opción PowerShell (dentro de la carpeta public):
      Copy-Item logo-original.png logo.png -Force

  Después: hacer push / redeploy en Vercel para que se publique.

VOLVER A PONER EL TEMPORAL:
      Copy-Item logo-temporal.png logo.png -Force
-----------------------------------------------------

Nota: el logo original NO se borra ni se sobrescribe; queda guardado como
logo-original.png para poder volver a él en cualquier momento.
