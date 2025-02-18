import React, { useRef, useEffect, useState } from "react"
import { SearchBox } from "@mapbox/search-js-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const accessToken = import.meta.env.VITE_API_KEY_MapBox

function SearchMapBox() {
    const mapContainerRef = useRef()
    const mapInstanceRef = useRef()
    const directionsRef = useRef()
    const [mapLoaded, setMapLoaded] = useState(false)
    const [inputValueA, setInputValueA] = useState("")
    const [inputValueB, setInputValueB] = useState("")
    const [coordinatesA, setCoordinatesA] = useState([])
    const [coordinatesB, setCoordinatesB] = useState([])
    const [currentCoordinates, setCurrentCoordinates] = useState([])

    useEffect(() => {
        const intervalId = setInterval(() => {
            getLocation()
        }, 1000)

        return () => clearInterval(intervalId)
    }, [])

    useEffect(() => {
        initializeMap()
    }, [])

    useEffect(() => {
        if (mapLoaded ,coordinatesA.length && coordinatesB.length) {
            updateDirections(coordinatesA, coordinatesB)
        }
    }, [mapLoaded, coordinatesA, coordinatesB])

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            setCurrentCoordinates([longitude, latitude])
        })
    }

    const initializeMap = () => {
        mapboxgl.accessToken = accessToken

        mapInstanceRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: currentCoordinates.length ? currentCoordinates : [106.89921, -6.121751],
            zoom: 12,
        })

        mapInstanceRef.current.on("load", () => {
            setMapLoaded(true)
        })
    }


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

    const handleRetrieveA = (result) => {
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].geometry.coordinates
            setCoordinatesA([lng, lat])
            console.log("CoordinatesA:", { lng, lat })
        }
    }

    const handleRetrieveB = (result) => {
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].geometry.coordinates
            setCoordinatesB([lng, lat])
            console.log("CoordinatesB:", { lng, lat })
        }
    }

    return (
        <>
            {coordinatesA && (
                <div>
                    <p>CoordinatesA: {coordinatesA[0]}, {coordinatesA[1]}</p>
                </div>
            )}
            {coordinatesB && (
                <div>
                    <p>CoordinatesB: {coordinatesB[0]}, {coordinatesB[1]}</p>
                </div>
            )}
            <div className='grid grid-cols-2 gap-4'>
                <SearchBox
                    accessToken={accessToken}
                    map={mapInstanceRef.current}
                    mapboxgl={mapboxgl}
                    value={inputValueA}
                    onChange={(d) => {
                        setInputValueA(d)
                    }}
                    onRetrieve={handleRetrieveA}
                    options={{
                        language: 'id',
                        country: 'ID'
                    }}
                    marker
                />
                <SearchBox
                    accessToken={accessToken}
                    map={mapInstanceRef.current}
                    mapboxgl={mapboxgl}
                    value={inputValueB}
                    onChange={(d) => {
                        setInputValueB(d)
                    }}
                    onRetrieve={handleRetrieveB}
                    options={{
                        language: 'id',
                        country: 'ID'
                    }}
                    marker
                />
            </div>
            <div id="map-container" ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
        </>
    )
}

export default SearchMapBox