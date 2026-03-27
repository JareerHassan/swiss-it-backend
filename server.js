import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  'https://swiss-it.vercel.app',
  'https://swiss-it-adminpanel.vercel.app',
  'http://localhost:3000',
];


// ✅ CORS CONFIG (FIXED)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman / mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ✅ VERY IMPORTANT (Preflight Fix 🔥)
app.options('*', cors());


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Lazy DB Connection (Serverless Safe)
let dbConnectionPromise;

app.use('/api', async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }
    await dbConnectionPromise;
    next();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});


// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);


// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});


// ✅ Vercel handler
export default function handler(req, res) {
  return app(req, res);
}


// ✅ Local server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}