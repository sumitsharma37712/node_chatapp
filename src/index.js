const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const path = require('path')
const Filter = require('bad-words')
const { generatemessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInroom } = require('./utils/users')
const server = http.createServer(app)
const io = socketio(server)
const public = path.join(__dirname, '../public');
app.use(express.static(public))
const port = 3000


// app.get('/',(req,res)=>{
//     res.send('start')
// })

io.on('connection', (socket) => {
    console.log('server start websocket')

    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generatemessage(`${user.username}`,'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInroom(user.room)
        })

        callback()

    })

    socket.on('sendmessage', (message, callback) => {
        const user=getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }

        io.to(user.room).emit('message', generatemessage(user.username,message))
        callback()
    })


    socket.on('sendlocation', (coords, callback) => {
        const user=getUser(socket.id)
        io.to(user.room).emit('location messsage', generateLocationMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitute}`))
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generatemessage('admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInroom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log("server start port " + port)
})