const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const express = require('express')
const wordFilter = require('bad-words')
const {generateMsg,generateLocationMsg} = require('./utils/messages')
const {addUser, removeUser,getUser, getUsersInRoom} = require('./utils/users')

const app = express()

const server = http.createServer(app)
const srvio = socketio(server)


const port = 3000 | process.env.PORT
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))


srvio.on('connection', (socket)=>{
    console.log('New Client connection')

    //socket.emit('serverMsg', generateMsg('Welcome!'))
    //send everyone except the client connected to this socket
    //socket.broadcast.emit('serverMsg', generateMsg('<i style="color:red">A new client has joined</i>'))

    
    socket.on('join', ({username, room}, callback) => {

        const {error, user} = addUser({id:socket.id, username,room})

        if(error){
            return callback(error)
        }

        //user.room is the trimmed version
        socket.join(user.room)
        //use the below functions to emit to a specific room
        //io.to().emit
        //socket.broadcast.to().emit

        socket.emit('serverMsg', generateMsg('Welcome!','Admin'))        
        socket.broadcast.to(user.room).emit('serverMsg', generateMsg(`${user.username} has joined the room`,'Admin'))
        
        //update the list of users in a room
        srvio.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })        

        callback()
    })
    
    socket.on('sendMessage', (msg, callback) => {        
        
        const wdfilter = new wordFilter()
        if(wdfilter.isProfane(msg)){
           callback('Profanity detected')
        }
        else{
            
            const user = getUser(socket.id)
            
        //send all clients
        srvio.to(user.room).emit('serverMsg', generateMsg(msg,user.username))
        callback()
        }
    })    

    socket.on('disconnect', ()=>{

        const user = removeUser(socket.id)

        if(user){
            srvio.to(user.room).emit('serverMsg', generateMsg(`${user.username} has left`, 'Admin'))

            //update the list of users
            srvio.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (geoinfo, callback)=> {   

        const user = getUser(socket.id)

        srvio.to(user.room).emit('locationMessage',generateLocationMsg(`https://google.com/maps?q=${geoinfo.latitude},${geoinfo.longitude}`,user.username))
        callback('Server acknowledgement') 

    })
    
})


server.listen(port, () => {
    console.log('Chat Server is running')
})