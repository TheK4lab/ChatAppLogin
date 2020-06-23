const socket = io();

// { Elementi del DOM, Template, Opzioni } = Variabili create per accorciare la sintassi
// Elementi del DOM
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Opzioni (per recuperare username e room dalla queryString)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// FRONT - END 
const autoscroll = () => {
    // Nuovo messaggio
    const $newMessage = $messages.lastElementChild;

    // Altezza del nuovo messaggio
    const newMessageStyle = getComputedStyle($newMessage); // Se passato a console.log(), mostra il css
    const newMessageMargin = parseInt(newMessageStyle.marginBottom); // prende la parte di stile interessata
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Altezza visibile
    const visibileHeight = $messages.offsetHeight;

    // Altezza del container dei messaggi
    const containerHeight = $messages.scrollHeight;

    // Quanto è andato giù?
    const scrollOffset = $messages.scrollTop + visibileHeight;

    // Altezza totale del container - l'altezza dell'ultimo messaggio
    // Per capire se siamo andati fino in fondo
    // Ci assicuriamo che siamo arrivati in fondo prima che l'ultimo messaggio sia stato aggiunto
    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(message);
    // Renderizza il messaggio tramite Mustache e moment (rispettivamente template e time tracking)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html); // Inserisce i nuovi messaggi in coda
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html; // Mostra i dati nella sidebar (id del div)
})

$messageForm.addEventListener('submit', (e) => {
    // previene il refresh
    e.preventDefault();
    // disabilita il tasto invia per prevenire comportamenti accidentali
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        // dopo aver emesso l'evento 'sendMessage' riattiviamo tutto
        $messageFormButton.removeAttribute('disabled'); // riabilita il bottone
        $messageFormInput.value = ''; // svuota la barra del messaggio
        $messageFormInput.focus(); // imposta il cursore sulla barra del messaggio

        if (error) {
            throw new Error(error);
        }

        console.log ("Messaggio inviato!");
    });
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/'; // In caso di errore, reindirizza l'utente nell'homepage
    }
});