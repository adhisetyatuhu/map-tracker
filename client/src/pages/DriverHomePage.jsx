import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import React, { use, useEffect, useState } from 'react'
import { db } from '../config/firebase'
import { useNavigate } from 'react-router-dom'

function DriverHomePage() {
    const navigate = useNavigate()
    const [resi, SetResi] = useState('')

    const [listRoutes, setListRoutes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    const getRoutesByProvider = async () => {
        setLoading(true)
        try {
            setError(null)
            const q = query(
                collection(db, 'routes'),
                where('provider', '==', "lionparcel"),
                where('status', '!=' ,'Done')
            )
            const routes = await getDocs(q)
            const routesStore = routes.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            console.log(routesStore)
            setListRoutes(routesStore)
        } catch (error) {
            console.log(error)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getRoutesByProvider()
    }, [])

    const navigateDetail = () => {
        const filterroutes = listRoutes.filter((item) => item.id === resi)
        if (filterroutes.length > 0) {
            navigate('/driver/' + resi)
        } else {
            console.log("Tidak ada resi atau sudah selesai")
        }
    }

    return (
        <div>
            <h1>Driver </h1>
            <div

            >
                <fieldset>
                    <label>Resi</label>
                    <input 
                        className='border p-2 rounded-md'
                        type='text'
                        value={resi}
                        onChange={(e) => SetResi(e.target.value)}
                    />
                </fieldset>
                <fieldset>
                    <button
                        className='bg-blue-500 text-white p-2 rounded-md'
                        type='submit'
                        onClick={navigateDetail} // Redirect to driver page
                    >
                        Submit
                    </button>
                </fieldset>
            </div>
        </div>
    )
}

export default DriverHomePage