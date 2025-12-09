// src/services/api.ts
const MY_BACKEND = 'http://localhost:4000';

interface MarcajesResponse {
 success: boolean;
 marcajes: string[];
 total: number;
 error?: string;
 message?: string;
}

export const fetchMarcajes = async (email: string, password: string): Promise<MarcajesResponse> => {
 const startTime = Date.now();
 console.log('🔍 [API] Iniciando petición a backend para obtener marcajes...');
 console.log('📧 Email:', email);
 console.log('🔐 Contraseña: [OCULTA por seguridad]');

 const url = `${MY_BACKEND}/cuco/fetch-marcajes`;

 const options: RequestInit = {
  method: 'POST',
  mode: "cors",
  credentials: "omit",
  cache: "no-store",
  headers: {
   "Content-Type": "application/json",
   "Accept": "application/json"
  },
  body:  `{ "email":"${email}", "password":"${password}" }`
 };

 console.log('🚀 Cuerpo de la petición:', `{ "email":"${email}", "password":"${password}" }`);
 console.log('📡 [API] Configuración de la petición:', { url, ...options });
 console.log('🍪 Cookies actuales:', document.cookie || "(ninguna)");

 //if (navigator.serviceWorker) {
 // navigator.serviceWorker.getRegistrations().then(regs => {
 //  if (regs.length > 0) {
 //   console.warn("⚠️ Service Workers activos:", regs.map(r => r.scope));
 //  }
 // });
 //}

 try {
  const res = await fetch(url, options);

  const duration = Date.now() - startTime;
  console.log(`✅ [API] Respuesta recibida en ${duration} ms`);
  console.log('   Status:', res.status);
  console.log('   Status Text:', res.statusText);
  console.log('   Headers:', Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
   const errorText = await res.text();
   console.error('⚠️ Error Body:', errorText);
   throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json() as MarcajesResponse;
  console.log('🎉 Datos recibidos:', data);
  return data;

 } catch (err: any) {
  const duration = Date.now() - startTime;
  console.error(`💥 [API] Error tras ${duration} ms:`, err);
  throw err;
 }
};

export const downloadAsJSON = (data: any, filename = 'marcajes.json') => {
 const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
};
