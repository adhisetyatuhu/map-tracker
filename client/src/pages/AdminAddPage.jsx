import { SearchBox } from '@mapbox/search-js-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from "mapbox-gl"
import { AuthContext } from '../context/AuthContext'
import { setDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Swal from 'sweetalert2'

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
            if (mapInstanceRefA.current) {
                mapInstanceRefA.current.setCenter([lng, lat])
            }
        }
    }

    const handleRetrieveB = (result) => {
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].geometry.coordinates
            setCoordinatesB([lng, lat])
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
            })
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Pesanan telah ditambahkan!",
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
                        <form
                            className='w-1/3 h-full lg:mt-6 flex flex-col space-y-4 border border-gray-300 bg-white p-4 rounded-md'
                            onSubmit={handleSubmit}
                        >
                            <h1 className='text-2xl font-bold'>Add Route</h1>
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
                            <fieldset>
                                <select
                                    className='border border-gray-300 shadow w-full p-2 my-4 rounded-md'
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
                                    className={` bg-blue-500 text-white py-2 px-4 rounded-md ${!mapLoadedA || !mapLoadedB || !provider || !coordinatesA.length || !coordinatesB.length ? 'cursor-not-allowed' : 'hover:cursor-pointer hover:bg-blue-600 active:bg-blue-500'}`}
                                >
                                    Submit
                                </button>
                            </fieldset>
                        </form>
                        <div className='h-screen w-2/3'>
                            From:
                            <div className='border-4 border-white outline-1 outline-gray-300 mb-2' id="map-container-a" ref={mapContainerRefA} style={{ height: '40%', width: '100%' }} />
                            To:
                            <div className='border-4 border-white outline-1 outline-gray-300' id="map-container-b" ref={mapContainerRefB} style={{ height: '40%', width: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminAddPage