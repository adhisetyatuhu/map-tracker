import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, doc } from "firebase/firestore";
import { GoogleIcon } from "../utils/icons";
import { auth, db } from "../config/firebase";
import logo from "../assets/logo.png"
import truck from "../assets/truck.png"

function RegisterSidebar() {
    return (
        <div className="hidden sm:w-1/3 xl:w-1/2 bg-sky-800 sm:flex sm:justify-center sm:min-h-screen px-4 py-10">
            <div className="">
                {/* <div className="text-xl font-extrabold py-4 text-center">
                    <img className="h-24" src={logo} />
                </div> */}
                <figure className="border-0">
                    {/* <img className="rounded-xl h-96 mx-auto" src="https://img.freepik.com/premium-vector/package-sent-isometric-illustration-suitable-mobile-app-website-banner-diagrams-infographics-other-graphic-assets_210682-492.jpg?w=1800" alt="" /> */}
                    <img className="rounded-xl h-96 mx-auto" src={truck} alt="" />
                </figure>
                <h1 className="my-12 text-center text-3xl text-blue-50 font-semibold">Trusted by the world's leading brands</h1>

                {/* <div className="flex gap-3 flex-wrap px-2 justify-center">
                    <figure className="mb-1 h-14 px-4 py-2 rounded bg-white flex items-center">
                        <img className="h-12" src="https://tokobirdie.com/wp-content/uploads/2018/01/logo-tokopedia.png" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center  px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkiUCwJFxA7ab3q0I8YFGqqCtodWmCM_rXog&s" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bukalapak_%282020%29.svg/2560px-Bukalapak_%282020%29.svg.png" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://storage.googleapis.com/static-cms-prod/2023/10/color-1024x576.png" alt="shopee" />
                    </figure>
                    <figure className="mb-1 h-14 flex items-center px-4 py-2 rounded bg-white">
                        <img className="h-12" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/2560px-Shopify_logo_2018.svg.png" alt="shopee" />
                    </figure>
                </div> */}
                <p className="mt-12 text-lg text-blue-50 text-center px-20">With real-time tracking, automated status updates, and a user-friendly interface, our platform enhances operational efficiency and improves customer satisfaction</p>
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
            const userRef = collection(db, "driver");
            await setDoc(doc(userRef, userCredential.user.uid), {
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phone,
                provider: form.provider,
                role: 'driver',
                history: {},
                id: userCredential.user.uid
            })
            navigate('/login');

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white border-r border-gray-200">
            <div className="flex justify-between sm:flex-wrap">
                <div className="w-full sm:w-2/3 xl:w-1/2 px-4 sm:px-20 md:px-36 lg:48 flex justify-center">
                    <div className="lg:w-96">
                        <figure className="py-4 border-0 rounded-full">
                            <img className="bg-amber-50 rounded-full h-24 mx-auto" src={logo} alt="" />
                        </figure>
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
                                <option value="jnt">J&T</option>
                                <option value="jne">JNE</option>
                                <option value="posindonesia">Pos Indonesia</option>
                                <option value="tiki">TIKI</option>
                                <option value="wahana">Wahana</option>
                                <option value="anteraja">AnterAja</option>
                                <option value="sicepat">SiCepat</option>
                                <option value="lionparcel">Lion Parcel</option>
                                <option value="firstlogistic">First Logistics</option>
                                <option value="indahcargo">Indah Cargo</option>
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
                                <span className="bg-[#f7fafc] px-3">OR</span>
                            </div>

                            <button className="flex justify-center items-center gap-2 border border-gray-400 font-bold py-2 hover:bg-gray-100 hover:cursor-pointer active:bg-white" type="submit"><GoogleIcon size={24} /> <span>Log in with Google</span></button>

                            <p className="text-center">Already have an account? <Link className="text-blue-700" to="/login">Log in</Link></p>
                        </form>
                    </div>
                </div>
                <RegisterSidebar />
            </div>
        </div>
    );
}

export { RegisterSidebar };
export default Register;