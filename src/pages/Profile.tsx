import { useEffect, useState } from 'react'
import { db, UserProfile } from '../db/dexieDB'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
 const { user: authUser, login } = useAuth()
 const [user, setUser] = useState<UserProfile | null>(null)

 useEffect(() => {
  if (authUser) {
   db.user
    .where('email')
    .equals(authUser.email)
    .first()
    .then((dbUser) => {
     if (dbUser) {
      // Aseguramos que theme y language no sean undefined
      const safeUser: UserProfile = {
       id: dbUser.id,
       name: dbUser.name,
       email: dbUser.email,
       role: dbUser.role,
       theme: dbUser.theme || 'light',
       language: dbUser.language || 'es',
      }
      setUser(safeUser)
     } else {
      const newUser: UserProfile = {
       id: authUser.id,
       name: authUser.name,
       email: authUser.email,
       role: authUser.role,
       theme: authUser.theme || 'light',
       language: authUser.language || 'es',
      }
      db.user.add(newUser).then(() => setUser(newUser))
     }
    })
  }
 }, [authUser])

 const handleSave = async () => {
  if (!user || !authUser) return

  // Aseguramos valores no undefined antes de guardar
  const safeUserToSave: UserProfile = {
   id: user.id,
   name: user.name.trim() || 'User',
   email: user.email?.trim() || '',
   role: user.role.trim() || 'User',
   theme: user.theme || 'light',
   language: user.language || 'es',
  }

  // Guardar en Dexie
  await db.user.update(safeUserToSave.id, safeUserToSave)

  // Actualizar sesión
  localStorage.setItem('auth_user', JSON.stringify(safeUserToSave))

  // Re-login para refrescar AuthContext
  await login(safeUserToSave?.email || '', 'dummy') // Tu login ignora pass si no está en el JSON

  alert('Profile updated successfully')
 }

 if (!authUser) {
  return <div className="max-w-lg mx-auto p-4">Loading user...</div>
 }

 // Evitar render si user aún no está listo
 //console.log('Auth User:', user)
 //if (!user) {
 // return <div className="max-w-lg mx-auto p-4">Loading profile...</div>
 //}

 return (
  <div className="max-w-lg mx-auto">
   <h2 className="text-xl font-bold mb-4">User Profile</h2>
   <div className="space-y-3">
    <input
     className="w-full p-2 rounded-md border dark:bg-gray-900/80"
     value={authUser.id}
     disabled
     placeholder="ID"
    />
    <input
     className="w-full p-2 rounded-md border dark:bg-gray-700"
     value={authUser.name}
     onChange={(e) => setUser({ ...authUser, name: e.target.value })}
     placeholder="Name"
    />
    <input
     className="w-full p-2 rounded-md border dark:bg-gray-700"
     value={authUser.email}
     onChange={(e) => setUser({ ...authUser, email: e.target.value })}
     placeholder="Email"
    />
    {authUser.role === 'Admin' ? (
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-700"
      value={authUser.role}
      onChange={(e) => setUser({ ...authUser, role: e.target.value })}
      placeholder="Role"
     />
    ) : (
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-900/80"
       value={authUser.role}
      disabled
      placeholder="Role"
     />
    )}
    <select
     className="w-full p-2 rounded-md border dark:bg-gray-700"
     value={authUser.theme}
         onChange={(e) => setUser({ ...authUser, theme: e.target.value })}
    >
     <option value="light">Light</option>
     <option value="dark">Dark</option>
    </select>
    <select
     className="w-full p-2 rounded-md border dark:bg-gray-700"
         value={authUser.language}
         onChange={(e) => setUser({ ...authUser, language: e.target.value })}
    >
     <option value="en">English</option>
     <option value="es">Español</option>
     <option value="ca">Català</option>
    </select>
    <button
     onClick={handleSave}
     className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
    >
     Save
    </button>
   </div>
  </div>
 )
}