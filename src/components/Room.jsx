import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { toast } from 'react-toastify';
import { ClipboardCopy, Share2, Upload } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoomContext from '../context/RoomContext';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { baseURL_DEV } from '../config/AxiosHelper';
import { getContent, getParticipants, getFileNames, removeParticipant, uploadFiles, downloadFile } from '../services/RoomService';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roomId, setRoomId, name, connected, setConnected, code, setCode, addedFiles, setAddedFiles } = useRoomContext();
  const [participants, setParticipants] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if loadContent completed

  // For file upload UI
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeRoomId = roomId || id;

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const fakeEvent = { target: { files } };
      handleFileUpload(fakeEvent);
    }
  };

  useEffect(() => {
    setRoomId(activeRoomId);
  }, [id, setRoomId]);

  // WEB SOCKET CONNECTION
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new SockJS(`${baseURL_DEV}/clipboard`);
      const client = Stomp.over(socket);

      client.connect({}, () => {
        console.log('✅ Connected to STOMP');
        setStompClient(client);
        setConnected(true);

        client.subscribe(`/topic/room/${activeRoomId}`, (message) => {
          if (!message.body) {
            toast.info('Room has been closed.');
            navigate('/');
            return;
          }
          const newMessage = JSON.parse(message.body);
          console.log('WebSocket message:', newMessage);
          setCode(newMessage.content || code || '');
          setParticipants(newMessage.participants || participants || []);
          setAddedFiles(newMessage.fileNames && newMessage.fileNames.length > 0 ? newMessage.fileNames : addedFiles || []);
        });
      }, (error) => {
        console.error('STOMP connection error:', error);
        setConnected(false);
        setIsLoading(false);
      });

      client.onDisconnect = () => {
        console.log('Disconnected from STOMP');
        setConnected(false);
        setIsLoading(false);
      };
    };

    if (activeRoomId) {
      connectWebSocket();
    }

    return () => {
      if (stompClient && connected) {
        stompClient.disconnect();
      }
    };
  }, [activeRoomId, code, participants, addedFiles, navigate, setCode, setConnected, setAddedFiles]);

  // LOAD CONTENT
  useEffect(() => {
    async function loadContent() {
      if (!activeRoomId) return;
      setIsLoading(true);
      try {
        const [contentResponse, participantsResponse, fileNamesResponse] = await Promise.all([
          getContent(activeRoomId),
          getParticipants(activeRoomId),
          getFileNames(activeRoomId),
        ]);

        if (contentResponse.status === 204 || participantsResponse.status === 204 || fileNamesResponse.status === 204) {
          toast.error('Room does not exist.');
          navigate('/');
          return;
        }

        const newCode = contentResponse.data || '';
        const newParticipants = participantsResponse.data || [];
        let newFiles = fileNamesResponse.data || [];

        // Only use localStorage if roomId matches and API data is empty
        if (!newFiles.length && localStorage.getItem('addedFilesData')) {
          try {
            const storedData = JSON.parse(localStorage.getItem('addedFilesData'));
            if (storedData.roomId === activeRoomId && Array.isArray(storedData.files) && storedData.files.length > 0) {
              newFiles = storedData.files;
              console.log('Using stored files from localStorage:', newFiles);
            }
          } catch (e) {
            console.error('Failed to parse stored files:', e);
          }
        }

        setCode(newCode);
        setParticipants(newParticipants);
        setAddedFiles(newFiles);
        console.log('Loaded content:', { newCode, newParticipants, newFiles });
      } catch (error) {
        console.error('Failed to load room content:', error);
        toast.error('Failed to load room content.');
        navigate('/');
      } finally {
        setIsLoading(false);
        setIsDataLoaded(true); // Mark data as loaded
      }
    }

    loadContent();
  }, [activeRoomId, setCode, setAddedFiles, navigate]);

  // FILE UPLOAD
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length === 0) return;
    try {
      const response = await uploadFiles(activeRoomId, files);
      setAddedFiles(response.fileNames || []);
      toast.success('Files uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files.');
    }
  };

  // DOWNLOAD FILE
  const handleDownloadFile = async (gridFsId, fileName) => {
    try {
      const response = await downloadFile(activeRoomId, gridFsId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file.');
    }
  };

  // CODE CHANGE - SEND MESSAGE
  const handleCodeChange = (val) => {
    setCode(val);
    if (stompClient && connected && val) {
      const message = {
        roomId: activeRoomId,
        content: val,
        participants: participants,
        fileNames: addedFiles,
        createdAt: new Date(),
      };
      stompClient.send(`/app/sendMessage/${activeRoomId}`, {}, JSON.stringify(message));
    } else {
      log.error('Not connected or message is empty!');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copied to clipboard!');
    });
  };

  const handleCopyRoomId = () => {
    if (activeRoomId) {
      navigator.clipboard.writeText(activeRoomId).then(() => {
        toast.success(`Room ID (${activeRoomId}) copied!`);
      });
    } else {
      toast.error('Room ID not available!');
    }
  };

  const handleLeaveRoom = async () => {
    if (activeRoomId && name) {
      try {
        await removeParticipant(activeRoomId, name);
        localStorage.removeItem('name');
        localStorage.removeItem('roomId');
        console.log('✅ Participant removed:', name);
      } catch (error) {
        console.error('❌ Failed to remove participant:', error);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleLeaveRoom);

    return () => {
      handleLeaveRoom();
      window.removeEventListener('beforeunload', handleLeaveRoom);
    };
  }, [activeRoomId, name]);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-violet-200 bg-gradient-to-br from-[#110027] to-[#1e003f]">
        Loading room data...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white bg-gradient-to-br from-[#110027] to-[#1e003f]">
      <div className="md:w-1/4 w-full p-6 bg-white/10 backdrop-blur-md border-r border-white/20">
        <h2 className="text-2xl font-bold mb-4">👥 Participants</h2>
        <ul className="space-y-2 mb-6">
          {isLoading ? (
            <li className="text-violet-200">Loading participants...</li>
          ) : participants.length > 0 ? (
            participants.map((name, idx) => (
              <li key={idx} className="bg-white/10 p-2 rounded text-violet-200">{name}</li>
            ))
          ) : (
            <li className="text-violet-200">No participants</li>
          )}
        </ul>
        <button
          onClick={handleCopyRoomId}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center justify-center gap-2"
        >
          <Share2 size={16} /> Copy Room ID
        </button>
      </div>
      <div className="flex-1 p-4 md:p-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-semibold">📝 Collaborative Code Editor</h1>
            {activeRoomId && (
              <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-violet-300 border border-violet-500">
                Room ID: <span className="font-mono font-semibold text-base">{activeRoomId}</span>
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={triggerFileSelect}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <Upload size={18} /> Upload File
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md"
            >
              <ClipboardCopy size={18} /> Copy Code
            </button>
          </div>
        </div>
        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-32 mb-6 border-2 transition-all rounded-md flex items-center justify-center text-sm ${
            isDragging
              ? 'border-green-400 bg-green-500/10 text-green-300'
              : 'border-dashed border-white/20 bg-white/5 text-violet-200'
          }`}
        >
          {isDragging ? '📂 Drop files here' : '🖱️ Drag & drop files here or click "Upload File"'}
        </div>
        {/* Code Editor */}
        <div className="rounded-md overflow-hidden border border-white/10">
          {isLoading ? (
            <div className="h-[500px] flex items-center justify-center text-violet-200">
              Loading code...
            </div>
          ) : (
            <CodeMirror
              value={typeof code === 'string' ? code : ''}
              height="500px"
              extensions={[javascript(), EditorView.lineWrapping, EditorView.editable.of(true)]}
              onChange={handleCodeChange}
              theme="dark"
            />
          )}
        </div>
        {isLoading ? (
          <div className="mt-8 text-violet-200">Loading files...</div>
        ) : addedFiles.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-violet-300">Added Files</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white border border-white/10 rounded overflow-hidden">
                <thead className="bg-white/10 text-violet-200">
                  <tr>
                    <th className="py-2 px-4 border-r border-white/10 text-left">S.No</th>
                    <th className="py-2 px-4 border-r border-white/10 text-left">File Name</th>
                    <th className="py-2 px-4 border-r border-white/10 text-left">Size</th>
                    <th className="py-2 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addedFiles.map((file, idx) => (
                    <tr key={idx} className="odd:bg-white/5">
                      <td className="py-2 px-4 border-r border-white/10">{idx + 1}</td>
                      <td className="py-2 px-4 border-r border-white/10">{file.name}</td>
                      <td className="py-2 px-4 border-r border-white/10">{(file.size / 1024).toFixed(2)} KB</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleDownloadFile(file.gridFsId, file.name)}
                          className="text-blue-400 hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-violet-200">No files uploaded yet.</div>
        )}
      </div>
    </div>
  );
};

export default Room;