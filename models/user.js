const mongoose = require('mongoose')
const session = require('express-session')
const { DateTime } = require("luxon");

const Schema = mongoose.Schema

const cartSchema = new Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    quantity: { type: Number, default: 1 }
});

const userSchema = new Schema({
    image: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    is_admin: {
        type: Number,
        default: 0
    },
    cart: [cartSchema] // Reference to Book model through cart
})

const myUser = mongoose.model('User', userSchema)

module.exports = myUser
