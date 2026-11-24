const express = require('express');
const router = express.Router();
const { getAllJournals, getJournalById, createJournal, updateJournal, deleteJournal } = require('../controllers/journal.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllJournals);
router.get('/:id', verifyToken, getJournalById);
router.post('/', verifyToken, createJournal);
router.put('/:id', verifyToken, updateJournal);
router.delete('/:id', verifyToken, deleteJournal);

module.exports = router;
