import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard, Links, Next } from './pages'
import './App.css'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/links' element={<Links />} />
        <Route path='/next' element={<Next />} />
      </Routes>
    </BrowserRouter>
  )
}
