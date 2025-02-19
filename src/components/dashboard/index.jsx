import React from 'react'
import { useAuth } from '../../contexts/authContext'

const Dashboard = () => {
    const { currentUser } = useAuth()
    return (
        
        <div className='text-2xl font-bold pt-14'> 
        
        userLoggedIn
        ? 
        <>
            Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
        </>
        : 
        <>
        <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className='text-sm text-blue-600 underline'>Logout</button>
        </>
        </div>
    )
}

export default Dashboard