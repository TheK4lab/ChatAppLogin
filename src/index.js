require('./db/dbConnection');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyparser = require('body-parser');

// Destructuring => richiedere la singola variabile
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
// crea un server http e prende come parametro express (che lo crea dietro le quinte, e non basta)
const server = http.createServer(app);
// socket.io vuole un server http come parametro, così express supporta i web socket
const io = socketio(server);

const port = 3000 || process.env.PORT;
const public = path.join(__dirname, '../public');

// Router
const userRouter = require('./routers/user');

// Middleware
app.use(express.static(public));
//app.use(express.static(publicAuth));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(userRouter);

// Logica autenticazione jwt

// Sockets
io.on('connection', (socket) => {
    console.log("Nuova connessione");
    // socket.emit si rivolge ad un solo client
    // io.emit si rivolge a tutti i client che sono connessi

    socket.on('join', ({ username, room }, callback) => {
        // addUser() ritorna l'utente o un errore
        const { error, user } = addUser({ id: socket.id, username, room });

        if(error) {
            // In caso di errore, ritorniamo la callback() così da interrompere l'esecuzione del codice
            return callback(error);
        }
        // Questo codice (fino alla callback()) verrà eseguito se addUser() ritorna un utente
        socket.join(user.room); // l'utente viene aggiunto alla room

        // generateMessage() invia il messaggio di benvenuto all'utente
        socket.emit('message', generateMessage('Server', 'Benvenuto ' + user.username));
        // In questo caso effettua il broadcast, quindi il messaggio viene trasmesso agli utenti connessi
        socket.broadcast.to(user.room).emit('message', generateMessage('Server', user.username + ' connesso'));

        // Per ottenere i dati della room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        // Se siamo arrivati qui, è andato tutto bene e richiamiamo la callback senza errore (vale anche per le altre chiamate)
        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        // Controlliamo se l'utente era veramente dentro la chatroom
        if(user) {
            io.to(user.room).emit('message', generateMessage('Server', user.username + " disconnesso"));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        console.log("Utente disconnesso");
    })
})
server.listen(port, () => console.log("Server is running on port:", port));