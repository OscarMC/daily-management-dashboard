// updateJornadas.js (CommonJS para ejecutarse con `node updateJornadas.js`)
const fs = require("fs");
const path = require("path");

// Ruta del JSON de jornadas
const jornadasPath = path.resolve("./public/data/jornadas.json");

// Leer el JSON actual
let jornadas = [];
if (fs.existsSync(jornadasPath)) {
 jornadas = JSON.parse(fs.readFileSync(jornadasPath, "utf8"));
}

// Fecha actual (YYYY-MM-DD)
const today = new Date().toISOString().substring(0, 10);

// Si no existe, agregarla
if (!jornadas.includes(today)) {
 jornadas.push(today);
 jornadas.sort(); // ordenadas cronológicamente
 fs.writeFileSync(jornadasPath, JSON.stringify(jornadas, null, 2), "utf8");
 //console.log(`✅ Día ${today} agregado automáticamente a jornadas.json`);
} else {
 //console.log(`ℹ️ Día ${today} ya existe en jornadas.json`);
}
