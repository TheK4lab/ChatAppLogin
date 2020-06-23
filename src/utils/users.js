const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Convalida dei dati
    if (!username || !room) {
        return {
            error: 'Nome utente e stanza obbligatori'
        }
    }

    // Controlla se l'utente esiste
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Convalida username
    if (existingUser) {
        return {
            error: 'Username in uso!'
        }
    }

    // Salva l'utente
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    // Ricerca l'utente attraverso il suo indice nell'array degli utenti
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        // splice() ritorna un array con gli elementi trovati
        //[0] serve ad accedere all'unico elemento trovato da findIndex()
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    // Diverso da findIndex() perché ritorna tutte le informazioni relative all'utente
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    // filter() ritornerà un array con tutti gli utenti in una room
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}