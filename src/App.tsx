import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import DailyTasks from './pages/DailyTasks'
import Profile from './pages/Profile'
import Overview from './pages/Overview'
import Branches from './pages/Branches'
import Login from './components/Login'
import Holidays from './pages/Holidays'
import Repositories from './pages/Repositories'
import WorkingDaySummary from './pages/WorkingDaySummary'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import WeeklyReportPage from './pages/WeeklyReportPage'
import { useToastStack } from './components/common/ToastStack'

export default function App() {
 const { ToastContainer } = useToastStack()

 return (
  <Routes>
   <Route path="/auth" element={<AuthPage />} />
   <Route path="/*" element={
    <ProtectedRoute>
     <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
       <Header />
       <main className="flex-1 p-4 overflow-y-auto">
        <Routes>
         <Route path="/" element={<Dashboard />} />
         <Route path="/daily-tasks" element={<DailyTasks />} />
         <Route path="/overview" element={<Overview />} />
         <Route path="/repositories" element={<Repositories />} />
         <Route path="/branches" element={<Branches />} />
         <Route path="/profile" element={<Profile />} />
         <Route path="/working-day-summary" element={<WorkingDaySummary />} />
         <Route path="/login" element={<Login />} />
         <Route path="/holidays" element={<Holidays />} />
         <Route path="/weekly-report-page" element={<WeeklyReportPage />} />
        </Routes>
       </main>
      </div>
   {/* ✅ Contenedor global visible para toda la app */}
      <ToastContainer />
     </div>
    </ProtectedRoute>
   } />
  </Routes>
 )
}
