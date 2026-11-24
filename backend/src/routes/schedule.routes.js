const express = require('express');
const router = express.Router();
const { getAllSchedules, getHomeSchedules, createSchedule, markScheduleDone, updateSchedule, deleteSchedule } = require('../controllers/schedule.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllSchedules);
router.get('/home', verifyToken, getHomeSchedules);
router.post('/', verifyToken, createSchedule);
router.put('/:id/done', verifyToken, markScheduleDone);
router.put('/:id', verifyToken, updateSchedule);
router.delete('/:id', verifyToken, deleteSchedule);

module.exports = router;
