import { SearchBox } from '@mapbox/search-js-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from "mapbox-gl"
import { AuthContext } from '../context/AuthContext'
import { setDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function AdminAddPage() {
    const { user, loading } = useContext(AuthContext)
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
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading])

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
            center: [106.82723932,-6.17356323],
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
            center: [106.82723932,-6.17356323],
            zoom: 10,
        })

        mapInstanceRefB.current.on("load", () => {
            setMapLoadedB(true)
        })
    }

    useEffect(() => {
        initializeMapA()
        initializeMapB()
    }, [])

    const generateRandomId = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // const customId = `${provider}-${Date.now()}`
            const customId = `${provider}-${generateRandomId(6)}` // Contoh ID kustom
            await setDoc(doc(db, 'routes', customId), {
                coordinateA: {long: coordinatesA[0], lat: coordinatesA[1]}, // Contoh data koordinat
                coordinateB: {long: coordinatesB[0], lat: coordinatesB[1]}, // Contoh data koordinat
                provider: provider,
                status: 'pending',
            })
            // Reset state
            setInputValueA("")
            setInputValueB("")
            setCoordinatesA([])
            setCoordinatesB([])
            setProvider("")
            // Reset map center
            if (mapInstanceRefA.current) {
                mapInstanceRefA.current.setCenter([106.82723932,-6.17356323])
                mapInstanceRefA.current.setZoom(10)
            }
            if (mapInstanceRefB.current) {
                mapInstanceRefB.current.setCenter([106.82723932,-6.17356323])
                mapInstanceRefB.current.setZoom(10)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div>
                <div>
                    <div className='grid grid-cols-2 gap-4'>
                        <form 
                            className='flex flex-col space-y-4 border p-4 rounded-md'
                            onSubmit={handleSubmit}
                        >
                            <fieldset>
                                {JSON.stringify(coordinatesA)}
                                <label>Point A</label>
                                <SearchBox
                                    accessToken={accessToken}
                                    map={mapInstanceRefA.current}
                                    mapboxgl={mapboxgl}
                                    value={inputValueA}
                                    onChange={(d) => {
                                        setInputValueA(d)
                                    }}
                                    placeholder='Search for Pickup location'
                                    onClear={handleSubmit}
                                    onRetrieve={handleRetrieveA}
                                    options={{
                                        language: 'id',
                                        country: 'ID'
                                    }}
                                    marker
                                />
                            </fieldset>
                            <fieldset>
                                {JSON.stringify(coordinatesB)}
                                <label>Point B</label>
                                <SearchBox
                                    accessToken={accessToken}
                                    map={mapInstanceRefB.current}
                                    mapboxgl={mapboxgl}
                                    value={inputValueB}
                                    onClear={handleSubmit}
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
                                {JSON.stringify(provider)}
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
                            </fieldset>
                            <fieldset>
                                <button
                                    type='submit'
                                    className='bg-blue-500 text-white p-2 rounded-md'
                                >
                                    Submit
                                </button>
                            </fieldset>
                        </form>
                        <div className='h-screen grid grid-cols-1 gap-10'>
                            <div id="map-container-a" ref={mapContainerRefA} style={{ height: '100%', width: '100%' }} />
                            <div id="map-container-b" ref={mapContainerRefB} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminAddPage