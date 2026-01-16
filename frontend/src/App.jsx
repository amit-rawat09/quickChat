import React, { useContext } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { Toaster } from "react-hot-toast";
import { AuthContext } from './context/AuthContext.jsx'

function App() {
  const { authuser } = useContext(AuthContext)

  return (
    <div className='bg-[url("./src/assets/bgImage.svg")] bg-no-repeat bg-center'>
      <Toaster />
      <Routes>
        <Route path='/' element={authuser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authuser ? <Login /> : <Navigate to="/" />} />
        <Route path='/profile' element={authuser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App