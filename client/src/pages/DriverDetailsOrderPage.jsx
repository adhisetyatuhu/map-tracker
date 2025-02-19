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

    const [liveLocation, setLiveLocation] = useState([])
    const [data, setData] = useState({})
    const [coordinatesA, setCoordinatesA] = useState([])
    const [coordinatesB, setCoordinatesB] = useState([])
    const [mapLoaded, setMapLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dataRoute, setDataRoute] = useState([])
    const [startJourney, setStartJourney] = useState(false)

    const mapContainerRef = useRef()
    const mapInstanceRef = useRef()
    const directionsRef = useRef()

    const getLocation = () => {
        let idx = 0
        const updateLocation = setInterval(() => {
            setLiveLocation([dataRoute[idx][0], dataRoute[idx][1]])
            if (idx === dataRoute.length - 1) {
                setLiveLocation([112.73845715, -7.257471])
            }
            idx++
            if (idx >= dataRoute.length) {
                clearInterval(updateLocation)
            }
        }, 200)
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
            console.log(dataRoute[dataRoute.length-1][0], dataRoute[dataRoute.length-1][1], "dataRouteFinish")
            console.log(liveLocation[0], liveLocation[1], "liveLocationFinish")
            console.log(
                dataRoute[dataRoute.length-1][0] === liveLocation[0] &&
                dataRoute[dataRoute.length-1][1] === liveLocation[1]
            )
            await updateDoc(doc(db, 'routes', resi), {
                status: "pending",
                timeStamp: new Date()
            })
            // navigate('/driver')
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
        }
    }, [loading])

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
        });

        // mapInstanceRef.current.flyTo({
        //     center: liveLocation.features[0].geometry.coordinates,
        //     speed: 0.5
        // });

        // if (mapInstanceRef.current) {
        //     mapInstanceRef.current.setCenter(liveLocation.features[0].geometry.coordinates)
        //     mapInstanceRef.current.setZoom(17)
        // }

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