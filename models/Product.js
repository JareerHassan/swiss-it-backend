import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    fullDescription: {
        type: String,
        default: '',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    useCase: {
        type: String,
        default: '',
    },
    pricingModel: {
        type: String,
        enum: ['Free', 'Freemium', 'Paid', 'One-time', 'Subscription', 'Custom'],
        default: 'Paid',
    },
    websiteLink: {
        type: String,
        required: true,
    },
    pros: {
        type: [String],
        default: [],
    },
    limitations: {
        type: [String],
        default: [],
    },
    bestFor: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    image: {
        type: String,
        required: true,
    },
    // Legacy fields for backward compatibility
    description: {
        type: String,
        default: '',
    },
    link: {
        type: String,
        default: '',
    },
    features: {
        type: [String],
        default: [],
    },
    // SEO Fields
    seo: {
        meta_title: {
            type: String,
            maxlength: 60,
            default: '',
        },
        meta_description: {
            type: String,
            maxlength: 160,
            default: '',
        },
        focus_keyword: {
            type: String,
            default: '',
        },
        slug: {
            type: String,
            default: '',
            unique: true,
            sparse: true,
        },
        canonical_url: {
            type: String,
            default: '',
        },
        robots: {
            type: String,
            enum: ['index, follow', 'noindex, follow', 'noindex, nofollow', 'index, nofollow'],
            default: 'index, follow',
        },
        og_title: {
            type: String,
            default: '',
        },
        og_description: {
            type: String,
            default: '',
        },
        og_image: {
            type: String,
            default: '',
        },
        schema_markup: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        breadcrumb_title: {
            type: String,
            default: '',
        },
        page_language: {
            type: String,
            default: 'en',
        },
        last_updated_date: {
            type: Date,
            default: Date.now,
        },
    },
}, { timestamps: true });

// Pre-save hook to ensure SEO object is always initialized and migrate legacy fields
productSchema.pre('save', async function() {
    // Migrate legacy fields for backward compatibility
    if (this.description && !this.shortDescription) {
        this.shortDescription = this.description;
    }
    if (this.link && !this.websiteLink) {
        this.websiteLink = this.link;
    }
    if (this.features && this.features.length > 0 && (!this.pros || this.pros.length === 0)) {
        this.pros = this.features;
    }
    
    // Generate slug from name if not provided
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Ensure slug is set
    if (!this.slug || this.slug.trim() === '') {
        throw new Error('Slug is required and could not be generated from name');
    }
    
    // Ensure slug is lowercase and trimmed
    this.slug = this.slug.toLowerCase().trim();
    
    // Ensure SEO object is initialized
    if (!this.seo) {
        this.seo = {
            meta_title: '',
            meta_description: '',
            focus_keyword: '',
            slug: '',
            canonical_url: '',
            robots: 'index, follow',
            og_title: '',
            og_description: '',
            og_image: '',
            schema_markup: null,
            breadcrumb_title: '',
            page_language: 'en',
            last_updated_date: new Date(),
        };
    }
    // Update last_updated_date on save
    if (this.seo) {
        this.seo.last_updated_date = new Date();
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
