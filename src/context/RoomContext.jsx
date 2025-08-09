import { createContext, useContext, useState, useEffect } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [name, setName] = useState(null);
  const [code, setCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [addedFiles, setAddedFiles] = useState([]);

  // Load from localStorage on page load
  useEffect(() => {
    const storedRoomId = localStorage.getItem('roomId');
    const storedName = localStorage.getItem('name');
    const storedCode = localStorage.getItem('code');
    const storedFilesData = localStorage.getItem('addedFilesData');

    if (storedRoomId) setRoomId(storedRoomId);
    if (storedName) setName(storedName);
    if (storedCode) setCode(storedCode);
    if (storedFilesData) {
      try {
        const { roomId: storedRoomIdFromFiles, files } = JSON.parse(storedFilesData);
        if (storedRoomIdFromFiles === roomId && Array.isArray(files) && files.every(f => f.name && f.gridFsId && f.size && f.contentType)) {
          setAddedFiles(files);
        } else {
          console.warn('Stored files do not match roomId or are invalid, resetting:', { storedRoomIdFromFiles, files });
          setAddedFiles([]);
        }
      } catch (e) {
        console.error('Failed to parse stored files:', e);
        setAddedFiles([]);
      }
    }
  }, [roomId]);

  // Save to localStorage whenever they change
  useEffect(() => {
    if (roomId) localStorage.setItem('roomId', roomId);
    else localStorage.removeItem('roomId');
    if (name) localStorage.setItem('name', name);
    else localStorage.removeItem('name');
    if (code) localStorage.setItem('code', code);
    else localStorage.removeItem('code');
    if (addedFiles.length > 0) {
      localStorage.setItem('addedFilesData', JSON.stringify({ roomId, files: addedFiles }));
    } else {
      localStorage.removeItem('addedFilesData');
    }
  }, [roomId, name, code, addedFiles]);

  // Clear addedFiles when roomId changes to a new value
  useEffect(() => {
    const storedRoomId = localStorage.getItem('roomId');
    if (roomId && storedRoomId && roomId !== storedRoomId) {
      setAddedFiles([]);
      console.log('Cleared addedFiles due to roomId change:', { roomId, storedRoomId });
    }
  }, [roomId]);

  return (
    <RoomContext.Provider value={{
      roomId, setRoomId,
      name, setName,
      code, setCode,
      connected, setConnected,
      addedFiles, setAddedFiles
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export default function useRoomContext() {
  return useContext(RoomContext);
}