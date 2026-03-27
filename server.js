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

const corsOptions = {
  origin: ['https://swiss-it.vercel.app', 'https://swiss-it-adminpanel.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB lazily for serverless (and only for API routes).
// This avoids crashing the function at cold start when env vars are missing.
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

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Vercel Node runtime calls exported handlers with `(req, res)`.
// We directly delegate to the Express app to avoid `serverless-http` provider mismatches.
export default function handler(req, res) {
    return app(req, res);
}

// Local dev: start a normal HTTP listener.
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 4003;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
