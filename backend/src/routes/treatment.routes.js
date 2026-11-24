const express = require('express');
const router = express.Router();
const { getAllTreatments, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatment.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllTreatments);
router.post('/', verifyToken, verifyAdmin, createTreatment);
router.put('/:id', verifyToken, verifyAdmin, updateTreatment);
router.delete('/:id', verifyToken, verifyAdmin, deleteTreatment);

module.exports = router;
