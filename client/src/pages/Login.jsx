import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { RegisterSidebar } from "./Register";
import { GoogleIcon } from "../utils/icons.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase.js";
import { AuthContext } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

function Login() {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [user])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(form);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            console.info(userCredential);
            navigate('/');
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Login success",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="">
            <div className="flex justify-between sm:flex-wrap">
                <div className="w-full sm:w-2/3 px-4 sm:px-20 md:px-36 lg:48 xl:px-60">
                    <div className="text-xl font-extrabold py-4">Logo</div>

                    <h1 className="text-2xl font-bold my-8 text-center">Create Your Account for Free</h1>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            className="border border-gray-400 py-1 px-2"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                        />
                        <input
                            className="border border-gray-400 py-1 px-2"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                        />

                        <button className="bg-blue-700 text-white font-bold py-2 mt-4 hover:bg-blue-700/90 hover:cursor-pointer active:bg-blue-700" type="submit">Log in</button>

                        <div className="h-3 my-4 border-b-2 border-gray-300 text-center">
                            <span className="bg-white px-3">OR</span>
                        </div>

                        <button className="flex items-center justify-center gap-2 border border-gray-400 font-bold py-2 hover:bg-gray-100 hover:cursor-pointer active:bg-white" type="submit"><GoogleIcon size={24} /> <span>Log in with Google</span></button>

                        <p className="text-center">Don't have an account? <Link className="text-blue-700" to="/register">Create account</Link></p>
                    </form>
                </div>
                <RegisterSidebar />
            </div>
        </div>
    )
}

export default Login;