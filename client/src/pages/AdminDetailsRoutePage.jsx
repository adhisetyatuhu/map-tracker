import { doc, getDoc } from 'firebase/firestore'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../config/firebase'

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import { AuthContext } from '../context/AuthContext'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function AdminDetailsRoutePage() {
    const { user, loading, profile } = useContext(AuthContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const resi = id.split('_')[0]
    const driverId = id.split('_')[1]

    const [route, setRoute] = useState(null)
    const [loadingRoute, setLoadingRoute] = useState(true)
    const [errorRoute, setErrorRoute] = useState(null)

    const [driver, setDriver] = useState(null)
    const [loadingDriver, setLoadingDriver] = useState(true)
    const [errorDriver, setErrorDriver] = useState(null)

    const [history, setHistory] = useState([])

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login')
            } else if (profile?.role !== 'admin') {
                navigate('/driver')
            }
        }
    }, [user, loading, profile])

    const getRouteById = async () => {
        setLoadingRoute(true)
        try {
            setErrorRoute(null)
            const routeDoc = await getDoc(doc(db, 'routes', resi))
            setRoute(routeDoc.data())
        } catch (error) {
            console.log(error)
            setErrorRoute(error)
        } finally {
            setLoadingRoute(false)
        }
    }

    const getDriverById = async () => {
        setLoadingDriver(true)
        try {
            setErrorDriver(null)
            const driverDoc = await getDoc(doc(db, 'driver', driverId))
            setDriver(driverDoc.data())
        } catch (error) {
            console.log(error)
            setErrorDriver(error)
        } finally {
            setLoadingDriver(false)
        }
    }

    const getlastCoordinateByDriver = () => {
        if (driver && driver.history && typeof driver.history === 'object') {
            const history = driver.history[resi]
            if (history) {
                setHistory(history)
            }
        }
    }

    useEffect(() => {
        if (driver && route) {
            getlastCoordinateByDriver()
        }
    }, [driver, route])

    useEffect(() => {
        getRouteById()
        getDriverById()
    }, [])

    const mapContainerRef = useRef()
    const mapInstanceRef = useRef()
    const directionsRef = useRef()
    const [mapLoaded, setMapLoaded] = useState(false)

    const initializeMap = async () => {
        mapboxgl.accessToken = accessToken

        mapInstanceRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [106.89921, -6.121751],
            zoom: 12,
        })

        mapInstanceRef.current.on("load", () => {
            setMapLoaded(true)
        })
    }

    useEffect(() => {
        initializeMap()
    }, [])

    const createRoute = (coordinatesA, coordinatesB) => {
        if (!directionsRef.current) {
            directionsRef.current = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: 'metric',
                profile: 'mapbox/driving',
                controls: {
                    inputs: false,
                    instructions: false,
                    profileSwitcher: false,
                }
            })
            mapInstanceRef.current.addControl(directionsRef.current, 'top-left')
        }

        if (coordinatesA.length && coordinatesB.length) {
            directionsRef.current.setOrigin(coordinatesA)
            directionsRef.current.setDestination(coordinatesB)
        }
    }

    useEffect(() => {
        if (mapLoaded && route) {
            createRoute([route?.coordinateA?.long, route?.coordinateA?.lat], [route?.coordinateB?.long, route?.coordinateB?.lat])
        }
    }, [mapLoaded, route])

    useEffect(() => {
        if (mapLoaded && history.historyRoutesDriver) {
            const coordinates = history.historyRoutesDriver.map(coord => [coord.long, coord.lat])

            mapInstanceRef.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    }
                }
            })

            mapInstanceRef.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#FF0000',
                    'line-width': 4
                }
            })
        }
    }, [mapLoaded, history])

    const formatTimeStamp = (timeStamp) => {
        if (timeStamp && timeStamp.seconds) {
            const date = new Date(timeStamp.seconds * 1000)
            return date.toLocaleString()
        }
        return ''
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-6xl p-4 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-4">Route Details</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div id="map-container" ref={mapContainerRef} className="h-96 w-full rounded-lg shadow-md" />
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-2">Driver Information</h2>
                        {loadingDriver ? (
                            <p>Loading driver information...</p>
                        ) : errorDriver ? (
                            <p className="text-red-500">Error: {errorDriver.message}</p>
                        ) : (
                            <div>
                                <p><strong>Name:</strong> {driver?.firstName} {driver?.lastName}</p>
                                <p><strong>Email:</strong> {driver?.email}</p>
                                <p><strong>Phone:</strong> {driver?.phoneNumber}</p>
                                <p><strong>Provider:</strong> {driver?.provider}</p>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mt-4 mb-2">Route Information</h2>
                        {loadingRoute ? (
                            <p>Loading route information...</p>
                        ) : errorRoute ? (
                            <p className="text-red-500">Error: {errorRoute.message}</p>
                        ) : (
                            <div>
                                <p><strong>From:</strong> {route?.coordinateA?.lat}, {route?.coordinateA?.long}</p>
                                <p><strong>To:</strong> {route?.coordinateB?.lat}, {route?.coordinateB?.long}</p>
                                <p><strong>Status:</strong> {route?.status}</p>
                                <p><strong>Message:</strong> {route?.message}</p>
                                <p><strong>Time:</strong> {formatTimeStamp(route?.timeStamp)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDetailsRoutePage