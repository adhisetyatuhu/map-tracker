import { doc, getDoc, updateDoc, where } from 'firebase/firestore'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../config/firebase'

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import { AuthContext } from '../context/AuthContext'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function DriverDetailsOrderPage() {
    const { user, loading, profile } = useContext(AuthContext)
    const { resi } = useParams()
    const navigate = useNavigate()

    const [liveLocation, setLiveLocation] = useState([])
    const [data, setData] = useState({})
    const [coordinatesA, setCoordinatesA] = useState([])
    const [coordinatesB, setCoordinatesB] = useState([])
    const [mapLoaded, setMapLoaded] = useState(false)
    const [loadingResi, setLoadingResi] = useState(true)
    const [error, setError] = useState(null)
    const [dataRoute, setDataRoute] = useState([])
    const [startJourney, setStartJourney] = useState(false)

    
    const [route, setRoute] = useState([])
    const [loadingRoutes, setLoadingRoutes] = useState(true)

    const mapContainerRef = useRef()
    const mapInstanceRef = useRef()
    const directionsRef = useRef()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login')
            } else if (profile?.role !== 'driver') {
                navigate('/admin')
            } else if (route?.status === 'done') {
                navigate('/driver')
            }
        }
    }, [user, loading, profile, route])

    const getRouteByResi = async () => {
        if (!profile?.provider) {
            setError(new Error('Provider is not defined'))
            setLoadingRoutes(false)
            return
        }

        setLoadingRoutes(true)
        try {
            setError(null)
            const route = await getDoc(doc(db, 'routes', resi))
            setRoute(route.data())
        } catch (error) {
            console.log(error)
            setError(error)
        } finally {
            setLoadingRoutes(false)
        }
    }

    useEffect(() => {
        if (profile) {
            getRouteByResi()
        }
    }, [profile])

    const getLocation = () => {
        let idx = 0
        const updateLocation = setInterval(() => {
            setLiveLocation([dataRoute[idx][0], dataRoute[idx][1]])
            // if (idx === dataRoute.length - 1) {
            //     setLiveLocation([112.73845715, -7.257471])
            // }
            idx++
            if (idx >= dataRoute.length) {
                clearInterval(updateLocation)
            }
        }, 500)
    }

    const getResi = async () => {
        try {
            setLoadingResi(true)
            const track = await getDoc(doc(db, 'routes', resi))
            const trackData = track.data()
            if (trackData) {
                setData(trackData)
                setCoordinatesA([trackData.coordinateA?.long, trackData.coordinateA?.lat])
                setCoordinatesB([trackData.coordinateB?.long, trackData.coordinateB?.lat])
            }
        } catch (error) {
            console.log(error)
            setError(error)
        } finally {
            setLoadingResi(false)
        }
    }

    const handleFinish = async () => {
        try {
            console.log(dataRoute[dataRoute.length-1][0], dataRoute[dataRoute.length-1][1], "dataRouteFinish")
            console.log(liveLocation[0], liveLocation[1], "liveLocationFinish")
            console.log(
                dataRoute[dataRoute.length-1][0] === liveLocation[0] &&
                dataRoute[dataRoute.length-1][1] === liveLocation[1]
            )
            await updateDoc(doc(db, 'routes', resi), {
                status: "done",
                timeStamp: new Date()
            })
            const driverDocRef = doc(db, 'driver', profile.id)
            const driverDoc = await getDoc(driverDocRef)
            const driverData = driverDoc.data()

            // Flatten dataRoute if it contains nested arrays
            const flattenedDataRoute = dataRoute.map(route => ({
                long: route[0],
                lat: route[1]
            }))

            const newHistory = {
                ...driverData.history,
                [resi]: {
                    historyRoutesDriver: flattenedDataRoute, // Use flattened dataRoute
                    timeStamp: new Date()
                }
            }

            await updateDoc(driverDocRef, {
                history: newHistory
            })
            navigate('/driver')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getResi()
    }, [resi])

    useEffect(() => {
        if (!loadingResi && mapContainerRef.current) {
            initializeMap()
        }
    }, [loadingResi])

    useEffect(() => {
        if (mapLoaded && coordinatesA.length && coordinatesB.length) {
            updateDirections(coordinatesA, coordinatesB)
        }
    }, [mapLoaded, coordinatesA, coordinatesB])

    useEffect(() => {
        if (startJourney === true) {
            if (dataRoute.length > 0) {
                getLocation()
            }
        }
    }, [dataRoute, startJourney])

    useEffect(() => {
        if (liveLocation.length === 0) return;

        mapInstanceRef.current.getSource('market-truck').setData({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: liveLocation
                    }
                }
            ]
        })

    }, [liveLocation])

    const initializeMap = () => {
        mapboxgl.accessToken = accessToken

        mapInstanceRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [106.89921, -6.121751],
            zoom: 12,
        })

        mapInstanceRef.current.on("load", () => {
            setMapLoaded(true)

            mapInstanceRef.current.loadImage("https://res.cloudinary.com/jeannede/image/upload/v1739967955/pggjhdjlf6tfvjzo0kfz.png", (error, image) => {
                if (error) throw error

                mapInstanceRef.current.addImage("truck", image)

                // Add a GeoJSON source for the market truck location
                mapInstanceRef.current.addSource("market-truck", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: coordinatesA // Example: Jakarta
                                }
                            }
                        ]
                    }
                });

                // Add a symbol layer for the market truck
                mapInstanceRef.current.addLayer({
                    id: "truck-symbol",
                    type: "symbol",
                    source: "market-truck",
                    layout: {
                        "icon-image": "truck", // Built-in Mapbox truck/market icon
                        "icon-size": 0.5, // Adjust the size
                    }
                });
            })
        })
    }

    const updateDirections = (coordinatesA, coordinatesB) => {
        if (!directionsRef.current) {
            directionsRef.current = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: 'metric',
                profile: 'mapbox/driving',
                controls: {
                    inputs: false,
                    instructions: true,
                    profileSwitcher: false,
                }
            })
            mapInstanceRef.current.addControl(directionsRef.current, 'top-left')
        }

        if (coordinatesA.length && coordinatesB.length) {
            directionsRef.current.setOrigin(coordinatesA)
            directionsRef.current.setDestination(coordinatesB)
        }

        directionsRef.current.on('route', (e) => {
            const results = e.route[0].legs[0].steps

            const positions = []
            results.forEach(step => {
                step.intersections.forEach(intersection => {
                    positions.push(intersection.location)
                })
            })
            setDataRoute(positions)
        })
    }

    if (loadingResi) return <p>Loading Resi...</p>

    // if (loading) {
    //     return (
    //         <div className='container mx-auto flex justify-center items-center h-screen'>
    //             <h1>Loading...</h1>
    //         </div>
    //     )
    // }

    if (error) {
        return (
            <div className='container mx-auto flex justify-center items-center h-screen'>
                <h1>Error: {error.message}</h1>
            </div>
        )
    }

    return (
        <div className='container mx-auto'>
            <h1 className='text-xl text-center py-2'><span className='font-bold'>TRACKING CODE:</span> {resi.split('-')[1]}</h1>

            <div className='relative border-1 border-gray-300 p-2 bg-white'>
                <div className='absolute z-10 right-0 py-4 px-4'>
                    <div className=' bg-black/70 text-white p-2'>
                        <div className='flex gap-2'>
                            A:
                            <span>{data.coordinateA?.lat}</span>
                            <span>{data.coordinateA?.long}</span>
                        </div>
                        <div className='flex gap-2'>
                            B:
                            <p>{data.coordinateB?.lat}</p>
                            <p>{data.coordinateB?.long}</p>
                        </div>
                        <p>{data.provider}</p>
                        <p>{data.status}</p>
                    </div>
                </div>
                <div id="map-container" ref={mapContainerRef} style={{ height: '80vh', width: '100%' }} />
                {
                    startJourney !== true && (
                        <button
                            className='border absolute bottom-10 left-10 cursor-pointer px-5 rounded-full bg-blue-500 text-white py-5'
                            onClick={() => setStartJourney(true)}
                        >

                            Start Journey
                        </button>
                    )
                }
                <button
                    className='border absolute bottom-10 right-10 cursor-pointer px-5 rounded-full bg-blue-500 text-white py-5'
                    onClick={handleFinish}
                >
                    Finish
                </button>
            </div>
        </div>
    )
}

export default DriverDetailsOrderPage