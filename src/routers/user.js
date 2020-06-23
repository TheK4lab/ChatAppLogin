const express = require('express');
const User = require('../model/user');
const router = new express.Router();
const cookieParser = require('cookie-parser');
const authCookie = require('../middleware/authCookie');
const path = require('path');

const public = path.join(__dirname, '../../public');
router.use(cookieParser());
router.use(express.static(public));

router.post('/signup', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        //const token = await user.generateAuthToken();
        console.log(user);
        res.sendFile(public + "/index.html");
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/signupajax', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        //const token = await user.generateAuthToken();
        console.log(user);
        res.json(user);
    } catch (error) {
        res.status(400).json(error);
    }
})

router.post('/login', async (req, res) => {
    try {
        // findByCredentials è usato per operare sulla collection User
        const user = await User.findByCredentials(req.body.email, req.body.password);
        // generateAuthToken è usato sul singolo utente
        const token = await user.generateAuthToken();
        res.cookie('jwt', token.toString(), {
            httpOnly: true,
            secure: false,
            maxAge: 2 * 60 * 60 * 1000 // <-- 2 ore
        });
        console.log(user, token);
        res.sendFile(public + "/setup.html");
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/loginajax', async (req, res) => {
    try {
        // findByCredentials è usato per operare sulla collection User
        const user = await User.findByCredentials(req.body.email, req.body.password);
        // generateAuthToken è usato sul singolo utente
        const token = await user.generateAuthToken();
        res.cookie('jwt', token.toString(), {
            httpOnly: false,
            secure: false,
            maxAge: 2 * 60 * 60 * 1000 // <-- 2 ore
        });
        console.log(user, token);
        res.json({user, token});
    } catch (error) {
        res.status(500).send(error);
    }
})

// NB: Su Postman bisogna passare il token dell'utente nella scheda Authorization dopo aver selezionato "Bearer token"
// Passiamo il middleware di autenticazione. Per fare il logout, dobbiamo essere loggati e quindi autenticati
router.post('/logout', authCookie, async (req, res) => {
    try {
        // Utilizziamo .filter() per eliminare solo un determinato token (es: quello associato allo smartphone)
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token; // ritornerà il token trovato tramite .filter()
        });
        await req.user.save();
        res.sendFile(public + "/index.html");
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/logoutajax', authCookie, async (req, res) => {
    try {
        // Utilizziamo .filter() per eliminare solo un determinato token (es: quello associato allo smartphone)
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token; // ritornerà il token trovato tramite .filter()
        });
        await req.user.save();
        res.json({status: "Disconnesso"});
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;