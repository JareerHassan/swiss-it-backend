import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Fetch all products with filters and search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            useCase, 
            tag, 
            sort = 'latest',
            pricingModel 
        } = req.query;

        // Build query
        let query = {};

        // Search in name, tags, useCase
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { useCase: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Use case filter
        if (useCase) {
            query.useCase = { $regex: useCase, $options: 'i' };
        }

        // Tag filter
        if (tag) {
            query.tags = { $in: [new RegExp(tag, 'i')] };
        }

        // Pricing model filter
        if (pricingModel) {
            query.pricingModel = pricingModel;
        }

        let products = await Product.find(query).populate('category', 'name slug');

        // Sorting
        if (sort === 'latest') {
            products.sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()));
        } else if (sort === 'alphabetical') {
            products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'free-first') {
            products.sort((a, b) => {
                const aIsFree = a.pricingModel === 'free' || a.pricingModel === 'Free';
                const bIsFree = b.pricingModel === 'free' || b.pricingModel === 'Free';
                if (aIsFree && !bIsFree) return -1;
                if (!aIsFree && bIsFree) return 1;
                return 0;
            });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        let product = null;
        
        // Check if id is a valid MongoDB ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
        
        if (isValidObjectId) {
            // Try to find by ObjectId first
            product = await Product.findById(id).populate('category', 'name slug description');
        }
        
        // If not found by ID (or id is not a valid ObjectId), try to find by slug
        if (!product) {
            product = await Product.findOne({ slug: id }).populate('category', 'name slug description');
        }

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { 
        name,
        slug,
        shortDescription,
        fullDescription,
        category,
        useCase,
        pricingModel,
        websiteLink,
        pros,
        limitations,
        bestFor,
        tags,
        // Legacy fields
        description,
        link,
        features,
        // SEO fields
        meta_title,
        meta_description,
        focus_keyword,
        seo_slug,
        canonical_url,
        robots,
        og_title,
        og_description,
        og_image,
        schema_markup,
        breadcrumb_title,
        page_language,
        last_updated_date
    } = req.body;
    const image = req.file ? req.file.path : '';

    // Validate required fields
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Product name is required' });
    }
    if (!shortDescription || shortDescription.trim() === '') {
        return res.status(400).json({ message: 'Short description is required' });
    }
    if (!category || category.trim() === '') {
        return res.status(400).json({ message: 'Category is required' });
    }
    if (!websiteLink || websiteLink.trim() === '') {
        return res.status(400).json({ message: 'Website link is required' });
    }
    if (!image) {
        return res.status(400).json({ message: 'Product image is required' });
    }

    // Generate slug if not provided
    let productSlug = slug;
    if (!productSlug || productSlug.trim() === '') {
        productSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    } else {
        productSlug = productSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (!productSlug || productSlug === '') {
        return res.status(400).json({ message: 'Unable to generate valid slug from product name' });
    }

    // Parse array fields if they're strings
    let prosArray = [];
    if (pros) {
        try {
            prosArray = typeof pros === 'string' ? JSON.parse(pros) : pros;
            if (!Array.isArray(prosArray)) prosArray = [];
        } catch (error) {
            prosArray = [];
        }
    }

    let limitationsArray = [];
    if (limitations) {
        try {
            limitationsArray = typeof limitations === 'string' ? JSON.parse(limitations) : limitations;
            if (!Array.isArray(limitationsArray)) limitationsArray = [];
        } catch (error) {
            limitationsArray = [];
        }
    }

    let tagsArray = [];
    if (tags) {
        try {
            tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            if (!Array.isArray(tagsArray)) tagsArray = [];
        } catch (error) {
            tagsArray = [];
        }
    }
    
    // Legacy fields parsing
    let featuresArray = [];
    if (features) {
        try {
            featuresArray = typeof features === 'string' ? JSON.parse(features) : features;
            if (!Array.isArray(featuresArray)) featuresArray = [];
        } catch (error) {
            featuresArray = [];
        }
    }

    // Parse schema_markup if it's a string
    let parsedSchemaMarkup = null;
    if (schema_markup) {
        try {
            parsedSchemaMarkup = typeof schema_markup === 'string' ? JSON.parse(schema_markup) : schema_markup;
        } catch (error) {
            parsedSchemaMarkup = null;
        }
    }

    try {
        const product = new Product({
            name: name.trim(),
            slug: productSlug,
            shortDescription: shortDescription.trim(),
            fullDescription: fullDescription ? fullDescription.trim() : '',
            category: category.trim(), // Category ObjectId
            useCase: useCase ? useCase.trim() : '',
            pricingModel: pricingModel || 'Paid',
            websiteLink: websiteLink.trim(),
            pros: prosArray,
            limitations: limitationsArray,
            bestFor: bestFor ? bestFor.trim() : '',
            tags: tagsArray,
            image,
            // Legacy fields for backward compatibility
            description: shortDescription.trim(),
            link: websiteLink.trim(),
            features: prosArray.length > 0 ? prosArray : featuresArray,
            seo: {
                meta_title: meta_title ? meta_title.trim() : '',
                meta_description: meta_description ? meta_description.trim() : '',
                focus_keyword: focus_keyword ? focus_keyword.trim() : '',
                slug: seo_slug ? seo_slug.trim() : '',
                canonical_url: canonical_url ? canonical_url.trim() : '',
                robots: robots || 'index, follow',
                og_title: og_title ? og_title.trim() : '',
                og_description: og_description ? og_description.trim() : '',
                og_image: og_image ? og_image.trim() : '',
                schema_markup: parsedSchemaMarkup,
                breadcrumb_title: breadcrumb_title ? breadcrumb_title.trim() : '',
                page_language: page_language || 'en',
                last_updated_date: last_updated_date ? new Date(last_updated_date) : new Date(),
            },
        });

        const createdProduct = await product.save();
        await createdProduct.populate('category', 'name slug');
        res.status(201).json(createdProduct);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Slug already exists. Please use a unique slug.' });
        } else if (error.name === 'CastError' && error.path === 'category') {
            res.status(400).json({ message: 'Invalid category ID. Please select a valid category.' });
        } else if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message).join(', ');
            res.status(400).json({ message: errors });
        } else {
            res.status(400).json({ message: error.message || 'Failed to create product' });
        }
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { 
        name,
        slug,
        shortDescription,
        fullDescription,
        category,
        useCase,
        pricingModel,
        websiteLink,
        pros,
        limitations,
        bestFor,
        tags,
        // Legacy fields
        description,
        link,
        features,
        // SEO fields
        meta_title,
        meta_description,
        focus_keyword,
        seo_slug,
        canonical_url,
        robots,
        og_title,
        og_description,
        og_image,
        schema_markup,
        breadcrumb_title,
        page_language,
        last_updated_date
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Update basic fields
        if (name !== undefined) product.name = name;
        if (slug !== undefined) product.slug = slug;
        if (shortDescription !== undefined) {
            product.shortDescription = shortDescription;
            product.description = shortDescription; // Update legacy field
        }
        if (fullDescription !== undefined) product.fullDescription = fullDescription;
        if (category !== undefined) product.category = category;
        if (useCase !== undefined) product.useCase = useCase;
        if (pricingModel !== undefined) product.pricingModel = pricingModel;
        if (websiteLink !== undefined) {
            product.websiteLink = websiteLink;
            product.link = websiteLink; // Update legacy field
        }
        if (bestFor !== undefined) product.bestFor = bestFor;
        
        // Update array fields
        if (pros !== undefined) {
            const prosArray = typeof pros === 'string' ? JSON.parse(pros) : pros;
            product.pros = prosArray;
            product.features = prosArray; // Update legacy field
        }
        if (limitations !== undefined) {
            product.limitations = typeof limitations === 'string' ? JSON.parse(limitations) : limitations;
        }
        if (tags !== undefined) {
            product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }
        
        // Legacy fields handling
        if (description !== undefined && !shortDescription) {
            product.description = description;
            product.shortDescription = description;
        }
        if (link !== undefined && !websiteLink) {
            product.link = link;
            product.websiteLink = link;
        }
        if (features !== undefined && !pros) {
            const featuresArray = typeof features === 'string' ? JSON.parse(features) : features;
            product.features = featuresArray;
            product.pros = featuresArray;
        }
        
        if (req.file) {
            product.image = req.file.path;
        }

        // Initialize SEO object if it doesn't exist
        if (!product.seo) {
            product.seo = {
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

        // Update SEO fields
        if (meta_title !== undefined) product.seo.meta_title = meta_title;
        if (meta_description !== undefined) product.seo.meta_description = meta_description;
        if (focus_keyword !== undefined) product.seo.focus_keyword = focus_keyword;
        if (seo_slug !== undefined) product.seo.slug = seo_slug;
        if (canonical_url !== undefined) product.seo.canonical_url = canonical_url;
        if (robots !== undefined) product.seo.robots = robots;
        if (og_title !== undefined) product.seo.og_title = og_title;
        if (og_description !== undefined) product.seo.og_description = og_description;
        if (og_image !== undefined) product.seo.og_image = og_image;
        if (breadcrumb_title !== undefined) product.seo.breadcrumb_title = breadcrumb_title;
        if (page_language !== undefined) product.seo.page_language = page_language;
        
        // Parse schema_markup if provided
        if (schema_markup !== undefined) {
            try {
                product.seo.schema_markup = typeof schema_markup === 'string' ? JSON.parse(schema_markup) : schema_markup;
            } catch (error) {
                // Keep existing schema_markup if parsing fails
            }
        }
        
        // Update last_updated_date
        if (last_updated_date !== undefined) {
            product.seo.last_updated_date = new Date(last_updated_date);
        } else {
            product.seo.last_updated_date = new Date();
        }

        try {
            const updatedProduct = await product.save();
            await updatedProduct.populate('category', 'name slug');
            res.json(updatedProduct);
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ message: 'Slug already exists. Please use a unique slug.' });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
