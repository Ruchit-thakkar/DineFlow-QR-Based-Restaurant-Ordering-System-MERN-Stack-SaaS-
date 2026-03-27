const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.put('/update-credentials', authMiddleware, authController.updateCredentials);

module.exports = router;
