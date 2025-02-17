import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleIcon } from "../utils/icons";

function RegisterSidebar() {
    return (
        <div className="hidden sm:w-1/3 bg-sky-800 sm:flex sm:justify-center sm:min-h-screen px-4 py-30">
            <div>
                <h1 className="my-4 text-center text-xl text-white font-semibold">Trusted by the world's leading brands</h1>
                <div className="flex gap-3 flex-wrap px-2 justify-center">
                    <figure className="mb-1 w-20 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-28 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-20 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-20 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-36 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-36 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-30 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-20 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-36 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-36 h-8 bg-amber-50/30"></figure>
                    <figure className="mb-1 w-30 h-8 bg-amber-50/30"></figure>
                </div>
            </div>
        </div>
    )
}

function Register() {
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        passwordConfirm: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
    };

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
                        <div className="flex gap-4">
                            <input
                                className="border border-gray-400 w-1/2 py-1 px-2"
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={handleChange}

                            />
                            <input
                                className="border border-gray-400 w-1/2 py-1 px-2"
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <input
                            className="border border-gray-400 py-1 px-2"
                            type="tel"
                            name="phone"
                            placeholder="Phone number"
                            value={form.phone}
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
                        <input
                            className="border border-gray-400 py-1 px-2"
                            type="password"
                            name="passwordConfirm"
                            placeholder="Confirm Password"
                            value={form.passwordConfirm}
                            onChange={handleChange}
                        />

                        <button className="bg-blue-700 text-white font-bold py-2 mt-4 hover:bg-blue-700/90 hover:cursor-pointer active:bg-blue-700" type="submit">Create Account</button>

                        <div className="h-3 my-4 border-b-2 border-gray-300 text-center">
                            <span className="bg-white px-3">OR</span>
                        </div>

                        <button className="flex justify-center items-center gap-2 border border-gray-400 font-bold py-2 hover:bg-gray-100 hover:cursor-pointer active:bg-white" type="submit"><GoogleIcon size={24} /> <span>Log in with Google</span></button>

                        <p className="text-center">Already have an account? <Link className="text-blue-700" to="/login">Log in</Link></p>
                    </form>
                </div>
                <RegisterSidebar />
            </div>
        </div>
    );
}

export { RegisterSidebar };
export default Register;