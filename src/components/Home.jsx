import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import useRoomContext from '../context/RoomContext';
import 'react-toastify/dist/ReactToastify.css';
import { createRoom, joinRoom } from '../services/RoomService';


const Home = () => {
 
  const navigate = useNavigate();
  const {roomId, setRoomId} = useRoomContext();

    const handleCreate = async () => {

        try {
          console.log("Requesting API to Create Room");

          const data = await createRoom();
          console.log(data);
          toast.success("Room Created Succesfully");
          // setConnected(true);
          console.log("Room created Succesfully");

          // Join the room page now
          navigate(`/room/${data.roomId}`);

        } catch (error) {
          toast.error("Failed to create room!");
          console.error("Failed to Create Room : ",error);
        }

    };
  

    const handleJoin = async () => {

        if (roomId.trim()) {
            try {
                console.log("Calling API to join Room");

                const data = await joinRoom(roomId.trim());
                console.log(data);
                if (data ) { 
                  toast.success("Joining Room");
                  // setConnected(connected+1);
                  navigate(`/room/${roomId.trim()}`);
                }
                else {
                  setRoomId("");
                  toast.error("Room Does not exist."); 
                  console.error("Room Does not exist."); 
                }


            } catch (err) {
              console.error("Error while checking room: " + err.message);
            }

        } else {
            setRoomId("");
            toast.error("Please enter a valid Room ID.");
        }
    };


  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7ce7f6] to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
          🚀 Sync your clipboard across devices — instantly and effortlessly.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-10 italic">
          Because Ctrl + V deserves more power.
        </p>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-blue-600 font-mono italic mb-12">
          𝓡𝓮𝓪𝓵𝓽𝓲𝓶𝓮 𝓒𝓵𝓲𝓹𝓫𝓸𝓪𝓻𝓭
        </h2>

        <div className="mb-10">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCreate}
          >
            Create New Clipboard
          </Button>
        </div>

        <div className="text-lg sm:text-xl font-medium text-gray-700 mb-6">or</div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <TextField
            label="Enter Room ID"
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="bg-white rounded w-full sm:w-auto"
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleJoin}
          >
            Join Room
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default Home;
