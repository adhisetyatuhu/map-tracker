import { collection, doc, getDocs, query } from "firebase/firestore";
import { EyeIcon, MapIcon } from "../utils/icons";
import { db } from "../config/firebase";
import { use, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RouteRow({ trackingCode, provider, addressA, addressB, status, id }) {
    const { user, loading, profile } = useContext(AuthContext)
    const navigate = useNavigate()
    const [drivers, setDrivers] = useState([])
    const [loadingDrivers, setLoadingDrivers] = useState(true)
    const [errorDrivers, setErrorDrivers] = useState(null)

    const [driverMatch, setDriverMatch] = useState('')

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login')
            } else if (profile?.role !== 'admin') {
                navigate('/driver')
            }
        }
    }, [user, loading, profile])

    const navigateDetail = () => {
        if (status === 'done' && driverMatch) {
            navigate('/admin/' + `${id}_${driverMatch.id}`)
        }
    }

    const getDrivers = async () => {
        // Fetch all drivers
        setLoadingDrivers(true)
        try {
            setErrorDrivers(null)
            const drivers = await getDocs(collection(db, 'driver'))
            const driversStore = drivers.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            const filteredDrivers = driversStore.filter(item => item.provider === provider)
            setDrivers(filteredDrivers)
        } catch (error) {
            console.log(error)
            setErrorDrivers(error)
        } finally {
            setLoadingDrivers(false)
        }
    }

    const getMatchDriver = () => {
        for (let i = 0; i < drivers.length; i++) {
            if (drivers[i].history && typeof drivers[i].history === 'object') {
                if (drivers[i].history[id]) {
                    setDriverMatch(drivers[i])
                }
            }
        }
    }

    useEffect(() => {
        if (drivers.length > 0) {
            getMatchDriver()
        }
    }, [drivers])

    useEffect(() => {
        if (provider) {
            getDrivers()
        }
    }, [provider])

    return (
        <tr className="hover:bg-gray-100">
            <td className="border-b py-2 px-4 border-gray-300">
                <div className="font-bold">{trackingCode}</div>
                <div className="text-gray-600 text-sm">{provider}</div>
            </td>
            <td className="border-b py-2 px-4 border-gray-300">
                <div className="text-gray-600 text-sm">{addressA}</div>
                <div className="text-gray-600 text-sm">{addressB}</div>
            </td>
            <td className="border-b py-2 px-4 border-gray-300">{status}</td>
            <td className="border-b py-2 px-4 border-gray-300">{driverMatch.email}</td>
            <td className="border-b py-2 px-4 border-gray-300">
                <button 
                    className="border border-blue-500 text-sm text-blue-600 hover:text-white flex gap-2 items-center px-2 py-1 rounded group hover:bg-blue-500 hover:cursor-pointer"
                    onClick={navigateDetail}
                >
                    <MapIcon className="fill-blue-500 group-hover:fill-white" size={16} /> 
                    <span>Detail</span>
                </button>
            </td>
        </tr>
    );
}

export default function AdminHome() {
    const { user } = useContext(AuthContext)
    const [routes, setRoutes] = useState([])

    const fetchRoutes = async () => {
        // Fetch tracking history from API
        const q = query(collection(db, "routes"))
        const querySnapshot = await getDocs(q)
        setRoutes(querySnapshot.docs.map(doc => {
            return { ...doc.data(), id: doc.id }
        }))
    }
    useEffect(() => {
        fetchRoutes()
    }, [])

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold my-4">Tracking History</h1>
            <table className="w-full bg-white shadow text-left">
                <thead>
                    <tr>
                        <th className="border-b py-3 px-4 border-gray-300">Tracking Code</th>
                        <th className="border-b py-3 px-4 border-gray-300">Route</th>
                        <th className="border-b py-3 px-4 border-gray-300">Status</th>
                        <th className="border-b py-3 px-4 border-gray-300">Driver</th>
                        <th className="border-b py-3 px-4 border-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {routes.map((route, index) => (
                        <RouteRow key={index} trackingCode={route.id.split('-')[1]} provider={route.provider} addressA={route.locationA.address} addressB={route.locationB.address} status={route.status} driver={route.driver} id={route.id} />
                    ))}

                </tbody>
            </table>
        </div>
    );
}