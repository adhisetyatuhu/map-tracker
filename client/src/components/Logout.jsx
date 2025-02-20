import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Logout() {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Logged out",
                showConfirmButton: false,
                timer: 1500
            });
            console.log('Logged out');
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <Link className="text-blue-900 hover:bg-blue-700/10 hover:text-blue-700 rounded-md px-4 py-2 font-semibold hover:cursor-pointer" onClick={handleLogout}>Logout</Link>
    );
}