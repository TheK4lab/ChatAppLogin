const jwt = require('jsonwebtoken');
const User = require('../model/user');

const auth = async (req, res, next) => {
    try {
        // Cerca l'header che l'utente (tramite il client) invia
        const token = req.header('Authorization').replace('Bearer ', ''); // 'Bearer' serve?
        console.log("Token acquired", token);
        // Lo convalida (decodifica)
        const decoded = jwt.verify(token, 'chatauthenticationtoken');
        console.log("Decoded", decoded);
        // E trova l'utente associato a quel token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        console.log("User founded", user);

        if (!user) {
            throw new Error("User not founded");
        }
        req.token = token; // Lavoriamo col token decodificato sopra
        req.user = user; // Passiamo l'utente al router degli utenti
        next();
    } catch (error) {
        res.status(401).send({ error });
    }
}
module.exports = auth;