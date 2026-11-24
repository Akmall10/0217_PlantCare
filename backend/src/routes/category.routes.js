const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllCategories);
router.get('/:id', verifyToken, getCategoryById);
router.post('/', verifyToken, verifyAdmin, createCategory);
router.put('/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/:id', verifyToken, verifyAdmin, deleteCategory);

module.exports = router;
