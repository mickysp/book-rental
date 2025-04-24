var express = require('express');
var router = express.Router();
const myUser = require('../models/user');
const myAllBooks = require('../models/book');
const myRent = require('../models/rentBook');

const { DateTime } = require("luxon");

const { await } = require('await');
const { render } = require('../app');

const multer = require('multer')
const fs = require("fs")
const Storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage: Storage
})

/* GET home page. */
// router.get('/home', function(req, res, next) {
//   res.render('index');
// });


router.get('/home', async (req, res) => {
  try {
    const userData = await myUser.findById({ _id: req.session.userID })
    const books = await myAllBooks.find();
    res.render('index', { user: userData, books });
  }
  catch (error) {
    console.log(error.message)
  }
});

router.get('/borrow', async (req, res) => {
  try {
    const userId = req.session.userID;

    const rentData = await myRent.find({ user: userId });

    console.log('Book Orders:', rentData);

    res.render('borrow', { rentData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแสดงตะกร้า' });
  }
});

router.get('/detailbook', function (req, res, next) {
  res.render('detailbook');
});

// แสดงข้อมูลเฉพาะ cartoon

router.get('/cartoon', function (req, res, next) {
  myAllBooks.find({ category: 'การ์ตูน' })
    .then((result) => {
      res.render('./category/cartoon', { books: result });
    })
    .catch((err) => {
      console.log(err)
    })
});

// แสดงข้อมูลเฉพาะ literature
router.get('/literature', function (req, res, next) {
  myAllBooks.find({ category: 'วรรณกรรม' })
    .then((result) => {
      res.render('./category/literature', { books: result });
    })
    .catch((err) => {
      console.log(err)
    })
});

router.get('/novel', function (req, res, next) {
  myAllBooks.find({ category: 'นวนิยาย' })
    .then((result) => {
      res.render('./category/novel', { books: result });
    })
    .catch((err) => {
      console.log(err)
    })
});

router.get('/search', async (req, res) => {
  try {
    const userData = await myUser.findById({ _id: req.session.userID })
    const { query } = req.query;


    const books = await myAllBooks.find({
      title: { $regex: query, $options: 'i' }
    });

    res.render('index', { user: userData, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า' });
  }
});

router.get('/cart', async (req, res) => {
  try {
    const userId = req.session.userID;
    const userData = await myUser.findById(userId).populate('cart.book');

    if (!userData) {
      throw new Error('User data not found');
    }

    let totalPrice = 0;
    for (const cartItem of userData.cart) {
      totalPrice += cartItem.quantity * cartItem.book.price;
    }

    res.render('cart', { cart: userData.cart, user: userData, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแสดงตะกร้า' });
  }
});


router.post('/add-to-cart/:id', async (req, res) => {
  try {
    const book_id = req.params.id;
    const userId = req.session.userID;
    const quantity = parseInt(req.body.quantity);

    const book = await myAllBooks.findById(book_id);

    if (!book) {
      return res.status(404).send('ไม่พบหนังสือที่เลือก');
    }

    const user = await myUser.findById(userId);

    const existingCartItem = user.cart.find(item => item.book.toString() === book._id.toString());

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ book: book._id, quantity: quantity });
    }

    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มลงในตะกร้า' });
  }
});

router.post('/remove-from-cart/:id', async (req, res) => {
  try {
    const book_id = req.params.id;
    const userId = req.session.userID;

    // Find the user and their cart
    const user = await myUser.findById(userId);

    if (!user) {
      return res.status(404).send('ไม่พบผู้ใช้');
    }

    // Find the cart item index to remove
    const cartIndex = user.cart.findIndex(item => item.book.toString() === book_id);

    if (cartIndex !== -1) {
      if (user.cart[cartIndex].quantity > 1) {
        // If quantity is more than 1, decrement the quantity
        user.cart[cartIndex].quantity -= 1;
      } else {
        // If quantity is 1, remove the item from the cart
        user.cart.splice(cartIndex, 1);
      }
    }

    // Save the updated cart
    await user.save();

    // Redirect to the cart page
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบออกจากตะกร้า' });
  }
});

router.get('/payment', async (req, res) => {
  try {
    const userId = req.session.userID;
    const userData = await myUser.findById(userId).populate('cart.book');

    if (!userData) {
      throw new Error('User data not found');
    }

    let totalPrice = 0;
    for (const cartItem of userData.cart) {
      totalPrice += cartItem.quantity * cartItem.book.price;
    }

    const rentalStartTime = DateTime.now().setZone('Asia/Bangkok');
    const rentalEndTime = rentalStartTime.plus({ days: 7 }).setZone('Asia/Bangkok');

    res.render('payment', { cart: userData.cart, user: userData, totalPrice, rentalStartTime, rentalEndTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแสดงตะกร้า' });
  }
});

router.post('/payment/confirm', upload.single('slip'), async (req, res) => {
  try {

    const userId = req.session.userID;
    const userOri = await myUser.findById(userId).populate('cart.book');
    const userData = [await myUser.findById(userId).populate('cart.book')];
    const books = await myAllBooks.find();

    if (!userData) {
      throw new Error('User data not found');
    }

    const rentalStartTime = DateTime.now().setZone('Asia/Bangkok');
    const rentalEndTime = rentalStartTime.plus({ days: 7 }).setZone('Asia/Bangkok');

    const imageSlip = req.file.filename

    const rentBookEntries = userData.map(user => {

      const cartItems = user.cart.map(cartItem => ({
        book: cartItem.book.title,
        quantity: cartItem.quantity,
        rentalStartTime: rentalStartTime,
        rentalEndTime: rentalStartTime.plus({ days: 7 })
      }));

      let totalPrice = 0;
      user.cart.forEach(cartItem => {
        const totalPriceForItem = cartItem.quantity * cartItem.book.price;
        totalPrice += totalPriceForItem;
      });

      return {
        user: user._id,
        cart: cartItems,
        total: totalPrice,
        rentalStartTime: rentalStartTime.toJSDate(),
        rentalEndTime: rentalEndTime.toJSDate(),
        slip: imageSlip
      }
    });

    await myRent.insertMany(rentBookEntries);

    userOri.cart = [];
    await userOri.save();

    userData.forEach(user => {
      for (const cartItem of user.cart) {
        const bookToUpdate = books.find(book => book.title === cartItem.book.title);
        if (bookToUpdate) {
          bookToUpdate.amount -= cartItem.quantity;
          bookToUpdate.save();
        }
      }
    })

    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแสดงตะกร้า' });
  }
});

module.exports = router;
