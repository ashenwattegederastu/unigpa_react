const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// PUT /api/user/profile — update firstname, lastname, email
const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, email } = req.body;

        if (!firstname || !lastname || !email) {
            return res.status(400).json({ message: 'First name, last name, and email are required.' });
        }

        // Check if email is taken by another user
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'This email is already in use by another account.' });
        }

        await pool.query(
            'UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?',
            [firstname, lastname, email, req.user.id]
        );

        const [updated] = await pool.query(
            'SELECT id, firstname, lastname, email FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            message: 'Profile updated successfully.',
            user: updated[0],
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/user/password — change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        // Verify current password
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/user/data — delete all degrees (account data) but keep account
const deleteAccountData = async (req, res) => {
    try {
        await pool.query('DELETE FROM degrees WHERE user_id = ?', [req.user.id]);

        res.json({ message: 'All account data has been deleted.' });
    } catch (error) {
        console.error('Delete data error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/user — delete the entire account
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete your account.' });
        }

        // Verify password
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Delete degrees first (cascade should handle, but being explicit)
        await pool.query('DELETE FROM degrees WHERE user_id = ?', [req.user.id]);
        await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);

        res.json({ message: 'Account deleted successfully.' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { updateProfile, changePassword, deleteAccountData, deleteAccount };
