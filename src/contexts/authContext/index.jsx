import React, {useContext, useEffect, useState} from 'react';
import {auth} from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(auth, initialUser); 
        return unsubscribe;
    }, [])

    async function initialUser(user) {
        if (user) {
            setCurrentUser({user});
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}