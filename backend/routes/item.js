const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', itemController.getItems);
router.get('/categories', itemController.getCategories);
router.post('/', authMiddleware, upload.single('image'), itemController.createItem);
router.put('/:id', authMiddleware, upload.single('image'), itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
