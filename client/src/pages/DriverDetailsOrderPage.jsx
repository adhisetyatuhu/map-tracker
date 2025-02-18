import { doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../config/firebase'

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function DriverDetailsOrderPage() {
    const { resi } = useParams()
    const navigate = useNavigate()

    const [liveLocation, setLiveLocation] = useState("")

    const [data, setData] = useState({})
    const [coordinatesA, setCoordinatesA] = useState([])
    const [coordinatesB, setCoordinatesB] = useState([])
    const [mapLoaded, setMapLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const mapContainerRef = useRef()
    const mapInstanceRef = useRef()
    const directionsRef = useRef()

    const getLocation = () => {
        const position = [
            [112.738521, -7.262393],
            [112.738191, -7.26212],
            [112.73817, -7.260637]
        ]

        let idx = 0
        const updateLocation = setInterval(() => {
            setLiveLocation({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [position[idx][0], position[idx][1]]
                        }
                    }
                ]
            })
            idx++
            if (idx >= position.length) {
                clearInterval(updateLocation)
            }
        }, 5000)
    }

    const getResi = async () => {
        try {
            setLoading(true)
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
            setLoading(false)
        }
    }

    const handleFinish = async () => {
        try {
            await updateDoc(doc(db, 'routes', resi), {
                status: "Done",
                timeStamp: new Date()
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
        if (!loading && mapContainerRef.current) {
            initializeMap()
            getLocation()
        }
    }, [loading])

    useEffect(() => {
        if (!liveLocation) return;

        mapInstanceRef.current.getSource('market-truck').setData(liveLocation);

        mapInstanceRef.current.flyTo({
            center: liveLocation.features[0].geometry.coordinates,
            speed: 0.5
        });
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

            mapInstanceRef.current.loadImage("https://docs.mapbox.com/mapbox-gl-js/assets/cat.png", (error, image) => {
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
                                    coordinates: [112.738521, -7.262393] // Example: Jakarta
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
                        "icon-size": 0.25, // Adjust the size
                    }
                });
            })
        })
    }

    useEffect(() => {
        if (mapLoaded && coordinatesA.length && coordinatesB.length) {
            updateDirections(coordinatesA, coordinatesB)
        }
    }, [mapLoaded, coordinatesA, coordinatesB])

    const updateDirections = (coordinatesA, coordinatesB) => {
        if (!directionsRef.current) {
            directionsRef.current = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: 'metric',
                profile: 'mapbox/driving',
                controls: {
                    inputs: true,
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
            console.log(e.route)
        })
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error loading data: {error.message}</p>

    return (
        <div>
            <h1>DriverDetailsOrderPage {resi}</h1>
            <p>{data.coordinateA?.lat}</p>
            <p>{data.coordinateA?.long}</p>
            <p>{data.coordinateB?.lat}</p>
            <p>{data.coordinateB?.long}</p>
            <p>{data.provider}</p>
            <p>{data.status}</p>
            <div className='relative'>
                <div id="map-container" ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
                <button
                    className='border absolute bottom-10 right-10 cursor-pointer'
                    onClick={handleFinish}
                >
                    Finish
                </button>
            </div>
        </div>
    )
}

export default DriverDetailsOrderPage