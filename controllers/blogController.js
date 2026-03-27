// const Blog = require("../models/Blog");

// // ✅ Get all blogs (with language filter)
// exports.getBlogs = async (req, res) => {
//   try {
//     const { lang = "en" } = req.query;
//     const blogs = await Blog.find();

//     const response = blogs.map(blog => ({
//       _id: blog._id,
//       author: blog.author,
//       title: blog.translations[lang]?.title || blog.translations.en.title,
//       content: blog.translations[lang]?.content || blog.translations.en.content,
//       category: blog.category,
//       tags: blog.tags,
//       style: blog.style,
//       publishDate: blog.publishDate,
//       views: blog.views
//     }));

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching blogs", error: error.message });
//   }
// };

// // ✅ Get single blog
// exports.getBlogById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { lang = "en" } = req.query;

//     const blog = await Blog.findById(id);
//     if (!blog) return res.status(404).json({ message: "Blog not found" });

//     // Increase views
//     blog.views += 1;
//     await blog.save();

//     res.json({
//       _id: blog._id,
//       author: blog.author,
//       title: blog.translations[lang]?.title || blog.translations.en.title,
//       content: blog.translations[lang]?.content || blog.translations.en.content,
//       category: blog.category,
//       tags: blog.tags,
//       style: blog.style,
//       publishDate: blog.publishDate,
//       views: blog.views
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching blog", error: error.message });
//   }
// };

// exports.createBlog = async (req, res) => {
//   try {
//     let mediaUrls = [];
//     if (req.files) {
//       mediaUrls = req.files.map(file => `/uploads/${file.filename}`);
//     }

//     const blogData = {
//       ...req.body,
//       media: mediaUrls 
//     };

//     const blog = new Blog(blogData);
//     await blog.save();
//     res.status(201).json(blog);
//   } catch (error) {
//     res.status(400).json({ message: "Error creating blog", error: error.message });
//   }
// };


// exports.updateBlog = async (req, res) => {
//   try {
//     // Append new uploaded files
//     let mediaUrls = [];
//     if (req.files) {
//       mediaUrls = req.files.map(file => `/uploads/${file.filename}`);
//     }

//     const blog = await Blog.findById(req.params.id);
//     if (!blog) return res.status(404).json({ message: "Blog not found" });

//     // Merge existing media with new uploads
//     blog.media = [...(blog.media || []), ...mediaUrls];

//     // Update other fields
//     if (req.body.translations) blog.translations = req.body.translations;
//     if (req.body.category) blog.category = req.body.category;
//     if (req.body.tags) blog.tags = req.body.tags;

//     await blog.save();
//     res.json(blog);
//   } catch (error) {
//     res.status(400).json({ message: "Error updating blog", error: error.message });
//   }
// };

// // ✅ Delete blog
// exports.deleteBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findByIdAndDelete(req.params.id);
//     if (!blog) return res.status(404).json({ message: "Blog not found" });
//     res.json({ message: "Blog deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting blog", error: error.message });
//   }
// };


import Blog from '../models/Blog.js';

// Helper to format full URL
// const getFullUrl = (req, filePath) => {
//   if (!filePath) return null;
//   if (filePath.startsWith('https')) return filePath;
//   return `${req.protocol}://${req.get('host')}${filePath}`;
// };



// ✅ Create Blog
// exports.createBlog = async (req, res) => {
//   try {
//     let coverImageUrl = null;
//     if (req.file) {
//       coverImageUrl = `/uploads/${req.file.filename}`;
//       coverImageUrl = getFullUrl(req, coverImageUrl);
//     }

//     let content = req.body.content;
//     if (typeof content === 'string') {
//       try { content = JSON.parse(content); } catch (e) {}
//     }

//     let tags = req.body.tags;
//     if (typeof tags === 'string') {
//       try {
//         tags = JSON.parse(tags);
//       } catch (e) {
//         tags = tags.split(',').map(t => t.trim());
//       }
//     }

//     const blog = new Blog({
//       language: req.body.language || 'en', // ✅ default English
//       title: req.body.title,
//       category: req.body.category,
//       coverImage: coverImageUrl || req.body.coverImage || null,
//       content: content || {},
//       tags: tags || [],
//     });

//     await blog.save();
//     res.status(201).json(blog);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// ✅ Get Blogs by language
export const getBlogsByLang = async (req, res) => {
  try {
    const { lang } = req.params;
    const blogs = await Blog.find({ language: lang })
      .select('_id language category coverImage title tags createdAt')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get Single Blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getFullUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath; // already full URL
  return `https://backend.highlandgroup.ch/api${filePath}`;
};


// ✅ Create Blog
export const createBlog = async (req, res) => {
  try {
    let coverImageUrl = null;
    if (req.file) {
      coverImageUrl = `/uploads/${req.file.filename}`;
      coverImageUrl = getFullUrl(coverImageUrl); // ← fixed here
    }

    let content = req.body.content;
    if (typeof content === 'string') {
      try { 
        content = JSON.parse(content);
        // Ensure content has proper EditorJS structure
        if (!content.blocks || !Array.isArray(content.blocks)) {
          content.blocks = [];
        }
        // Filter out invalid blocks
        content.blocks = content.blocks.filter(block => {
          if (!block || !block.type || !block.data) return false;
          
          // Paragraph blocks - allow empty text (empty paragraphs are valid in EditorJS)
          if (block.type === 'paragraph') {
            return block.data.text !== undefined && block.data.text !== null;
          }
          
          // Header blocks
          if (block.type === 'header') {
            return block.data.text && typeof block.data.text === 'string' && block.data.level;
          }
          
          // List blocks
          if (block.type === 'list') {
            return Array.isArray(block.data.items);
          }
          
          // Image blocks
          if (block.type === 'image') {
            return block.data.file || block.data.url;
          }
          
          // Quote blocks
          if (block.type === 'quote') {
            return block.data.text && typeof block.data.text === 'string';
          }
          
          return true;
        });
        
        // Ensure proper structure
        content = {
          time: content.time || Date.now(),
          blocks: content.blocks || [],
          version: content.version || '2.31.3'
        };
      } catch (e) {
        console.error('Error parsing content:', e);
        content = { blocks: [], time: Date.now(), version: '2.31.3' };
      }
    }
    
    // If content is not an object, create default structure
    if (typeof content !== 'object' || !content.blocks) {
      content = { blocks: [], time: Date.now(), version: '2.31.3' };
    }

    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags.split(',').map(t => t.trim());
      }
    }

    const blog = new Blog({
      language: req.body.language || 'en', // ✅ default English
      title: req.body.title,
      category: req.body.category,
      coverImage: coverImageUrl || req.body.coverImage || null,
      content: content || {},
      tags: tags || [],
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Update Blog
// exports.updateBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) return res.status(404).json({ message: 'Not found' });

//     if (req.file) {
//       blog.coverImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//     } else if (req.body.coverImage) {
//       blog.coverImage = req.body.coverImage;
//     }

//     if (req.body.language !== undefined) blog.language = req.body.language;
//     if (req.body.title !== undefined) blog.title = req.body.title;
//     if (req.body.category !== undefined) blog.category = req.body.category;

//     let content = req.body.content;
//     if (typeof content === 'string') {
//       try { content = JSON.parse(content); } catch (e) {}
//     }
//     if (content !== undefined) blog.content = content;

//     let tags = req.body.tags;
//     if (typeof tags === 'string') {
//       try {
//         tags = JSON.parse(tags);
//       } catch (e) {
//         tags = tags.split(',').map(t => t.trim());
//       }
//     }
//     if (tags !== undefined) blog.tags = tags;

//     await blog.save();
//     res.json(blog);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// Assuming this is in your controllers/blog.js or similar
// ... (your existing getFullUrl and createBlog)

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params; // Assuming route is /api/blogs/:id
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update fields if provided
    if (req.body.title) blog.title = req.body.title;
    if (req.body.category) blog.category = req.body.category;
    if (req.body.language) blog.language = req.body.language;

    // Handle cover image: use new if uploaded, else keep existing
    let coverImageUrl = blog.coverImage; // Default to existing
    if (req.file) {
      coverImageUrl = `/uploads/${req.file.filename}`;
      coverImageUrl = getFullUrl(coverImageUrl);
    } else if (req.body.coverImage) {
      // If sending existing URL (optional, for no change)
      coverImageUrl = getFullUrl(req.body.coverImage);
    }
    blog.coverImage = coverImageUrl;

    // Parse content if string
    let content = req.body.content;
    if (typeof content === 'string') {
      try { content = JSON.parse(content); } catch (e) {}
    }
    if (content) blog.content = content;

    // Parse tags
    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags.split(',').map(t => t.trim());
      }
    }
    if (tags) blog.tags = tags;

    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select('_id category coverImage title tags createdAt')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBlogsDashboard = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};