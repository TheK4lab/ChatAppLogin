const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique:  true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ("Email is invalid!");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error("Password can't be 'password'");
            }
        }
    },
    // Array di oggetti (token) per tenere traccia degli stessi
    // Un utente può avere più di un token poiché può accedere da diverse periferiche.
    // Tenendo traccia dei singoli token, ci assicuriamo che dal momento in cui
    // l'utente fa logout, venga eliminato il token giusto e che a sua volta
    // non resti loggato anche se ha fatto il logout.
    // Possibile rimedio --> expiresIn ? 
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

// Methods => accessibile nelle istanze (metodi di istanza)
userSchema.methods.generateAuthToken = async function () {
    const user = this; // evita l'uso di this.user
    // usiamo l'id come payload
    // IDEA => crittare la chiave segreta (vedi ROT-13) (?)
    const token = jwt.sign({ _id: user._id.toString()}, 'chatauthenticationtoken', { expiresIn: '2h'});

    // salviamo il token nel database
    user.tokens = user.tokens.concat({ token });
    await user.save();
    console.log(token);
    return token;
}

// Statics => accessibile nel modello (metodi del modello)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user) {
        throw new Error("Unable to login!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error("Unable to login!");
    }
    console.log(user);
    return user;
}

//.pre() esegue del codice prima che vengano eseguite delle determinate istruzioni
userSchema.pre('save', async function(next) {
    // this da accesso all'utente che sta per essere salvato
    const user = this;

    // isModified() sarà vero anche se la password è inserita per la prima volta
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;

