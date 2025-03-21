import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/authContext'
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth'

const Register = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const { userLoggedIn } = useAuth()

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isRegistering) {
            setIsRegistering(true)
            await doCreateUserWithEmailAndPassword(email, password)
        }
    }

    return (
        <div className="bg-[#F7F8F3] min-h-screen min-w-screen flex items-center justify-center">
            {userLoggedIn && (<Navigate to={'/dashboard'} replace={true} />)}

            <div className="p-4 border rounded-lg shadow-md bg-white max-w-md min-w-sm mx-auto pt-15">
                <h2 className="text-3xl text-black font-bold mb-6 mt-4 text-center">Register Now!</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium text-black mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            autoComplete='email'
                            required
                            value={email} onChange={(e) => { setEmail(e.target.value) }}
                            className="w-full p-2 border rounded-md text-black mb-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-black mb-2">
                            Password
                        </label>
                        <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='new-password'
                            required
                            value={password} onChange={(e) => { setPassword(e.target.value) }}
                            className="w-full p-2 border rounded-md text-black mb-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-black mb-2">
                            Confirm Password
                        </label>
                        <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='off'
                            required
                            value={confirmPassword} onChange={(e) => { setconfirmPassword(e.target.value) }}
                            className="w-full p-2 border rounded-md text-black mb-2"
                        />
                    </div>

                    {errorMessage && (
                        <span className='text-red-600 font-bold'>{errorMessage}</span>
                    )}

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className={`btn-primary w-full mb-4 ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                    >
                        {isRegistering ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <div className="block font-medium text-black mb-2 text-center">
                        Already have an account? {'   '}
                        <Link to={'/login'} className="font-medium text-black mb-2 text-center hover:underline font-bold">Continue</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register