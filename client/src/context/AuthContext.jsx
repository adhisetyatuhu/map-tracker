import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext({
    user: null,
    loading: true,
    profile: null
})

export default function AuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {

                // fetch user by uid
                const userCredential = await getDoc(doc(db, 'driver', user.uid))
                const userData = userCredential.data()
                if (userData) {
                    setUser(user)
                    setProfile(userData)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user]);

    const value = {
        user, loading, profile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}