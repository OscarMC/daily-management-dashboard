// src/components/Login.tsx
import { useState } from 'react';
import { fetchMarcajes } from '../services/api';

export default function Login() {
 const [email, setEmail] = useState<string>('');
 const [password, setPassword] = useState<string>('');
 const [loading, setLoading] = useState<boolean>(false);
 const [result, setResult] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);

 const handleFetch = async () => {
  if (!email.trim() || !password.trim()) {
   alert('Por favor, ingresa email y contraseña');
   return;
  }

  setLoading(true);
  setResult(null);
  setError(null);

  try {
   const response = await fetchMarcajes(email, password);

   if (response.success && Array.isArray(response.marcajes) && response.marcajes.length > 0) {
    // Mostrar el primer resultado (o todos si prefieres)
    const allMarcajes = response.marcajes.join('\n\n');
    setResult(allMarcajes);
   } else {
    setError('No se ha encontrado la información solicitada.');
   }
  } catch (err: any) {
   console.error('Error en Login.tsx:', err);
   setError(err.message || 'Error al obtener los marcajes');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
   <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
    Consultar marcajes de Cuco360
   </h2>

   <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
    className="text-amber-950 block w-full p-2 mb-4 border border-gray-300 rounded"
   />
   <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Contraseña"
    className="text-amber-950 block w-full p-4 mb-4 border border-gray-300 rounded"
   />
   <button
    onClick={handleFetch}
    disabled={loading}
    className={`w-full p-2 rounded font-medium ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
   >
    {loading ? 'Consultando...' : 'Consultar marcajes'}
   </button>

   {result && (
    <div style={{ marginTop: '2rem' }}>
     <h3>✅ Resultado:</h3>
     <pre
      style={{
       backgroundColor: '#f8f9fa',
       padding: '1rem',
       borderRadius: '0.5rem',
       whiteSpace: 'pre-wrap',
       wordBreak: 'break-word',
       maxHeight: '300px',
       overflowY: 'auto',
      }}
     >
      {result}
     </pre>
    </div>
   )}
   {result && (
    <>
     <pre>{result}</pre>
     <button
      onClick={() => {
       const blob = new Blob([result], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `marcajes_${new Date().toISOString().slice(0, 10)}.txt`;
       a.click();
       URL.revokeObjectURL(url);
      }}
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
     >
      Descargar como .txt
     </button>
    </>
   )}
   {error && (
    <div style={{ marginTop: '2rem', color: 'red' }}>
     <h3>❌ Error:</h3>
     <p>{error}</p>
    </div>
   )}
  </div>
 );
}