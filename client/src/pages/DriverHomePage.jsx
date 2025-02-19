import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import React, { use, useEffect, useState } from 'react'
import { db } from '../config/firebase'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

function DriverHomePage() {
    const navigate = useNavigate()
    const [resi, SetResi] = useState('')

    const [listRoutes, setListRoutes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [provider, setProvider] = useState('')
    
    const getRoutesByProvider = async () => {
        setLoading(true)
        try {
            setError(null)
            const q = query(
                collection(db, 'routes'),
                where('provider', '==', "jne")
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
        const test = `${provider}-${resi}`
        console.log(test, "test")
        const filterroutes = listRoutes.filter((item) => item.id === test)
        if (filterroutes.length > 0 && filterroutes[0].status !== 'done') {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/driver/' + test)
        } else if (filterroutes.length > 0 && filterroutes[0].status === 'done') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Pesanan telah selesai!",
            })
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Pesanan tidak ditemukan!",
            })
        }
    }

    return (
        <div className=' container mx-auto flex flex-col items-center justify-center h-screen gap-10'>
            <h1>Provider</h1>
            <div className='flex gap-4'>
                <div>
                    <label>Provider</label>
                    <select
                        className='border w-full p-2 rounded-md'
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                    >
                        <option value="" hidden>Select Provider</option>
                        <option value="gojek">Gojek</option>
                        <option value="grab">Grab</option>
                        <option value="bluebird">Blue Bird</option>
                        <option value="jne">JNE</option>
                        <option value="posindonesia">Pos Indonesia</option>
                        <option value="tiki">TIKI</option>
                        <option value="wahana">Wahana</option>
                        <option value="anteraja">AnterAja</option>
                        <option value="sicepat">SiCepat</option>
                        <option value="lionparcel">Lion Parcel</option>
                        <option value="rpx">RPX</option>
                        <option value="pcp">PCP</option>
                        <option value="firstlogistic">First Logistics</option>
                        <option value="indahcargo">Indah Cargo</option>
                        <option value="jetexpress">Jet Express</option>
                        <option value="slis">SLIS</option>
                        <option value="starcargo">Star Cargo</option>
                        <option value="rex">REX</option>
                    </select>
                </div>
                <div>
                    <label>Resi</label>
                    <input 
                        className='border p-2 rounded-md'
                        type='text'
                        placeholder='Input Resi'
                        value={resi}
                        onChange={(e) => SetResi(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        className={` bg-blue-500 text-white p-2 rounded-md ${!provider || !resi ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={!provider || !resi}
                        type='submit'
                        onClick={navigateDetail} // Redirect to driver page
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DriverHomePage