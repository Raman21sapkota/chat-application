const http = require('http');
const app = require("./app")
const { Server } = require("socket.io");
const port =  3000;
const server = http.createServer(app);
const io = new Server(server);
const {db,friendRequest, fetchMessage, fetchFriendRequestAccept, updateMessage, deleteMessage}  = require("./database");
// const friendRequest = require("./api/connectRequest");

const userSocketMap = {};


const deleteSocketId = function(object, value){
    for(let i in object){
        if(object[i]==value){
            delete object[i];
        }
    }
}


io.on("connection", (socket)=>{
    console.log("User connected");
    socket.emit("socketId", `Our socket is ${socket.id}`);


    socket.on("updateSocketId", async (body) => {
        if (body.userId == "" || body.userId == null) {
            socket.emit("error", "Something is missing");
        } else {
            userSocketMap[body.userId] = socket.id;
            console.log(`User ${body.userId} is associated with socket ${socket.id}`);
            try {
                const result = await fetchMessage(body.userId);
                if(result!=="[]"){
                    socket.emit("message", result);
                }
            } catch (error) {
                socket.emit("error", "Error fetching messages");
            }

            try {
                const result = await friendRequest(body.userId);
                if(result!=="[]"){
                    socket.emit("friendRequest", result);
                }
            } catch (error) {
                socket.emit("error", "Error fetching friend request");
            }
            try {
                const result = await updateMessage(body.userId);

                if(result!=="[]"){
                    socket.emit("updateMessage", result);
                }
            } catch (error) {
                socket.emit("error", "Error fetching update messages");
            }

            try {
                const result = await deleteMessage(body.userId);
                if(result!=="[]"){
                    socket.emit("deleteMessage", result);
                }
            } catch (error) {
                socket.emit("error", `Error delete messages${error}`);
            }


            try {
                const result = await fetchFriendRequestAccept(body.userId);
                if(result!=="[]"){
                    socket.emit("friendRequestAccept", result);
                }
            } catch (error) {
                socket.emit("error", "Error fetching messages");
            }
        
        }
    });
    

    socket.on("friendRequest", (body)=>{
        if (body.targetAnonymousId == "" || body.senderAnonymousId == ""|| body.username == ""|| body.publicKey == ""||body.targetAnonymousId == null|| body.senderAnonymousId == null|| body.username == null|| body.publicKey == null){
            socket.emit("error", "Something is missing");
        } else {
            targetSocketId=userSocketMap[body.targetAnonymousId];
            if(targetSocketId!=undefined){
                io.to(targetSocketId).emit("friendRequest", [body]);
            } else{
                const sql = "INSERT INTO notification (targetAnonymousId, senderAnonymousId, username, publicKey) VALUES (?, ?, ?, ?)";
                const values = [body.targetAnonymousId, body.senderAnonymousId, body.username, body.publicKey];
                db.query(sql, values);
            }
        }
    });

 

    socket.on("message", (body) => {
        if(body.timeStamp==null|| body.timeStamp==""||body.targetAnonymousId==null||body.message==null||body.senderAnonymousId==null||body.targetAnonymousId==""||body.message==""||body.senderAnonymousId==""){
            socket.emit("error", "Something is missing");
        }
        else{
            targetSocketId=userSocketMap[body.targetAnonymousId];
            if(targetSocketId!=undefined){
                io.to(targetSocketId).emit("message", [body]);
            } else{
                const sql = "INSERT INTO message (targetAnonymousId, senderAnonymousId, message, timeStamp) VALUES (?, ?, ?, ?)";
                const values = [body.targetAnonymousId, body.senderAnonymousId, body.message, body.timeStamp];
                db.query(sql, values);
            }
        }
    });

    socket.on("updateMessage", (body) => {
        if(body.timeStamp==null|| body.timeStamp==""||body.targetAnonymousId==null||body.message==null||body.senderAnonymousId==null||body.targetAnonymousId==""||body.message==""||body.senderAnonymousId==""){
            socket.emit("error", "Something is missing");
        }
        else{
            targetSocketId=userSocketMap[body.targetAnonymousId];
            if(targetSocketId!=undefined){
                io.to(targetSocketId).emit("updateMessage", [body]);
            } else{
                const sql = "INSERT INTO updateMessage (targetAnonymousId, senderAnonymousId, message, timeStamp) VALUES (?, ?, ?, ?)";
                const values = [body.targetAnonymousId, body.senderAnonymousId, body.message, body.timeStamp];
                db.query(sql, values);

            }
        }
    });

    socket.on("friendRequestAccept", (body)=>{
        if (body.targetAnonymousId == "" ||body.username == "" || body.targetAnonymousId == null ||body.senderAnonymousId == ""|| body.publicKey == ""||body.targetAnonymousId == null|| body.senderAnonymousId == null|| body.publicKey == null){
            socket.emit("error", "Something is missing");
        } else {
            targetSocketId=userSocketMap[body.targetAnonymousId];
            if(targetSocketId!=undefined){
                io.to(targetSocketId).emit("friendRequestAccept", [body]);
            } else{
                const sql = "INSERT INTO friendRequestAccept (targetAnonymousId, senderAnonymousId, publicKey) VALUES (?, ?, ?, ?)";
                const values = [body.targetAnonymousId, body.senderAnonymousId, body.publicKey];
                db.query(sql, values);
            }
        }
    });

    socket.on("deleteMessage", (body) => {
        if(body.timeStamp==null|| body.timeStamp==""||body.targetAnonymousId==null||body.message==null||body.senderAnonymousId==null||body.targetAnonymousId==""||body.message==""||body.senderAnonymousId==""){
            socket.emit("error", "Something is missing");
        }
        else{
            targetSocketId=userSocketMap[body.targetAnonymousId];
            if(targetSocketId!=undefined){
                io.to(targetSocketId).emit("deleteMessage", [body]);
            } else{
                const sql = "INSERT INTO deleteMessage (targetAnonymousId, senderAnonymousId, message, timeStamp) VALUES (?, ?, ?, ?)";
                const values = [body.targetAnonymousId, body.senderAnonymousId, body.message, body.timeStamp];
                db.query(sql, values);
            }
        }
    });

    
    
    socket.on("disconnect", function(){
        deleteSocketId(userSocketMap, socket.id);
    });
});


server.listen(port);

