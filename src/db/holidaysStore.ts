// src/db/holidaysStore.ts
import { useState, useEffect } from 'react';
import { getHolidays, addHoliday, updateHoliday, deleteHoliday } from './api';

export interface Holiday {
 id: number;
 date: string; // "MM-DD" si recurrente, "YYYY-MM-DD" si no
 nombre: string;
 tipo: string; // "nacional" | "local"
 recurrente: boolean;
}

export function useHolidays() {
 const [holidays, setHolidays] = useState<Holiday[]>([]);

 useEffect(() => {
  const load = async () => {
   try {
    const data = await getHolidays();
    // Aseguramos que todos tengan `id` (si el JSON original no lo tenía)
    const withIds = data.map((h: any, i: number) => ({
     ...h,
     id: h.id ?? i + 1
    }));
    setHolidays(withIds);
   } catch (err) {
    console.error('Error loading holidays:', err);
    setHolidays([]);
   }
  };
  load();
 }, []);

 const addHolidayLocal = async (holiday: Omit<Holiday, 'id'>) => {
  try {
   const newHoliday = await addHoliday(holiday);
   setHolidays(prev => [...prev, newHoliday]);
   return newHoliday;
  } catch (err) {
   console.error('Error adding holiday:', err);
   throw err;
  }
 };

 const updateHolidayLocal = async (id: number, updated: Partial<Holiday>) => {
  try {
   const updatedHoliday = await updateHoliday(id, updated);
   setHolidays(prev =>
    prev.map(h => (h.id === id ? updatedHoliday : h))
   );
  } catch (err) {
   console.error('Error updating holiday:', err);
   throw err;
  }
 };

 const deleteHolidayLocal = async (id: number) => {
  try {
   await deleteHoliday(id);
   setHolidays(prev => prev.filter(h => h.id !== id));
  } catch (err) {
   console.error('Error deleting holiday:', err);
   throw err;
  }
 };

 return {
  holidays,
  addHoliday: addHolidayLocal,
  updateHoliday: updateHolidayLocal,
  deleteHoliday: deleteHolidayLocal,
 };
}