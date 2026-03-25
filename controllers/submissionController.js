import Submission from '../models/Submission.js';

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private
const createSubmission = async (req, res) => {
    const { toolName, description, website, category, isPaid, price } = req.body;

    try {
        // Validate required fields
        if (!toolName || toolName.trim() === '') {
            return res.status(400).json({ message: 'Tool name is required' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ message: 'Description is required' });
        }
        if (!website || website.trim() === '') {
            return res.status(400).json({ message: 'Website is required' });
        }
        if (!category || category.trim() === '') {
            return res.status(400).json({ message: 'Category is required' });
        }
        
        // Validate price if paid
        const isPaidValue = isPaid === true || isPaid === 'true';
        if (isPaidValue && (!price || price <= 0)) {
            return res.status(400).json({ message: 'Price is required and must be greater than 0 for paid tools' });
        }

        const submission = new Submission({
            toolName: toolName.trim(),
            description: description.trim(),
            website: website.trim(),
            category,
            isPaid: isPaidValue,
            price: isPaidValue ? parseFloat(price) : null,
            submittedBy: req.user._id,
            status: 'pending',
        });

        const createdSubmission = await submission.save();
        await createdSubmission.populate('category', 'name slug');
        await createdSubmission.populate('submittedBy', 'name email');

        res.status(201).json(createdSubmission);
    } catch (error) {
        if (error.name === 'CastError' && error.path === 'category') {
            res.status(400).json({ message: 'Invalid category ID' });
        } else {
            res.status(400).json({ message: error.message || 'Failed to create submission' });
        }
    }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private/Admin
const getSubmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const submissions = await Submission.find(query)
            .populate('category', 'name slug')
            .populate('submittedBy', 'name email')
            .populate('reviewedBy', 'email')
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/my-submissions
// @access  Private
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ submittedBy: req.user._id })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('submittedBy', 'name email')
            .populate('reviewedBy', 'email');

        if (submission) {
            // Check if user owns the submission or is admin
            if (submission.submittedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to view this submission' });
            }

            res.json(submission);
        } else {
            res.status(404).json({ message: 'Submission not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update submission status (Approve/Reject)
// @route   PUT /api/submissions/:id/status
// @access  Private/Admin
const updateSubmissionStatus = async (req, res) => {
    const { status, rejectionReason } = req.body;

    try {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.status = status;
        submission.reviewedBy = req.admin._id;
        submission.reviewedAt = new Date();

        if (status === 'rejected' && rejectionReason) {
            submission.rejectionReason = rejectionReason;
        } else if (status === 'approved') {
            submission.rejectionReason = '';
        }

        const updatedSubmission = await submission.save();
        await updatedSubmission.populate('category', 'name slug');
        await updatedSubmission.populate('submittedBy', 'name email');
        await updatedSubmission.populate('reviewedBy', 'email');

        res.json(updatedSubmission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
const deleteSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (submission) {
            await submission.deleteOne();
            res.json({ message: 'Submission removed' });
        } else {
            res.status(404).json({ message: 'Submission not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    createSubmission,
    getSubmissions,
    getMySubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission,
};
