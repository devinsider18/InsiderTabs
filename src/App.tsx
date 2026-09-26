import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard, Login, Register } from './pages'
import './App.css'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}
