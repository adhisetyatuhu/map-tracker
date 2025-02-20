import { SearchBox } from '@mapbox/search-js-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from "mapbox-gl"
import { AuthContext } from '../context/AuthContext'
import { setDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Swal from 'sweetalert2'
import { TruckSpeedIcon } from '../utils/icons'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function AdminAddPage() {
    const { user, loading, profile } = useContext(AuthContext)
    const navigate = useNavigate()
    const mapContainerRefA = useRef()
    const mapContainerRefB = useRef()
    const mapInstanceRefA = useRef()
    const mapInstanceRefB = useRef()
    const [mapLoadedA, setMapLoadedA] = useState(false)
    const [mapLoadedB, setMapLoadedB] = useState(false)
    const [inputValueA, setInputValueA] = useState("")
    const [inputValueB, setInputValueB] = useState("")
    const [locationA, setLocationA] = useState("")
    const [locationB, setLocationB] = useState("")

    const [coordinatesA, setCoordinatesA] = useState([])
    const [coordinatesB, setCoordinatesB] = useState([])
    const [provider, setProvider] = useState("")

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login')
            } else if (profile?.role !== 'admin') {
                navigate('/driver')
            }
        }
    }, [user, loading, profile])

    const handleRetrieveA = (result) => {
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].geometry.coordinates
            setCoordinatesA([lng, lat])
            console.log(result.features[0].properties, "location A")
            setLocationA(result.features[0].properties) // Save location A
            if (mapInstanceRefA.current) {
                mapInstanceRefA.current.setCenter([lng, lat])
            }
        }
    }

    const handleRetrieveB = (result) => {
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].geometry.coordinates
            setCoordinatesB([lng, lat])
            console.log(result.features[0].properties, "location B")
            setLocationB(result.features[0].properties) // Save location B
            if (mapInstanceRefB.current) {
                mapInstanceRefB.current.setCenter([lng, lat])
            }
        }
    }

    const initializeMapA = () => {
        mapboxgl.accessToken = accessToken

        mapInstanceRefA.current = new mapboxgl.Map({
            container: mapContainerRefA.current,
            center: [106.82723932, -6.17356323],
            zoom: 10,
        })

        mapInstanceRefA.current.on("load", () => {
            setMapLoadedA(true)
        })
    }

    const initializeMapB = () => {
        mapboxgl.accessToken = accessToken

        mapInstanceRefB.current = new mapboxgl.Map({
            container: mapContainerRefB.current,
            center: [106.82723932, -6.17356323],
            zoom: 10,
        })

        mapInstanceRefB.current.on("load", () => {
            setMapLoadedB(true)
        })
    }

    useEffect(() => {
        if (!loading) {
            initializeMapA()
            initializeMapB()
        }
    }, [loading])

    const generateRandomId = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }

    const clearForm = () => {
        setInputValueA("")
        setInputValueB("")
        setCoordinatesA([])
        setCoordinatesB([])
        setProvider("")
        if (mapInstanceRefA.current) {
            mapInstanceRefA.current.setCenter([106.82723932, -6.17356323])
            mapInstanceRefA.current.setZoom(10)
        }
        if (mapInstanceRefB.current) {
            mapInstanceRefB.current.setCenter([106.82723932, -6.17356323])
            mapInstanceRefB.current.setZoom(10)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const customId = `${provider}-${generateRandomId(6)}`
            await setDoc(doc(db, 'routes', customId), {
                coordinateA: { long: coordinatesA[0], lat: coordinatesA[1] },
                coordinateB: { long: coordinatesB[0], lat: coordinatesB[1] },
                provider: provider,
                status: 'pending',
                locationA: {
                    address: locationA.address,
                    full_address: locationA.full_address,
                    name: locationA.name,
                },
                locationB: {
                    address: locationB.address,
                    full_address: locationB.full_address,
                    name: locationB.name,
                }
            })
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "New tracking destination has been created!",
                showConfirmButton: false,
                timer: 1500
            })
            clearForm()
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return (
            <div className='container mx-auto flex justify-center items-center h-screen'>
                <h1>Loading...</h1>
            </div>
        )
    }

    return (
        <>
            <div>
                <div className='container mx-auto'>
                    <div className='flex gap-4'>
                        <div className='h-[38rem] w-full'>
                            <form
                                className='h-full lg:mt-6 flex flex-col space-y-4 shadow-md border-gray-300 bg-white p-4 rounded-md'
                                onSubmit={handleSubmit}
                            >
                                <h1 className='text-2xl font-bold text-center'>Add New Delivery</h1>

                                <div className='flex gap-4 h-96'>
                                    <div className='w-1/2'>
                                        <fieldset>
                                            <label>From:</label>
                                            <SearchBox
                                                accessToken={accessToken}
                                                map={mapInstanceRefA.current}
                                                mapboxgl={mapboxgl}
                                                value={inputValueA}
                                                onChange={(d) => {
                                                    setInputValueA(d)
                                                }}
                                                placeholder='Search for Pickup location'
                                                onClear={clearForm}
                                                onRetrieve={handleRetrieveA}
                                                options={{
                                                    language: 'id',
                                                    country: 'ID'
                                                }}
                                                marker
                                            />
                                        </fieldset>
                                        <div className='border-4 border-white outline-1 outline-gray-300 mb-2' id="map-container-a" ref={mapContainerRefA} style={{ height: '90%', width: '100%' }} />
                                    </div>

                                    <div className='w-1/2 h-96'>
                                        <fieldset>
                                            <label>To:</label>
                                            <SearchBox
                                                accessToken={accessToken}
                                                map={mapInstanceRefB.current}
                                                mapboxgl={mapboxgl}
                                                value={inputValueB}
                                                onClear={clearForm}
                                                onChange={(d) => {
                                                    setInputValueB(d)
                                                }}
                                                placeholder='Search for Destination location'
                                                onRetrieve={handleRetrieveB}
                                                options={{
                                                    language: 'id',
                                                    country: 'ID'
                                                }}
                                                marker
                                            />
                                        </fieldset>
                                        <div className='border-4 border-white outline-1 outline-gray-300' id="map-container-b" ref={mapContainerRefB} style={{ height: '90%', width: '100%' }} />
                                    </div>
                                </div>

                                <fieldset className='pr-4'>
                                    <select
                                        className='border border-gray-300 shadow w-1/2 p-2 mt-6 rounded'
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                    >
                                        <option value="" hidden>Select Provider</option>
                                        <option value="jnt">J&T</option>
                                        <option value="jne">JNE</option>
                                        <option value="posindonesia">Pos Indonesia</option>
                                        <option value="tiki">TIKI</option>
                                        <option value="wahana">Wahana</option>
                                        <option value="anteraja">AnterAja</option>
                                        <option value="sicepat">SiCepat</option>
                                        <option value="lionparcel">Lion Parcel</option>
                                        <option value="firstlogistic">First Logistics</option>
                                        <option value="indahcargo">Indah Cargo</option>
                                    </select>
                                </fieldset>

                                <fieldset>
                                    <button
                                        type='submit'
                                        disabled={!mapLoadedA || !mapLoadedB || !provider || !coordinatesA.length || !coordinatesB.length}
                                        className={`flex flex-nowrap gap-2 bg-blue-500 text-white py-2 px-4 rounded-md ${!mapLoadedA || !mapLoadedB || !provider || !coordinatesA.length || !coordinatesB.length ? 'cursor-not-allowed' : 'hover:cursor-pointer hover:bg-blue-600 active:bg-blue-500'}`}
                                    >
                                        <TruckSpeedIcon size={24} />
                                        Create Delivery
                                    </button>
                                </fieldset>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminAddPage