import Category from '../models/Category.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch active categories only
// @route   GET /api/categories/active
// @access  Public
const getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name, slug, description, isActive } = req.body;
    const icon = req.file ? req.file.path : '';

    // Validate required fields
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        // Generate slug from name if not provided
        let categorySlug = slug;
        if (!categorySlug || categorySlug.trim() === '') {
            categorySlug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        } else {
            categorySlug = categorySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // Ensure slug is not empty after processing
        if (!categorySlug || categorySlug === '') {
            return res.status(400).json({ message: 'Unable to generate valid slug from category name' });
        }

        const category = new Category({
            name: name.trim(),
            slug: categorySlug,
            description: description ? description.trim() : '',
            icon: icon,
            isActive: isActive !== undefined ? isActive : true,
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        if (error.code === 11000) {
            const field = error.keyPattern?.name ? 'name' : 'slug';
            res.status(400).json({ message: `Category ${field} already exists` });
        } else if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message).join(', ');
            res.status(400).json({ message: errors });
        } else {
            res.status(400).json({ message: error.message || 'Failed to create category' });
        }
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name, slug, description, isActive } = req.body;
    const icon = req.file ? req.file.path : undefined;

    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Update fields if provided
        if (name !== undefined) {
            if (!name || name.trim() === '') {
                return res.status(400).json({ message: 'Category name cannot be empty' });
            }
            category.name = name.trim();
        }

        if (slug !== undefined) {
            if (slug && slug.trim() !== '') {
                category.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            } else if (name !== undefined) {
                // Regenerate slug from name if slug is empty but name is provided
                category.slug = category.name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
        }

        if (description !== undefined) {
            category.description = description ? description.trim() : '';
        }

        if (icon !== undefined) {
            category.icon = icon;
        }

        if (isActive !== undefined) {
            category.isActive = isActive;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        if (error.code === 11000) {
            const field = error.keyPattern?.name ? 'name' : 'slug';
            res.status(400).json({ message: `Category ${field} already exists` });
        } else if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message).join(', ');
            res.status(400).json({ message: errors });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update category' });
        }
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
