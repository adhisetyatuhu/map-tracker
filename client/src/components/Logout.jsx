import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
            console.log('Logged out');
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <button className="text-white hover:underline hover:cursor-pointer" onClick={handleLogout}>Logout</button>
    );
}