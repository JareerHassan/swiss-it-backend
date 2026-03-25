import express from 'express';
import {
    createSubmission,
    getSubmissions,
    getMySubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission,
} from '../controllers/submissionController.js';
import { protect, admin } from '../middlewares/userAuthMiddleware.js';
import { protect as adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSubmission);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/', adminProtect, getSubmissions); // Must come before /:id
router.get('/:id', protect, getSubmissionById);
router.put('/:id/status', adminProtect, updateSubmissionStatus);
router.delete('/:id', adminProtect, deleteSubmission);

export default router;
