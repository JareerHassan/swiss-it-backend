// const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema({
//   author: { type: String, required: true },
//   translations: {
//     en: {
//       title: { type: String, required: true },
//       content: { type: String, required: true }
//     },
//     ur: {
//       title: { type: String },
//       content: { type: String }
//     },
//   },
//   category: String,
//   tags: [String],
//   views: { type: Number, default: 0 },
//   media: [String],
//   style: {
//     font: { type: String, default: "Arial" },
//     color: { type: String, default: "#000000" },
//     backgroundColor: { type: String, default: "#ffffff" },
//     headerImage: { type: String }
//   },
//   comments: [
//     {
//       user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//       content: { type: String, required: true },
//       replies: [
//         {
//           user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//           content: { type: String, required: true },
//           createdAt: { type: Date, default: Date.now }
//         }
//       ],
//       createdAt: { type: Date, default: Date.now }
//     }
//   ]
// }, { timestamps: true });


// module.exports = mongoose.model("Blog", blogSchema);

// models/Blog.js
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ['en', 'ar', 'sv'], 
      required: true
    },
    title: { type: String, required: true },
    category: { type: String },
    coverImage: { type: String }, // will store URL (e.g. /uploads/xxx.jpg)
    content: { type: Object }, // EditorJS JSON
    tags: { type: [String], default: [] }, // ✅ tags array
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;