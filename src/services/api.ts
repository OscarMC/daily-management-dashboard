// src/services/api.ts
const MY_BACKEND = 'http://localhost:4000';

// Definimos la interfaz de la respuesta esperada
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
  headers: {
   'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
  credentials: 'omit', // Evita enviar cookies del frontend
 };

 console.log('📡 [API] Configuración de la petición:');
 console.log('   URL:', url);
 console.log('   Método:', options.method);
 console.log('   Headers:', options.headers);
 console.log('   Cuerpo (sin contraseña):', JSON.stringify({ email, password: '***' }));

 try {
  const res = await fetch(url, options);

  const duration = Date.now() - startTime;
  console.log(`✅ [API] Respuesta recibida en ${duration} ms`);
  console.log('   Status:', res.status);
  console.log('   Status Text:', res.statusText);
  console.log('   Headers de respuesta:', Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
   console.warn('⚠️ [API] La respuesta NO es exitosa (res.ok = false)');

   let errorBody = 'Sin cuerpo de error';
   try {
    const errorText = await res.text();
    errorBody = errorText.substring(0, 500);
    console.log('   Cuerpo de error (truncado):', errorBody);
   } catch (e) {
    console.error('❌ [API] No se pudo leer el cuerpo de error:', e);
   }

   throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json() as MarcajesResponse;
  console.log('🎉 [API] Datos recibidos exitosamente:');
  console.log('   Éxito:', data.success);
  console.log('   Total de marcajes:', data.total);
  console.log('   Primeros datos (preview):', data.marcajes ? data.marcajes.slice(0, 2) : 'N/A');

  return data;

 } catch (err: any) {
  const duration = Date.now() - startTime;
  console.error(`💥 [API] Error tras ${duration} ms:`);
  console.error('   Mensaje:', err.message);
  console.error('   Stack:', err.stack);
  throw err;
 }
};

// Descargar como JSON
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