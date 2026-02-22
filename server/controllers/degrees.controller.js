const { pool } = require('../config/db');
const { GRADE_POINTS } = require('./modules.controller');

// GET /api/degrees — list all degrees for the authenticated user (with GPA stats)
const getAll = async (req, res) => {
    try {
        const [degrees] = await pool.query(
            'SELECT * FROM degrees WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        // For each degree, compute GPA from its modules
        const degreesWithStats = await Promise.all(degrees.map(async (degree) => {
            const [modules] = await pool.query(
                'SELECT credits, grade FROM modules WHERE degree_id = ? AND user_id = ?',
                [degree.id, req.user.id]
            );

            const graded = modules.filter(m => m.grade && GRADE_POINTS[m.grade] !== undefined);
            const scale = parseFloat(degree.grading_scale) || 4.0;
            const scaleFactor = scale / 4.0;

            let gpa = null;
            if (graded.length > 0) {
                let totalPoints = 0;
                let totalCredits = 0;
                for (const mod of graded) {
                    totalPoints += (GRADE_POINTS[mod.grade] * scaleFactor) * mod.credits;
                    totalCredits += mod.credits;
                }
                gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : null;
            }

            const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0);
            const completedCredits = modules
                .filter(m => m.grade && m.grade !== 'F')
                .reduce((sum, m) => sum + m.credits, 0);

            return {
                ...degree,
                gpa,
                totalCredits,
                completedCredits,
                moduleCount: modules.length,
            };
        }));

        res.json({ degrees: degreesWithStats });
    } catch (error) {
        console.error('GetAll degrees error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/degrees — create a new degree
const create = async (req, res) => {
    try {
        const { name, university, grading_scale, duration_years } = req.body;

        if (!name || !university) {
            return res.status(400).json({ message: 'Degree name and university are required.' });
        }

        const years = parseInt(duration_years) || 3;

        const [result] = await pool.query(
            'INSERT INTO degrees (user_id, name, university, grading_scale, duration_years, current_semester) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, name, university, grading_scale || '4.0', years, 1]
        );

        const [newDegree] = await pool.query('SELECT * FROM degrees WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Degree created successfully.',
            degree: newDegree[0],
        });
    } catch (error) {
        console.error('Create degree error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/degrees/:id — delete a degree
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the degree belongs to the authenticated user
        const [existing] = await pool.query(
            'SELECT id FROM degrees WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Degree not found.' });
        }

        await pool.query('DELETE FROM degrees WHERE id = ?', [id]);

        res.json({ message: 'Degree deleted successfully.' });
    } catch (error) {
        console.error('Delete degree error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getAll, create, remove };
