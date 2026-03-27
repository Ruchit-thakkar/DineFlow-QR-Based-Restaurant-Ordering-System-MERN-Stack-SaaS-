const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const authMiddleware = require('../middleware/auth');

router.get('/', tableController.getTables);
router.post('/', authMiddleware, tableController.createTable);
router.delete('/:id', authMiddleware, tableController.deleteTable);

module.exports = router;
