"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const ffmpegProcess = (0, child_process_1.spawn)('ffmpeg', [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', "25",
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', "32000",
    '-f', 'flv',
    `rtmp://127.0.0.1:1935/`,
]);
ffmpegProcess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
});
ffmpegProcess.stderr.on('data', (data) => {
    console.error(`ffmpeg stderr: ${data}`);
});
ffmpegProcess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
});
const socket_io_1 = require("socket.io");
class SocketService {
    constructor() {
        this._io = new socket_io_1.Server({
            cors: {
                origin: "*",
                allowedHeaders: ["*"]
            }
        });
    }
    initialisechatting() {
        this._io.of("/chat").on("connection", (socket) => {
            console.log("a user connected in chatting");
            socket.on("JOIN", (data) => {
                socket.join(data.room);
                this._io.of("/chat").to(data.room).emit("JOINED", data);
            });
            socket.on("ENDCALL", (data) => {
                this._io.of("/chat").to(data.room).emit("ENDCALL");
            });
            socket.on("MESSAGE", (data) => {
                this._io.of("/chat").to(data.room).emit("MESSAGE", data);
            });
            socket.on("disconnect", () => {
                console.log("chatting user disconnected");
            });
        });
    }
    initialisevideo() {
        this._io.of("/video").on("connection", (socket) => {
            console.log("a user connected in video");
            socket.on("JOIN", (data) => {
                console.log("joined the video room" + data.room + "by " + data.email);
                socket.join(data.room);
                this._io.of("/video").to(data.room).emit(data.email, "JOINED video streaming service", data);
            });
            socket.on("STREAM", (data) => {
                //data -> {room: string, email : string, stream:blob}
                ffmpegProcess.stdin.write(data.stream, (err) => {
                    console.log('Err', err);
                });
                this._io.of("/video").to(data.room).emit("STREAM", data);
            });
        });
    }
    initialisejoining() {
        this._io.of("/join").on("connection", (socket) => {
            console.log("a user connected in joining");
            // JOIN THE JOINING ROOM -> this is the room where users request to join a room
            // BOTH ADMIN AND USERS CAN JOIN THIS ROOM
            socket.on("JOINROOM", (data) => {
                console.log("joined the joining room " + data.room);
                socket.join(data.room);
            });
            /*
            * requesting admin to approve the request
            * this event can only be listened by admin
            */
            socket.on("REQUEST", (data) => {
                console.log(data.email + " wants to join the room");
                this._io.of("/join").to(data.room).emit("REQUEST", data);
            });
            /**
             * if admin approves the request
             * data containing details of the user will be emitted to the room
             * user with these credetials can now join the room
             * can only be listened by admin
             */
            socket.on("APPROVE", (data) => {
                console.log("admitting user " + data.email + " to the room" + data.room);
                console.log(data);
                this._io.of("/join").to(data.room).emit("APPROVE", data);
            });
            /**
             * if admin rejects the request
             * data containing details of the user will be emitted to the room
             * user with these credetials cannot join the room
             */
            socket.on("REJECT", (data) => {
                this._io.of("/join").emit("REJECT", data);
            });
            socket.on("disconnect", () => {
                console.log("joined user disconnected");
            });
        });
    }
    get io() {
        return this._io;
    }
}
module.exports = SocketService;
