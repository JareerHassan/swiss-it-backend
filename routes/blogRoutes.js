// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/upload"); // Multer middleware
// const {
//   getBlogs,
//   getBlogById,
//   createBlog,
//   updateBlog,
//   deleteBlog
// } = require("../controllers/blogController");

// // Routes
// router.get("/", getBlogs);
// router.get("/:id", getBlogById);

// // For creating a blog with media
// router.post("/", upload.array("media", 5), createBlog); // max 5 files

// // For updating blog with new media
// router.put("/:id", upload.array("media", 5), updateBlog);

// router.delete("/:id", deleteBlog);

// module.exports = router;


// routes/blogRoutes.js
import express from 'express';
import * as blogController from '../controllers/blogController.js';
import Blog from '../models/Blog.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Blog routes are working!' });
});

// Create blog (coverImage optional)
router.post('/', upload.single('coverImage'), (req, res, next) => {
  console.log('POST /api/blogs - Request received');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  next();
}, blogController.createBlog);

// Get all blogs
router.get('/', blogController.getBlogs);
router.get('/dashboard', blogController.getBlogsDashboard);

router.get('/:lang', blogController.getBlogsByLang);

// Get single blog
router.get('/blogdet/:id', blogController.getBlogById);

// Update blog (optional new cover image)
router.put('/:id', upload.single('coverImage'), blogController.updateBlog);

// Delete
router.delete('/:id', blogController.deleteBlog);
router.get('/byid/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;