# === Configuración inicial ===
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$entradaPath = Join-Path $scriptDir "HorasDia.txt"
$resultDir = Join-Path $scriptDir "working-day-results"
if (-not (Test-Path $resultDir)) { New-Item -ItemType Directory -Path $resultDir | Out-Null }

if (-not (Test-Path $entradaPath)) {
    Write-Host "Archivo HorasDia.txt no encontrado." -ForegroundColor Red
    exit
}

# === Leer registros ===
$linea = Get-Content $entradaPath | Select-Object -First 1
$tokens = $linea -split "\|" | ForEach-Object { $_.Trim() } | Where-Object { $_ -match "^\d{2}:\d{2}:\d{2} [ES]" }

# === SANEAR LOS TOKENS: eliminar duplicados consecutivos ===
$cleanTokens = @()
for ($i = 0; $i -lt $tokens.Count; $i++) {
    $current = $tokens[$i]
    if ($current -match "^(\d{2}:\d{2}:\d{2})\s+([ES])") {
        $currentTipo = $matches[2]

        # Si es el último token, siempre se añade
        if ($i -eq $tokens.Count - 1) {
            $cleanTokens += $current
        }
        else {
            $next = $tokens[$i + 1]
            if ($next -match "^(\d{2}:\d{2}:\d{2})\s+([ES])") {
                $nextTipo = $matches[2]

                # Si son del mismo tipo:
                if ($currentTipo -eq $nextTipo) {
                    if ($currentTipo -eq 'E') {
                        # Dos entradas seguidas → mantener la primera (más antigua)
                        $cleanTokens += $current
                    }
                    else {
                        # Dos salidas seguidas → mantener la segunda (más reciente)
                        # → no añadir ahora, se añadirá en la próxima iteración
                    }
                }
                else {
                    # Tipos distintos → añadir normalmente
                    $cleanTokens += $current
                }
            }
            else {
                $cleanTokens += $current
            }
        }
    }
    else {
        $cleanTokens += $current
    }
}

# === Convertir a objetos de entrada/salida ===
$registros = @()
foreach ($t in $cleanTokens) {
    if ($t -match "^(\d{2}):(\d{2}):\d{2} ([ES])") {
        $horaOriginal = [datetime]::ParseExact("$($matches[1]):$($matches[2])", "HH:mm", $null)
        $hora = if ($horaOriginal -lt [datetime]::ParseExact("08:00", "HH:mm", $null)) {
            [datetime]::ParseExact("08:00", "HH:mm", $null)
        }
        else {
            $horaOriginal
        }
        $registros += [PSCustomObject]@{
            HoraOriginal = $horaOriginal
            Hora         = $hora
            Tipo         = $matches[3]
            Texto        = $t
        }
    }
}

# === Inicializar variables ===
$worked = [TimeSpan]::Zero
$breaks = [TimeSpan]::Zero
$previo = [TimeSpan]::Zero
$detalles = @()

# === Verificar tiempo previo a inicio (antes de 08:00) ===
if ($registros.Count -ge 1 -and $registros[0].Tipo -eq 'E' -and $registros[0].HoraOriginal -lt [datetime]::ParseExact("08:00", "HH:mm", $null)) {
    $previo = [datetime]::ParseExact("08:00", "HH:mm", $null) - $registros[0].HoraOriginal
    $detalles += ('{0,-9} {1,-9} {2,-11} {3,-8}' -f $registros[0].HoraOriginal.ToString("HH:mm:ss"), "08:00:00", "Pre Inicio		", $previo.ToString("hh\:mm"))
}

# === Emparejar registros ===
$i = 0
while ($i -lt $registros.Count) {
    if ($registros[$i].Tipo -eq 'E' -and ($i + 1) -lt $registros.Count -and $registros[$i + 1].Tipo -eq 'S') {
        $entrada = $registros[$i].Hora
        $salida = $registros[$i + 1].Hora
        if ($salida -lt $entrada) { $i += 2; continue }
        $duracion = $salida - $entrada
        if ($entrada -ge [datetime]::ParseExact("08:00", "HH:mm", $null)) {
            $worked += $duracion
        }
        $detalles += ('{0,-9} {1,-9} {2,-11} {3,-8}' -f $entrada.ToString("HH:mm:ss"), $salida.ToString("HH:mm:ss"), "Trabajo				", $duracion.ToString("hh\:mm"))
        $i += 2

        if ($i -lt $registros.Count -and $registros[$i - 1].Tipo -eq 'S' -and $registros[$i].Tipo -eq 'E') {
            $pauseStart = $registros[$i - 1].Hora
            $pauseEnd = $registros[$i].Hora
            if ($pauseEnd -gt $pauseStart) {
                $pauseDur = $pauseEnd - $pauseStart
                $breaks += $pauseDur
                $detalles += ('{0,-9} {1,-9} {2,-11} {3,-8}' -f $pauseStart.ToString("HH:mm:ss"), $pauseEnd.ToString("HH:mm:ss"), "Descanso			", $pauseDur.ToString("hh\:mm"))
            }
        }
    }
    else {
        if ($registros[$i].Tipo -eq 'E') {
            $entrada = $registros[$i].Hora
            $salida = Get-Date
            if ($salida -lt $entrada) { $i++; continue }
            $duracion = $salida - $entrada
            if ($entrada -ge [datetime]::ParseExact("08:00", "HH:mm", $null)) {
                $worked += $duracion
            }
            $detalles += ('{0,-9} {1,-9} {2,-11} {3,-8}' -f $entrada.ToString("HH:mm:ss"), $salida.ToString("HH:mm:ss"), "Trabajo				", $duracion.ToString("hh\:mm"))

            # Evitar duplicar último descanso si ya se añadió
            $yaExiste = $detalles | Where-Object { $_ -match "$($registros[$i - 1].Hora.ToString("HH:mm:ss"))\s+$($entrada.ToString("HH:mm:ss"))\s+Descanso" }

            if ($i -gt 0 -and $registros[$i - 1].Tipo -eq 'S' -and -not $yaExiste) {
                $pauseStart = $registros[$i - 1].Hora
                $pauseEnd = $entrada
                if ($pauseEnd -gt $pauseStart) {
                    $pauseDur = $pauseEnd - $pauseStart
                    $breaks += $pauseDur
                    $detalles += ('{0,-9} {1,-9} {2,-11} {3,-8}' -f $pauseStart.ToString("HH:mm:ss"), $pauseEnd.ToString("HH:mm:ss"), "Descanso			", $pauseDur.ToString("hh\:mm"))
                }
            }

            $i++
        }
        else {
            $i++
        }
    }
}

# === Jornada objetivo ===
$hoy = Get-Date
$esViernes = ($hoy.DayOfWeek -eq 'Friday')
$esAgosto = ($hoy.Month -eq 8)
$jornada = if ($esAgosto) {
    [TimeSpan]::FromHours(7)
}
elseif ($esViernes) {
    [TimeSpan]::FromHours(6)
}
else {
    [TimeSpan]::FromHours(8.5)
}
$restante = $jornada - $worked
if ($restante.TotalMinutes -lt 0) { $restante = [TimeSpan]::Zero }

# === Estimar hora de salida si sigo trabajando ===
$ahora = Get-Date
$horaSalidaEstimada = $ahora.Add($restante)

# === Montar salida ===
$fechaHoy = Get-Date -Format "yyyyMMdd"
$resumen = @()
$resumen += "===== REGISTRO DETALLADO [$fechaHoy] ====="
$resumen += "ENTRADA   SALIDA    CONCEPTO     DURACION"
$resumen += "--------  --------  -----------  --------"
$resumen += $detalles
$resumen += "-------------------------------"
$resumen += ("{0,-30}{1,8}" -f "Total preinicio:		", $previo.ToString("hh\:mm"))
$resumen += ("{0,-30}{1,8}" -f "Total trabajado:		", $worked.ToString("hh\:mm"))
$resumen += ("{0,-30}{1,8}" -f "Tiempo restante para jornada:		", $restante.ToString("hh\:mm"))
$resumen += ("{0,-30}{1,8}" -f "Total descansos:		", $breaks.ToString("hh\:mm"))
$resumen += ("{0,-30}{1,8}" -f "Hora estimada de salida:		", $horaSalidaEstimada.ToString("HH:mm"))
$resumen += "-------------------------------"

# === Guardar y abrir ===
$ruta = Join-Path $resultDir ("resumen_jornada_{0}.txt" -f $fechaHoy)
$resumen | Out-File -Encoding UTF8 $ruta
# notepad $ruta