import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authuser, setAuthuser] = useState(null)
    const [onlineuser, setOnlineuser] = useState([])
    const [socket, setSocket] = useState(null)

    // check if user is authenticated and if so, set the user date and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check")

            if (data.success) {
                setAuthuser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // login function to handel user authentication and socket connection
    const login = async (state, credential) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credential)
            if (data.success) {
                setAuthuser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // logout and disconnection socket
    const logout = async () => {
        localStorage.removeItem("token")
        setToken(null)
        setAuthuser(null)
        setOnlineuser([])
        axios.defaults.headers.common["token"] = null;
        toast.success("logged out")
        socket.disconnect()
    }

    // update profile to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body)

            if (data.success) {
                setAuthuser(data.user)
                toast.success("Porfile updated Successfully")
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    // connect socket function to handle socket connection and online user update
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userId) => {
            setOnlineuser(userId)
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, [])

    const value = {
        axios,
        authuser,
        onlineuser,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}