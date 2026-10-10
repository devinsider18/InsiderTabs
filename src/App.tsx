import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard, Links, Next } from './pages'
import AppShell from './components/AppShell'
import './App.css'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/links' element={<Links />} />
          <Route path='/next' element={<Next />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
