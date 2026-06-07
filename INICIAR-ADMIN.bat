@echo off
title Planeta Movimiento - Panel de Administracion
cd /d "C:\Users\carlo\Proyectos IA carlo\planeta-movimiento-web"

REM ¿El servidor ya esta en marcha? (si responde, solo abrimos el panel)
curl -s -o nul --max-time 3 http://localhost:3000
if %errorlevel%==0 (
  echo Servidor ya activo. Abriendo el panel de administracion...
  start "" http://localhost:3000/admin
  exit /b
)

echo ============================================================
echo   PLANETA MOVIMIENTO - Panel de Administracion
echo   Iniciando servidor... el panel se abrira solo.
echo   (Deja ESTA ventana abierta mientras uses el panel)
echo ============================================================
echo.
REM Abre el panel a los 10 segundos, en paralelo
start "" cmd /c "timeout /t 10 >nul & start "" http://localhost:3000/admin"
REM Arranca el servidor de desarrollo
call npm run dev
echo.
echo El servidor se ha detenido. Pulsa una tecla para cerrar.
pause >nul
