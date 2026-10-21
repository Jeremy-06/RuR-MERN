const hasValue = (value) => value !== undefined && value !== ''

class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // ?category=Mice&category=Headsets or ?category=Mice,Headsets
    static categoryList(queryStr) {
        return [].concat(queryStr.category || [])
            .flatMap(value => String(value).split(','))
            .map(value => value.trim())
            .filter(Boolean)
    }

    // Checks the shop list params; returns the first error message or null
    static validateShopQuery(queryStr, categories) {
        const { minPrice, maxPrice, page, limit } = queryStr

        for (const [name, value] of Object.entries({ minPrice, maxPrice })) {
            if (!hasValue(value)) continue
            if (Array.isArray(value) || !Number.isFinite(Number(value)) || Number(value) < 0) {
                return `${name} must be a non-negative number`
            }
        }
        if (hasValue(minPrice) && hasValue(maxPrice) && Number(minPrice) > Number(maxPrice)) {
            return 'minPrice cannot be greater than maxPrice'
        }

        if (hasValue(page) && (Array.isArray(page) || !Number.isInteger(Number(page)) || Number(page) < 1)) {
            return 'page must be a whole number of 1 or more'
        }
        if (hasValue(limit) && (Array.isArray(limit) || !Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 50)) {
            return 'limit must be a whole number from 1 to 50'
        }

        const invalidCategory = APIFeatures.categoryList(queryStr).find(category => !categories.includes(category))
        if (invalidCategory) {
            return `Invalid category: ${invalidCategory}`
        }
        return null
    }

    search() {
        // http://localhost:5173/search/keyboard
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: String(this.queryStr.keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        // { minPrice: '10', maxPrice: '200', category: ['Mice', 'Headsets'] }
        // Each filter adds its own conditions, so more filters (e.g. ratings) plug in here
        const conditions = {
            ...this.priceFilter(),
            ...this.categoryFilter(),
        }

        this.query = this.query.find(conditions);
        return this;
    }

    priceFilter() {
        const { minPrice, maxPrice } = this.queryStr
        if (!hasValue(minPrice) && !hasValue(maxPrice)) return {}

        const price = {}
        if (hasValue(minPrice)) {
            price.$gte = Number(minPrice);
        }
        if (hasValue(maxPrice)) {
            price.$lte = Number(maxPrice);
        }
        return { price }
    }

    categoryFilter() {
        const categories = APIFeatures.categoryList(this.queryStr)
        return categories.length > 0 ? { category: { $in: categories } } : {}
    }

    sort() {
        // Newest first; _id keeps the order stable between pages
        this.query = this.query.sort({ createdAt: -1, _id: -1 });
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }

    // DataTables server-side params stay flat like price[gte]:
    // { 'search[value]': 'mouse', 'order[0][column]': '2', 'order[0][dir]': 'asc', 'columns[2][data]': 'name', start: '0', length: '10' }
    dataTableSearch(fields) {
        const value = this.queryStr['search[value]'] ? String(this.queryStr['search[value]']).trim() : ''

        if (value) {
            const regex = {
                $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i'
            }
            this.query = this.query.find({ $or: fields.map(field => ({ [field]: regex })) });
        }
        return this;
    }

    dataTableSort(sortableFields) {
        // The column index points at columns[i][data], which is the field name
        const column = this.queryStr['order[0][column]']
        const field = this.queryStr[`columns[${column}][data]`]
        const direction = this.queryStr['order[0][dir]'] === 'desc' ? -1 : 1

        // Only allow known fields; newest first otherwise
        if (sortableFields.includes(field)) {
            this.query = this.query.sort({ [field]: direction, _id: 1 });
        } else {
            this.query = this.query.sort({ createdAt: -1, _id: 1 });
        }
        return this;
    }

    dataTablePagination(maxLength = 100) {
        const start = Math.max(Number(this.queryStr.start) || 0, 0);
        const length = Number(this.queryStr.length);

        // length -1 means "All" in DataTables; no length means a plain list request
        if (length > 0) {
            this.query = this.query.skip(start).limit(Math.min(length, maxLength));
        }
        return this;
    }
}
module.exports = APIFeatures
