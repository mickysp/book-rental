const mongoose = require('mongoose')
const Schema = mongoose.Schema
const adminSchema = new Schema({
     username: {
        type: String,
    },
    password: {
        type: String,
    }
})

const myAdmin = mongoose.model('Admin', adminSchema)

module.exports = myAdmin
