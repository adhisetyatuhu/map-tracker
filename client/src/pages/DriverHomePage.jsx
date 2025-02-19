import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import React, { use, useEffect, useState } from 'react'
import { db } from '../config/firebase'
import { useNavigate } from 'react-router-dom'
import { TruckSpeedIcon } from '../utils/icons'

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
                where('status', '!=', 'Done')
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
        <div className='container mx-auto'>
            <div className='mt-20 flex flex-col items-center gap-4'>
                <h1 className='text-2xl font-bold uppercase text-center'>Package Tracking </h1>
                <div className='flex gap-2'>
                    <fieldset>
                        <input
                            className='border p-2 rounded-md min-w-80'
                            type='text'
                            placeholder='Enter your tracking number'
                            value={resi}
                            onChange={(e) => SetResi(e.target.value)}
                        />
                    </fieldset>
                    <fieldset>
                        <button
                            className='bg-blue-800 text-white py-2 px-4 rounded-md flex gap-2 items-center hover:bg-blue-600 hover:cursor-pointer active:bg-blue-500'
                            type='submit'
                            onClick={navigateDetail} // Redirect to driver page
                        >
                            <TruckSpeedIcon size={24} /> <span>Start Delivery</span>
                        </button>
                    </fieldset>
                </div>
            </div>
        </div>
    )
}

export default DriverHomePage