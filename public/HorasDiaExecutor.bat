@echo off
setlocal enabledelayedexpansion

REM === Nombre del script PowerShell a ejecutar ===
set "PS_SCRIPT=D:\Win\ProyectosDePruebaGitHubMio\daily-management-dashboard\public\HorasDia.ps1"

REM === Comprobar si el archivo existe ===
if not exist "%PS_SCRIPT%" (
    echo No se encontró el archivo %PS_SCRIPT%.
    pause
    exit /b
)

REM === Bucle infinito ejecutando el PS1 cada 30 segundos ===
:loop
echo Ejecutando %PS_SCRIPT% a las %time%
powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
timeout /t 10 >nul
goto loop
