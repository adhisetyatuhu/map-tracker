import { doc, getDoc, updateDoc, where } from 'firebase/firestore'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../config/firebase'
import Swal from 'sweetalert2'

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
            idx++
            if (idx >= dataRoute.length) {
                clearInterval(updateLocation)
            }
        }, 1000)
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
            Swal.fire({
                title: "Finish?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const isArrived = dataRoute[dataRoute.length - 1][0] === liveLocation[0] && dataRoute[dataRoute.length - 1][1] === liveLocation[1];
                    const message = isArrived ? "Your driver has arrived at the destination" : "Your driver has not arrived at the destination";
                    const messageStatus = isArrived ? "You have finished the delivery." : "The delivery is not completed yet.";
                    const icon = isArrived ? "success" : "warning";
                    const title = isArrived ? "Finished!" : "Not Finished!";

                    await updateDoc(doc(db, 'routes', resi), {
                        status: "done",
                        timeStamp: new Date(),
                        message: message
                    });

                    const driverDocRef = doc(db, 'driver', profile.id);
                    const driverDoc = await getDoc(driverDocRef);
                    const driverData = driverDoc.data();

                    const flattenedDataRoute = dataRoute.map(route => ({
                        long: route[0],
                        lat: route[1]
                    }));

                    const newHistory = {
                        ...driverData.history,
                        [resi]: {
                            historyRoutesDriver: flattenedDataRoute,
                            timeStamp: new Date(),
                            message: message
                        }
                    };

                    await updateDoc(driverDocRef, {
                        history: newHistory
                    });

                    navigate('/driver');

                    Swal.fire({
                        title: title,
                        text: messageStatus,
                        icon: icon,
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

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

            mapInstanceRef.current.loadImage("https://res.cloudinary.com/jeannede/image/upload/v1740119295/icontruckwest.png", (error, image) => {
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

        directionsRef.current.on('route', async (e) => {
            const results = e.route[0].legs[0].steps

            const positions = await fetchPositionsFromDataJson(resi)
            if (positions.length === 0) {
                const positionsFromResults = results.map(step => step.intersections.map(intersection => intersection.location)).flat()
                setDataRoute(positionsFromResults)
            } else {
                setDataRoute(positions)
            }
        })
    }

    const fetchPositionsFromDataJson = async (id) => {
        try {
            const response = await fetch('http://localhost:3001/position')
            const data = await response.json()
            const routeData = data.find(route => route.id === id)
            return routeData ? routeData.position : []
        } catch (error) {
            console.error('Error fetching positions from data.json:', error)
            return []
        }
    }

    const writeHistory = async () => {
        try {
            // Check if the data already exists
            const existingData = await fetchPositionsFromDataJson(resi)
            if (existingData.length > 0) {
                console.log('Data already exists, not adding to JSON server')
                return
            }

            const response = await fetch('http://localhost:3001/position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: resi, position: dataRoute })
            })
            if (!response.ok) {
                throw new Error('Failed to send positions to JSON server')
            }
            console.log('Positions sent successfully')
        } catch (error) {
            console.error('Error sending positions:', error)
        }
    }

    useEffect(() => {
        if (dataRoute && dataRoute.length > 0) {
            // Send positions to JSON server
            writeHistory()
        }
    }, [dataRoute])

    if (loadingResi) return <p>Loading Resi...</p>

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
                {/* <div className='absolute z-10 right-0 py-4 px-4'>
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
                </div> */}
                <div id="map-container" ref={mapContainerRef} style={{ height: '80vh', width: '100%' }} />
                {
                    startJourney !== true && (
                        <button
                            className='border absolute bottom-10 right-10 cursor-pointer px-6 rounded-full bg-blue-500 text-white py-5'
                            onClick={() => setStartJourney(true)}
                        >

                            Start
                        </button>
                    )
                }
                {
                    startJourney === true && (
                        <button
                            className='border absolute bottom-10 right-10 cursor-pointer px-6 rounded-full bg-red-500 text-white py-5'
                            onClick={handleFinish}
                        >
                            Finish
                        </button>
                    )
                }
            </div>
        </div>
    )
}

export default DriverDetailsOrderPage