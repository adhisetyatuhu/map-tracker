import { useContext, useEffect, useState } from 'react'
import './App.css'
import { AuthContext } from './context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Logout from './components/Logout'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import Header from './components/Header'
import SearchMapBox from './components/SearchMapBox'

function App() {
  const { user, role } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin')
    } else if (role === 'driver') {
      console.log('driver worked')
      navigate('/driver')
    }
  }, [role])


  return (
    <>
      {!role ? <h1 className='text-2xl text-red-400 text-center mt-8'>Loading...</h1> :
        <div>
          <div className='container mx-auto'>
            <SearchMapBox />
          </div>
        </div>
      }
    </>
  )
}

export default App
