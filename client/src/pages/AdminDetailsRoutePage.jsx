import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../config/firebase'

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function AdminDetailsRoutePage() {
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

    return (
        <div>
            <div id="map-container" ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
        </div>
    )
}

export default AdminDetailsRoutePage