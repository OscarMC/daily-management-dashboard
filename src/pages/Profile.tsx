import { useEffect, useState } from 'react'
import { db, UserProfile } from '../db/dexieDB'

export default function Profile() {
 const [user, setUser] = useState<UserProfile | null>(null)

 useEffect(() => {
  db.user.toCollection().first().then((u) => setUser(u || null))
 }, [])

 const handleSave = async () => {
  if (user) await db.user.update(user.id!, user)
  alert('Profile updated successfully')
 }

 return (
  <div className="max-w-lg mx-auto">
   <h2 className="text-xl font-bold mb-4">User Profile</h2>
   {user && (
    <div className="space-y-3">
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-900/80"
      value={user.id}
      onChange={(e) => setUser({ ...user, name: e.target.value })}
      placeholder="Id"
      disabled
     />
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-700"
      value={user.name}
      onChange={(e) => setUser({ ...user, name: e.target.value })}
      placeholder="Name"
     />
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-700"
      value={user.email}
      onChange={(e) => setUser({ ...user, email: e.target.value })}
      placeholder="Email"
     />
     <input
      className="w-full p-2 rounded-md border dark:bg-gray-700"
      value={user.role}
      onChange={(e) => setUser({ ...user, role: e.target.value })}
      placeholder="Role"
     />
     <button
      onClick={handleSave}
      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
     >
      Save
     </button>
    </div>
   )}
  </div>
 )
}
