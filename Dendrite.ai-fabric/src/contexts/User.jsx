import { createContext, useContext,useMemo } from "react";
import { io } from "socket.io-client";


const UserContext = createContext(null)

export const useUser = () => {
    const context = useContext(UserContext) 
    return context
}

const UserContextProvider = ({children}) => {

    const socket = useMemo(() => io("http://localhost:8001"), []);

    return (
        <UserContext.Provider value={{socket}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider