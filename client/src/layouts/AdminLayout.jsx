import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Logout from "../components/Logout";
import logo from "../assets/logo.png";

export default function AdminLayout() {
    const navigate = useNavigate();
    return (
        <>
            <header className="p-1 bg-white shadow">
                <div className="container mx-auto flex justify-between items-center text-white">
                    <div className="text-xl font-bold">
                        <Link to="/admin">
                            <img className="h-12 bg-amber-50 rounded-full" src={logo} alt="logo" />
                        </Link>
                    </div>
                    <nav>
                        <ul className="flex items-center">
                            <li><Link onClick={() => navigate('/admin')} className={`hover:bg-blue-700/10 px-4 py-2 rounded-md font-semibold ${location.pathname === '/admin' ? 'text-blue-500' : 'text-blue-900'}`}>Home</Link></li>
                            <li><Link className={`hover:bg-blue-700/10 px-4 py-2 rounded-md font-semibold ${location.pathname === '/admin/add' ? 'text-blue-500' : 'text-blue-900'}`} to="/admin/add">New Delivery</Link></li>
                            <li><Logout /></li>
                        </ul>
                    </nav>
                </div>
            </header>
            <Outlet />
        </>
    );
}