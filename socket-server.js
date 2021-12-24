'use strict'

var socketIO = require('socket.io');
const mongoose = require('mongoose');
var ot = require('ot');
var roomList = {};

module.exports = function (server) {
    var str = `#include<iostream>
using namespace std;
    
int main () {
    // your code here
    cout << "Hello World!" << endl;
    return 0;
}`;
    const io = socketIO(server);
    io.on('connection', (socket) => {
        socket.on('joinRoom', async (data) => {
            console.log("joining room");
            if (!roomList[data.room]) {
                var socketIOServer = new ot.EditorSocketIOServer(str, [], data.room, function (socket, cb) {
                    var self = this;
                    console.log(self.document);
                    Code.findByIdAndUpdate(data.room, { content: self.document }, function (err) {
                        if (err) return cb(false);
                        cb(true);
                    });
                });
                roomList[data.room] = socketIOServer;
            }
            roomList[data.room].addClient(socket);
            roomList[data.room].setName(socket, data.username);

            socket.room = data.room;
            socket.join(data.room);
        });

        socket.on('disconnect', () => {
            socket.leave(socket.room);
        });
    });
}