const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const express = require('express');
const app = express();

require('dotenv').config();//to take the .env file constant
const port = process.env.PORT || 5000;

const httpServer = createServer(app);//create a server in local

const io = new Server(httpServer, { //add socket io in server
    cors: {
        origin: ["https://admin.socket.io"],// dashboard for socket io
        credentials: true
    }
});


app.get('/', (req, res) => {// for testing purpose
    res.send('<h1>Hello world</h1>');
});

io.on('connection', socket => {//when client connect to the socket io
    console.log(`User Id ${socket.id} has connected`);

    socket.on('disconnect', ()=>{
        console.log( socket.id + ' has disconnected');
    });

    socket.on('subscribe_notification', (eventIds, callback) => {//when client join event or open app for init notification
        console.log("join", eventIds)
        try {
            socket.join(eventIds)//join room base on id
            callback({ success: true, error: null });
        } catch (error) {
            console.log('error for subscribe notification :', error);
            callback({ success: false, error: error });
        }
    })

    socket.on('unsubscribe_notification', (eventIds, callback) => {//when client leave the event or unsubscribe notification
        try {
            socket.leave(eventIds)//leave room
            console.log(`User Id ${socket.id} unsubscribe successfully to notification Ids: `, eventIds)
            callback({ success: true, error: null });
        } catch (error) {
            console.log('error for unsubscribe notification :', error);
            callback({ success: false, error: error });
        }
    })

    socket.on('send_notification', (data, callback) => {//when clienr send notification
        try {
            // base on the room/event id emit the event"receive_notification" to the listener in the room
            socket.to(data.eventId.toString()).emit("receive_notification", data);
            console.log(`User Id ${socket.id} send notification to event ${data.eventId}: ${data.title} \n ${data.message}`)
            callback({ success: true, error: null });
        } catch (error) {
            console.log('error for subsccribe notification :', error);
            callback({ success: true, error: error });
        }
    })
})

instrument(io, {
    auth: false,
});

httpServer.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on http://${process.env.IPV4}:${port}`);
});