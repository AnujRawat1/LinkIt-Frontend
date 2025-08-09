import { httpClient } from "../config/AxiosHelper"

export const createRoom = async(Name) => {
    const response = await httpClient.post('/api/room/createRoom', {name : Name});
    return response.data;
}

export const joinRoom = async(roomId, Name) => {

    const response = await httpClient.post('/api/room/joinRoom', {name:Name, roomId:roomId});
    return response.data;

}

export const getContent = async(roomId) => {
    const response = await httpClient.get('/api/room/getContent', { params: { roomId : roomId} })
    return response;
}

export const getParticipants = async(roomId) => {
    const response = await httpClient.get('/api/room/getParticipants', { params: { roomId : roomId} })
    return response;
}

export const removeParticipant = async(roomId, Name) => {
    const response = await httpClient.delete('/api/room/removeParticipant', { params: { roomId : roomId, participantName: Name} })
    return response;
}
export const getFileNames = async(roomId) => {
    const response = await httpClient.get('/api/room/getFileNames', { params: { roomId: roomId } })
    return response;
}

export const uploadFiles = async (roomId, files) => {
    const formData = new FormData();
    formData.append('roomId', roomId);
    files.forEach(file => formData.append('files', file));
    const response = await httpClient.post('/api/room/uploadFiles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const downloadFile = async (roomId, gridFsId) => {
    const response = await httpClient.get('/api/room/downloadFile', {
        params: { roomId, gridFsId },
        responseType: 'blob'
    });
    return response;
};
