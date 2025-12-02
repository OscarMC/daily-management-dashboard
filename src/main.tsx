import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import { BrowserRouter } from 'react-router-dom'
import { importFromJSON, setupAutoSync } from '../src/db/localStorageSync'

async function init() {
 await importFromJSON()
 setupAutoSync()

 ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <BrowserRouter>
    <App />
   </BrowserRouter>
  </React.StrictMode>
 )
}

init()
