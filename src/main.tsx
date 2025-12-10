import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import { BrowserRouter } from 'react-router-dom'
import { importFromJSON, setupAutoSync } from './db/dbLocalStorageSync'
//import { importFromRepositoriesJSON, setupAutoSyncRepositories } from './db/repositoriesLocalStorageSync'

async function init() {
 await importFromJSON()
 //await importFromRepositoriesJSON()
 
 //setupAutoSync()
 //setupAutoSyncRepositories()

 ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <BrowserRouter>
    <App />
   </BrowserRouter>
  </React.StrictMode>
 )
}

init()
