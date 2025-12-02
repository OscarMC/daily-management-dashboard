/** @type {import('tailwindcss').Config} */
export default {
 content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"
 ],
 safelist: [
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-gray-500",
  "animate-fade-slide-in"
 ],
 darkMode: "class",
 theme: {
  extend: {}
 },
 plugins: []
};
