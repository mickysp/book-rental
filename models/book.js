const mongoose = require('mongoose')
const session = require('express-session')

const Schema = mongoose.Schema
const bookSchema = new Schema({
     bookid: {
          type: String,
          require: true,
          unique: true
     },
     title: {
          type: String,
          require: true
     },
     author: {
          type: String,
          require: true
     },
     category: {
          type: String,
          require: true
     },
     publisher: {
          type: String,
          require: true
     },
     synopsis: {
          type: String,
          require: true
     },
     amount: {
          type: Number,
          require: true
     },
     price: {
          type: Number,
          require: true
     },
     image: {
          type: String,
     },
     status: {
          type: Number,
          default: 1
     }
},{timestamps: true});

const myAllBooks = mongoose.model('Book', bookSchema)

module.exports = myAllBooks
