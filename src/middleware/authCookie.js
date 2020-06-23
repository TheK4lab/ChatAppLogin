const jwt = require('jsonwebtoken');
const User = require('../model/user');

const authCookie = async (req, res, next) => {
    try {
        const token = req.cookies['jwt'];
        console.log("Token acquired", token);
        const decoded = jwt.verify(token, 'chatauthenticationtoken');
        console.log("Decoded", decoded);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        console.log("User founded", user);

        if(!user) {
            throw new Error("User not founded");
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error });
    }
}
module.exports = authCookie;