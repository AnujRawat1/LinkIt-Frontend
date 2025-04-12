import React, { useRef, useState, useEffect } from 'react';
import { Button, TextField, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import { useParams } from 'react-router-dom';
import useRoomContext from '../context/RoomContext';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { baseURL } from '../config/AxiosHelper';
import { toast } from 'react-toastify';
import { getContent } from '../services/RoomService';

const Room = () => {
  const [fileName, setFileName] = useState('');
  const { id } = useParams();

  const {
    roomId,
    setRoomId,
    text,
    setText,
    connected,
    setConnected,
  } = useRoomContext();

  const [stompClient, setStompClient] = useState(null);

  // WebSocket connection + set Room ID from URL
  useEffect(() => {
    const activeRoomId = roomId || id;
    setRoomId(activeRoomId);

    const connectWebSocket = () => {
      const socket = new SockJS(`${baseURL}/clipboard`);
      const client = Stomp.over(socket);

      client.connect({}, () => {
        console.log('✅ Connected to STOMP');
        setConnected(true);
        setStompClient(client);
        toast.success('Connected to Room');

        client.subscribe(`/topic/room/${activeRoomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setText(newMessage.content); // <- use 'content' from payload
        });
      });
    };

    connectWebSocket();
  }, [roomId, id]);

  // Load previously saved content
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getContent(roomId || id);
        setText(data || '');
      } catch (error) {
        toast.error('Failed to load room content');
        console.error(error);
      }
    }

    if ((roomId || id) && connected) {
      loadMessages();
    }
  }, [roomId, id, connected]);

  // Send message function
  const sendMessage = () => {
    if (stompClient && connected && text) {
      const message = {
        roomId: roomId || id,
        content: text,
        createdAt: new Date(),
      };

      stompClient.send(`/app/sendMessage/${roomId || id}`, {}, JSON.stringify(message));
    } else {
      toast.error('Not connected or message is empty!');
    }
  };

  const handleShare = () => {
    sendMessage();
    toast.success('Text shared to room!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Text copied to clipboard!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  const handleShareLink = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: 'Join my Clipboard Room',
          text: 'Instant clipboard sync! Join me here:',
          url: currentUrl,
        })
        .then(() => console.log('Link shared successfully'))
        .catch((error) => console.log('Sharing failed:', error));
    } else {
      navigator.clipboard.writeText(currentUrl);
      toast.info('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7ce7f6] to-white px-6 py-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          ✨ Share and Sync Instantly
        </h2>

        <div className="text-center text-lg font-mono font-semibold text-indigo-500 bg-blue-100 py-2 px-4 rounded-md shadow-sm">
          Room ID: <span className="font-bold">{roomId || id}</span>
        </div>

        <TextField
          label="Enter your text here"
          placeholder={typeof text === 'string' && text.trim() ? '' : 'Start typing or wait for shared content...'}
          multiline
          rows={15}
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          className="rounded-md"
          sx={{
            backgroundColor: '#d0e8f5',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        />

        <div className="flex flex-wrap justify-between items-center gap-4">
          <label className="cursor-pointer text-blue-600 font-medium">
            <input type="file" className="hidden" onChange={handleFileChange} />
            📎 Upload File
            {fileName && (
              <span className="ml-2 text-sm text-gray-700">({fileName})</span>
            )}
          </label>

          <div className="flex gap-3">
            <Tooltip title="Copy text">
              <IconButton onClick={handleCopy} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share room link">
              <IconButton onClick={handleShareLink} color="secondary">
                <LinkIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              color="success"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
