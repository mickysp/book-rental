const express = require('express');
const router = express.Router();
const myAllBooks = require('../models/book');

router.get('/', async (req, res) => {
  try {
    const books = await myAllBooks.find();
    res.render('test', { books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    const books = await myAllBooks.find({
      title: { $regex: query, $options: 'i' }
    });

    res.render('test', { books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า' });
  }
});

module.exports = router;
