const express = require('express');
const router = express.Router();
const billSettingsController = require('../controllers/billSettingsController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, billSettingsController.getSettings);
router.put('/', authMiddleware, billSettingsController.updateSettings);

module.exports = router;
