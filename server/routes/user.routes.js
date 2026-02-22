const express = require('express');
const router = express.Router();
const {
    updateProfile,
    changePassword,
    deleteAccountData,
    deleteAccount,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All user routes are protected
router.use(authMiddleware);

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.delete('/data', deleteAccountData);
router.delete('/', deleteAccount);

module.exports = router;
