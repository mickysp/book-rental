const mongoose = require('mongoose')
const session = require('express-session')
const { DateTime } = require("luxon");
const Schema = mongoose.Schema



const cartSchema = new Schema({
    book: {
        type: String,
        ref: 'Book'
    },
    quantity: {
        type: Number,
        default: 1
    }
});

const rentBookSchema = new Schema({
    user: {
        type: String,
        ref: 'User'
    },
    cart: [cartSchema]
    ,
    total: {
        type: Number
    },
    rentalStartTime: {
        type: Date,
        default: Date.now
    },
    rentalEndTime: {
        type: Date,
        default: () => DateTime.now().plus({ days: 7 }).toJSDate() // กำหนดเวลาสิ้นสุดการเช่าเป็น 7 วันหลังจากเวลาปัจจุบัน
    },
    statusRent: {
        type: Number,
        default: 0 //คืนแล้วหรืออยู่ในระหว่างการเช่า
    },
    statusPayment: {
        type: Number,
        default: 0 //ยืนยันแล้วหรือยังไม่ยืนยัน
    },
    slip: {
        type: String
    }
})

const myRent = mongoose.model('rentBook', rentBookSchema)

module.exports = myRent