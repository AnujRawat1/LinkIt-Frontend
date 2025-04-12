import { httpClient } from "../config/AxiosHelper"

export const createRoom = async() => {

    const response = await httpClient.get('/room/create')
    return response.data;

}

export const joinRoom = async(roomId) => {

    const response = await httpClient.get(`/room/join/${roomId}`)
    return response.data;

}

export const getContent = async(roomId) => {
    const response = await httpClient.get(`/room/content/${roomId}`)
    return response.data;
}