const express = require('express');
const router = express.Router();
const {
    getByDegree,
    create,
    update,
    remove,
} = require('../controllers/modules.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All module routes are protected
router.use(authMiddleware);

router.get('/:degreeId', getByDegree);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
