import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import AdminPersonEditor from './pages/admin/AdminPersonEditor'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/people/:slug" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/people/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/people/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        {/* Purana /admin link ab dashboard pe jata hai */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
