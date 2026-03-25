import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Pre-save hook to generate slug from name if not provided
categorySchema.pre('save', async function() {
    // Generate slug from name if not provided or empty
    if ((!this.slug || this.slug.trim() === '') && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Ensure slug is always set
    if (!this.slug || this.slug.trim() === '') {
        throw new Error('Slug is required and could not be generated from name');
    }
    
    // Ensure slug is lowercase and trimmed
    this.slug = this.slug.toLowerCase().trim();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
