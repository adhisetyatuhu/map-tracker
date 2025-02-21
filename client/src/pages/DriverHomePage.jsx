import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import React, { useContext, useEffect, useState } from 'react'
import { db } from '../config/firebase'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { TruckSpeedIcon } from '../utils/icons'
import { AuthContext } from '../context/AuthContext'

function DriverHomePage() {
    const { user, loading, profile } = useContext(AuthContext)
    const navigate = useNavigate()
    const [trackCode, setTrackCode] = useState('')

    const [listRoutes, setListRoutes] = useState([])
    const [loadingRoutes, setLoadingRoutes] = useState(true)
    const [error, setError] = useState(null)

    const getRoutesByProvider = async () => {
        if (!profile?.provider) {
            setError(new Error('Provider is not defined'))
            setLoadingRoutes(false)
            return
        }

        setLoadingRoutes(true)
        try {
            setError(null)
            const q = query(
                collection(db, 'routes'),
                where('provider', '==', profile.provider)
            )
            const routes = await getDocs(q)
            const routesStore = routes.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            setListRoutes(routesStore)
        } catch (error) {
            console.log(error)
            setError(error)
        } finally {
            setLoadingRoutes(false)
        }
    }

    useEffect(() => {
        if (profile) {
            getRoutesByProvider()
        }
    }, [profile])

    const navigateDetail = async () => {
        if (!profile?.provider) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Provider is not defined!",
            })
            return
        }

        const resi = `${profile.provider}-${trackCode}`
        const filterroutes = listRoutes.filter((item) => item.id === resi)
        if (filterroutes.length > 0 && filterroutes[0].status !== 'done') {
            const driverDocRef = doc(db, 'driver', profile.id)
            const driverDoc = await getDoc(driverDocRef)
            const driverData = driverDoc.data()

            const newHistory = {
                ...driverData.history,
                [resi]: {
                    historyRoutesDriver: [],
                    timeStamp: ""
                }
            }

            await updateDoc(driverDocRef, {
                history: newHistory
            })

            Swal.fire({
                position: "center",
                icon: "success",
                title: "let's go!",
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/driver/' + resi)
        } else if (filterroutes.length > 0 && filterroutes[0].status === 'done') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "The order has been completed!",
            })
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Order not found!",
            })
        }
    }

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login')
            } else if (profile?.role !== 'driver') {
                navigate('/admin')
            }
        }
    }, [user, loading, profile])

    if (loading || loadingRoutes) {
        return (
            <div className='container mx-auto flex justify-center items-center h-screen'>
                <h1>Loading...</h1>
            </div>
        )
    }

    if (error) {
        return (
            <div className='container mx-auto flex justify-center items-center h-screen'>
                <h1>Error: {error.message}</h1>
            </div>
        )
    }

    return (
        <div className='container mx-auto flex flex-col items-center justify-center gap-10 lg:mt-40 p-4'>
            <h1 className='text-3xl font-bold text-center'>ALL-IN-ONE PACKAGE TRACKING</h1>
            <h3 className='text-center'>Support 2500+ carriers and 190+ airlines worldwide</h3>
            <div className='flex flex-col md:flex-row gap-4 w-full max-w-md'>
                <div className='flex-1'>
                    <input
                        className='border border-blue-500 p-2 h-12 rounded-md w-full'
                        type='text'
                        placeholder='Enter your tracking code'
                        value={trackCode}
                        onChange={(e) => setTrackCode(e.target.value)}
                    />
                </div>
                <div className='flex-1'>
                    <button
                        className={`w-full text-white py-2 px-4 h-12 rounded-md flex gap-2 items-center justify-center ${!profile?.provider || !trackCode ? 'cursor-not-allowed bg-blue-500/60' : 'cursor-pointer bg-blue-500'}`}
                        disabled={!profile?.provider || !trackCode}
                        type='submit'
                        onClick={navigateDetail} // Redirect to driver page
                    >
                        <TruckSpeedIcon size={24} />
                        <span className='text-nowrap'>Start Delivery</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DriverHomePage