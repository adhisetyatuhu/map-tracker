import { useContext, useEffect, useState } from 'react'
import './App.css'
import { AuthContext } from './context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Logout from './components/Logout'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'

function App() {
  const { user, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
      }
    });

    return () => unsubscribe();
  }, [user]);


  return (
    <>
      {!user ? <h1 className='text-2xl text-red-400'>Loading...</h1> :
        <div>
          <h1 className='text-2xl text-red-400'>Welcome {user.email}</h1>
          <Logout />
        </div>
      }
    </>
  )
}

export default App
