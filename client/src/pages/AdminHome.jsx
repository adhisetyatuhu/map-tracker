import { collection, doc, getDocs, query } from "firebase/firestore";
import { EyeIcon, MapIcon } from "../utils/icons";
import { db } from "../config/firebase";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function RouteRow({ trackingCode, route, status, driver }) {
    return (
        <tr className="hover:bg-gray-100">
            <td className="border-b py-2 px-4 border-gray-300">
                <div className="font-bold">{trackingCode}</div>
                <div className="text-gray-600 text-sm">{route}</div>
            </td>
            <td className="border-b py-2 px-4 border-gray-300">{route}</td>
            <td className="border-b py-2 px-4 border-gray-300">{status}</td>
            <td className="border-b py-2 px-4 border-gray-300">{driver}</td>
            <td className="border-b py-2 px-4 border-gray-300">
                <button className="border border-blue-500 text-sm text-blue-600 hover:text-white flex gap-2 items-center px-2 py-1 rounded group hover:bg-blue-500 hover:cursor-pointer"><MapIcon className="fill-blue-500 group-hover:fill-white" size={16} /> <span>Detail</span></button>
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
        setRoutes(querySnapshot.docs.map(doc => doc.data()))
    }
    useEffect(() => {
        fetchRoutes()
    }, [])

    return (
        <div className="container mx-auto">
            {JSON.stringify(routes)}
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
                        <RouteRow key={index} trackingCode={route.trackingCode} route={route.route} status={route.status} driver={route.driver} />
                    ))}
                    <tr className="hover:bg-gray-100">
                        <td className="border-b py-2 px-4 border-gray-300">
                            <div className="font-bold">123456</div>
                            <div className="text-gray-600 text-sm">JNE</div>
                        </td>
                        <td className="border-b py-2 px-4 border-gray-300">Jakarta - Surabaya</td>
                        <td className="border-b py-2 px-4 border-gray-300">On Process</td>
                        <td className="border-b py-2 px-4 border-gray-300">Iwan Smith</td>
                        <td className="border-b py-2 px-4 border-gray-300">
                            <button className="border border-blue-500 text-sm text-blue-600 hover:text-white flex gap-2 items-center px-2 py-1 rounded group hover:bg-blue-500 hover:cursor-pointer"><MapIcon className="fill-blue-500 group-hover:fill-white" size={16} /> <span>Detail</span></button>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-100">
                        <td className="border-b py-2 px-4 border-gray-300">
                            <div className="font-bold">123456</div>
                            <div className="text-gray-600 text-sm">Grab</div>
                        </td>
                        <td className="border-b py-2 px-4 border-gray-300">Jakarta - Surabaya</td>
                        <td className="border-b py-2 px-4 border-gray-300">On Process</td>
                        <td className="border-b py-2 px-4 border-gray-300">Bond James</td>
                        <td className="border-b py-2 px-4 border-gray-300">
                            <button className="border border-blue-500 text-sm text-blue-600 hover:text-white flex gap-2 items-center px-2 py-1 rounded group hover:bg-blue-500 hover:cursor-pointer"><MapIcon className="fill-blue-500 group-hover:fill-white" size={16} /> <span>Detail</span></button>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-100">
                        <td className="border-b py-2 px-4 border-gray-300">
                            <div className="font-bold">123456</div>
                            <div className="text-gray-600 text-sm">Gojek</div>
                        </td>
                        <td className="border-b py-2 px-4 border-gray-300">Jakarta - Surabaya</td>
                        <td className="border-b py-2 px-4 border-gray-300">On Process</td>
                        <td className="border-b py-2 px-4 border-gray-300">Jane Doel</td>
                        <td className="border-b py-2 px-4 border-gray-300">
                            <button className="border border-blue-500 text-sm text-blue-600 hover:text-white flex gap-2 items-center px-2 py-1 rounded group hover:bg-blue-500 hover:cursor-pointer"><MapIcon className="fill-blue-500 group-hover:fill-white" size={16} /> <span>Detail</span></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}