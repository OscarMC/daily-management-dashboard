// src/server.ts
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/cuco/fetch-marcajes', async (req, res) => {
 const { email, password } = req.body;

 if (!email || !password) {
  return res.status(400).json({ error: 'Email y contraseña son requeridos' });
 }

 console.log('✅ Iniciando automatización de Cuco360...');

 // ✅ Lanzar navegador normal (createIncognitoBrowserContext no existe en todas las versiones)
 const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
 });
 // ✅ Crear un contexto aislado (modo incógnito)
 const context = await browser.createBrowserContext();
 const page = await context.newPage()

 try {
  // 1. Ir a la página principal — ✅ sin espacios
  await page.goto('https://cuco360.cucorent.com', {
   waitUntil: 'networkidle2',
   timeout: 15000,
  });

  // 2. Rellenar el campo "Usuario o Email"
  await page.type('input[name="val_login"]', email.trim());
  console.log('✅ Usuario ingresado');
  await new Promise(r => setTimeout(r, 500));

  // 3. Hacer clic en "Continuar"
  await page.click('button.btn[type="submit"]');
  console.log('✅ Clic en Continuar realizado');

  // 4. Esperar a que aparezca el campo de contraseña
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  console.log('✅ Campo de contraseña visible');

  // 5. Rellenar la contraseña
  await page.type('input[type="password"]', password);
  console.log('✅ Contraseña ingresada');
  await new Promise(r => setTimeout(r, 1000));

  // 6. Hacer clic en "Acceder"
  await page.click('button.btn[type="submit"]');
  console.log('✅ Clic en Acceder realizado');

  // 7. Esperar redirección tras login
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  console.log('✅ Navegación tras login completada');

  // 8. Ir a /face2face — ✅ sin espacios
  await page.goto('https://cuco360.cucorent.com/face2face', {
   waitUntil: 'networkidle2',
   timeout: 15000,
  });

  // Verificar autenticación
  const isLoggedIn = await page.$('input[name="_token"]') !== null;
  if (!isLoggedIn) {
   throw new Error('❌ No estás autenticado. El login falló.');
  }
  console.log('✅ Página /face2face cargada');

  // ✅ Tipado explícito para evitar "Parameter 'el' implicitly has an 'any' type"
  const csrfToken = await page.$eval('input[name="_token"]', (el: HTMLInputElement) => el.value);
  if (!csrfToken) {
   throw new Error('❌ No se encontró _token en /face2face');
  }
  console.log('✅ _token CSRF extraído:', csrfToken);

  // 9. Rango de fechas del día actual
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const rango = `${day}/${month}/${year} - ${day}/${month}/${year}`;
  console.log('✅ Rango generado:', rango);

  // 10. Hacer POST a /f2ffilter
  // ✅ Tipado explícito de los parámetros en page.evaluate
  const tableHtml = await page.evaluate(
   async (csrfToken: string, rango: string) => {
    try {
     await new Promise(r => setTimeout(r, 300));
     const formData = new URLSearchParams();
     formData.append('_token', csrfToken);
     formData.append('cod_cliente', '947');
     formData.append('rango', rango);
     formData.append('order', 'nom_empleado');
     formData.append('type', 'empleado');
     formData.append('document', 'pantalla');
     formData.append('orientation', 'v');
     formData.append('mostrar_checks', '1');

     const response = await fetch('/face2face/f2ffilter', {
      method: 'POST',
      headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString(),
     });

     if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error ${response.status}: ${text.substring(0, 200)}`);
     }
     return await response.text();

    }
    catch (err: any) {
     console.error('❌ Error en page.evaluate:', err.message);
     throw err;
    }
   },
   csrfToken,
   rango
  );

  console.log('✅ Tabla recibida. Longitud:', tableHtml.length);

  // Parsear con cheerio
  const cheerio = await import('cheerio');
  const $ = cheerio.load(`<table>${tableHtml}</table>`);
  const marcajes: string[] = [];

  $('tr').each((_, el) => {
   const text = $(el).find('.column5').text().trim();
   if (text) marcajes.push(text);
  });

  await browser.close();
  console.log(`✅ Éxito: ${marcajes.length} marcajes extraídos`);
  return res.json({ success: true, marcajes, total: marcajes.length });

 } catch (err: any) {
  console.error('❌ Error en Puppeteer:', err.message);
  await browser.close();
  return res.status(500).json({ error: 'Error al procesar la solicitud', message: err.message });
 }
});

app.listen(PORT, () => {
 console.log(`✅ Backend con Puppeteer escuchando en http://localhost:${PORT}`);
});