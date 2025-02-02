import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import { Homepage, Login, Register, Dashboard, Folders, Settings, Workspace, Response, SharedForm } from './pages'

function App() {
  

  return (
    <Router>
    <ToastContainer position="bottom-center" theme="colored" closeButton={false} />
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/folder/:fid' element={<Folders />} />
      <Route path='/settings' element={<Settings />} />
      <Route path='/workspace' element={<Workspace />} />
      <Route path="/workspace/:workspaceId/edit" element={<Dashboard/>} />
      <Route path='/join-workspace/:workspaceId' element={<Dashboard/>} />
      <Route path='/response' element={<Response />} />
      <Route path='/share/:wid' element={<SharedForm/>} />
    </Routes>
  </Router>
  )
}

export default App
