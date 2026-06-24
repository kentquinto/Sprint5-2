import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import EventsPage from './pages/EventsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventDetailPage from './pages/EventDetailPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
