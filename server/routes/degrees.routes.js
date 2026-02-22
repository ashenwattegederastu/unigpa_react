const express = require('express');
const router = express.Router();
const { getAll, create, remove } = require('../controllers/degrees.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All degree routes are protected
router.use(authMiddleware);

router.get('/', getAll);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
