const express = require('express');
const router = express.Router();
const { getAllPlants, getPlantById, createPlant, updatePlant, deletePlant } = require('../controllers/plant.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllPlants);
router.get('/:id', verifyToken, getPlantById);
router.post('/', verifyToken, createPlant);
router.put('/:id', verifyToken, updatePlant);
router.delete('/:id', verifyToken, deletePlant);

module.exports = router;
