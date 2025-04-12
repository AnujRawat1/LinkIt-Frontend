import { createContext, useState, useContext } from "react";

const RoomContext = createContext();

export const RoomProvider = ({children}) => {

    const [roomId, setRoomId] = useState('');
    const [text, setText] = useState('');
    const [connected, setConnected] = useState('');

    return (
        <RoomContext.Provider value={{roomId, text, setRoomId, setText, connected, setConnected}}>
            {children}
        </RoomContext.Provider>
    )
};

const useRoomContext = () => useContext(RoomContext);
export default useRoomContext;