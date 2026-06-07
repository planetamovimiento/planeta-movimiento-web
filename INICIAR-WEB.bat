@echo off
title Planeta Movimiento - Servidor local
cd /d "C:\Users\carlo\Proyectos IA carlo\planeta-movimiento-web"
echo ============================================================
echo   PLANETA MOVIMIENTO - Iniciando servidor local...
echo   Espera unos segundos: se abrira el navegador solo.
echo   (Deja ESTA ventana abierta mientras uses la web)
echo ============================================================
echo.
REM Abre el navegador a los 9 segundos, en paralelo
start "" cmd /c "timeout /t 9 >nul & start "" http://localhost:3000"
REM Arranca el servidor de desarrollo
call npm run dev
echo.
echo El servidor se ha detenido. Pulsa una tecla para cerrar.
pause >nul
