import { Link } from "react-router-dom";
import Logout from "./Logout";
import logo from "../assets/logo.png"
import { HomeIcon } from "../utils/icons";

export default function Header() {
    return (
        <header className="p-1 bg-white shadow">
            <div className="container mx-auto flex justify-between items-center text-blue-900">
                {/* <h1 className="text-xl font-bold">LOGO</h1> */}
                <div className="flex items-center text-xl italic"><img className="h-12 bg-amber-50 rounded-full" src={logo} alt="" /></div>
                <nav>
                    <ul className="flex items-center">
                        <li><Link className="hover:bg-blue-700/10 hover:text-blue-700 px-4 py-2 rounded-md font-semibold flex gap-1" to="/"><HomeIcon size={24} className="fill-blue-900" /> <span>Home</span></Link></li>
                        <li><Logout /></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}