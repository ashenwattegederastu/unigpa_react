const { pool } = require('../config/db');

// Grade to point mapping (4.0 scale)
const GRADE_POINTS = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0,
    'F': 0.0,
};

// Calculate GPA for a set of modules
function calculateGPA(modules, gradingScale) {
    const graded = modules.filter(m => m.grade && GRADE_POINTS[m.grade] !== undefined);
    if (graded.length === 0) return null;

    const scale = parseFloat(gradingScale) || 4.0;
    const scaleFactor = scale / 4.0;

    let totalPoints = 0;
    let totalCredits = 0;

    for (const mod of graded) {
        const points = GRADE_POINTS[mod.grade] * scaleFactor;
        totalPoints += points * mod.credits;
        totalCredits += mod.credits;
    }

    return totalCredits > 0 ? (totalPoints / totalCredits) : null;
}

// GET /api/modules/:degreeId — list all modules for a degree + GPA
const getByDegree = async (req, res) => {
    try {
        const { degreeId } = req.params;

        // Verify degree belongs to user
        const [degrees] = await pool.query(
            'SELECT * FROM degrees WHERE id = ? AND user_id = ?',
            [degreeId, req.user.id]
        );
        if (degrees.length === 0) {
            return res.status(404).json({ message: 'Degree not found.' });
        }

        const degree = degrees[0];

        const [modules] = await pool.query(
            'SELECT * FROM modules WHERE degree_id = ? AND user_id = ? ORDER BY year ASC, semester ASC, code ASC',
            [degreeId, req.user.id]
        );

        const gpa = calculateGPA(modules, degree.grading_scale);
        const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0);
        const completedCredits = modules
            .filter(m => m.grade && m.grade !== 'F')
            .reduce((sum, m) => sum + m.credits, 0);

        res.json({
            degree,
            modules,
            stats: {
                gpa: gpa !== null ? parseFloat(gpa.toFixed(2)) : null,
                totalCredits,
                completedCredits,
                moduleCount: modules.length,
                gradedCount: modules.filter(m => m.grade).length,
            },
        });
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/modules — create a module
const create = async (req, res) => {
    try {
        const { degree_id, code, name, year, semester, credits, grade } = req.body;

        if (!degree_id || !code || !name || !year || !semester) {
            return res.status(400).json({ message: 'Degree, code, name, year, and semester are required.' });
        }

        // Verify degree belongs to user
        const [degrees] = await pool.query(
            'SELECT id FROM degrees WHERE id = ? AND user_id = ?',
            [degree_id, req.user.id]
        );
        if (degrees.length === 0) {
            return res.status(404).json({ message: 'Degree not found.' });
        }

        // Validate grade if provided
        if (grade && !GRADE_POINTS.hasOwnProperty(grade)) {
            return res.status(400).json({ message: `Invalid grade. Valid grades: ${Object.keys(GRADE_POINTS).join(', ')}` });
        }

        const [result] = await pool.query(
            'INSERT INTO modules (degree_id, user_id, code, name, year, semester, credits, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [degree_id, req.user.id, code, name, parseInt(year), parseInt(semester), parseInt(credits) || 3, grade || null]
        );

        const [newModule] = await pool.query('SELECT * FROM modules WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Module added successfully.',
            module: newModule[0],
        });
    } catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/modules/:id — update a module
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, year, semester, credits, grade } = req.body;

        // Verify module belongs to user
        const [existing] = await pool.query(
            'SELECT id FROM modules WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Module not found.' });
        }

        // Validate grade if provided
        if (grade && !GRADE_POINTS.hasOwnProperty(grade)) {
            return res.status(400).json({ message: `Invalid grade. Valid grades: ${Object.keys(GRADE_POINTS).join(', ')}` });
        }

        await pool.query(
            'UPDATE modules SET code = ?, name = ?, year = ?, semester = ?, credits = ?, grade = ? WHERE id = ? AND user_id = ?',
            [code, name, parseInt(year), parseInt(semester), parseInt(credits) || 3, grade || null, id, req.user.id]
        );

        const [updated] = await pool.query('SELECT * FROM modules WHERE id = ?', [id]);

        res.json({
            message: 'Module updated successfully.',
            module: updated[0],
        });
    } catch (error) {
        console.error('Update module error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/modules/:id — delete a module
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            'SELECT id FROM modules WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Module not found.' });
        }

        await pool.query('DELETE FROM modules WHERE id = ?', [id]);

        res.json({ message: 'Module deleted successfully.' });
    } catch (error) {
        console.error('Delete module error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getByDegree, create, update, remove, GRADE_POINTS };
