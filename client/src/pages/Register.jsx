import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, doc } from "firebase/firestore";
import { GoogleIcon } from "../utils/icons";
import { auth, db } from "../config/firebase";

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
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        provider: '',
        password: '',
        passwordConfirm: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(form);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            console.info(userCredential);

            // create profile
            const userRef = collection(db, "Driver");
            await setDoc(doc(userRef, userCredential.user.uid), {
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phone,
                provider: form.provider,
                role: 'driver',
                history: [],
            })
            navigate('/login');

        } catch (error) {
            console.error(error);
        }
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
                        <select
                            className="border border-gray-400 py-1 px-2"
                            name="provider"
                            placeholder="Phone number"
                            value={form.provider}
                            onChange={handleChange}
                        >
                            <option value="" hidden>Select Provider</option>
                            <option value="gojek">Gojek</option>
                            <option value="grab">Grab</option>
                            <option value="bluebird">Blue Bird</option>
                            <option value="jne">JNE</option>
                            <option value="posindonesia">Pos Indonesia</option>
                            <option value="tiki">TIKI</option>
                            <option value="wahana">Wahana</option>
                            <option value="anteraja">AnterAja</option>
                            <option value="sicepat">SiCepat</option>
                            <option value="lionparcel">Lion Parcel</option>
                            <option value="rpx">RPX</option>
                            <option value="pcp">PCP</option>
                            <option value="firstlogistic">First Logistics</option>
                            <option value="indahcargo">Indah Cargo</option>
                            <option value="jetexpress">Jet Express</option>
                            <option value="slis">SLIS</option>
                            <option value="starcargo">Star Cargo</option>
                            <option value="rex">REX</option>
                        </select>
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