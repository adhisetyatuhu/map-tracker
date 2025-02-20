import { Link } from "react-router-dom";
import Logout from "./Logout";
import logo from "../assets/logo.png"

export default function Header() {
    return (
        <header className="p-1 bg-white shadow">
            <div className="container mx-auto flex justify-between items-center text-blue-900">
                {/* <h1 className="text-xl font-bold">LOGO</h1> */}
                <div className="flex items-center text-xl italic"><img className="h-12 bg-amber-50 rounded-full" src={logo} alt="" /></div>
                <nav>
                    <ul className="flex items-center">
                        <li><Link className="hover:bg-blue-700/10 hover:text-blue-700 px-4 py-2 rounded-md font-semibold" to="/">Home</Link></li>
                        <li><Logout /></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}