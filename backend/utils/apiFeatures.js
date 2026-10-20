class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        // http://localhost:5173/search/keyboard
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        // { 'price[gte]': '1', 'price[lte]': '1000', category: 'Keyboards' }
        const queryCopy = { ...this.queryStr };

        // Removing fields from the query
        const removeFields = ['keyword', 'page']
        removeFields.forEach(el => delete queryCopy[el]);

        let priceFilter = {};
        if (queryCopy['price[gte]'] || queryCopy['price[lte]']) {
            priceFilter.price = {};
            if (queryCopy['price[gte]']) {
                priceFilter.price.$gte = Number(queryCopy['price[gte]']);
            }
            if (queryCopy['price[lte]']) {
                priceFilter.price.$lte = Number(queryCopy['price[lte]']);
            }
            delete queryCopy['price[gte]'];
            delete queryCopy['price[lte]'];
        }

        if (queryCopy.category) {
            priceFilter.category = queryCopy.category
        }

        this.query = this.query.find(priceFilter);
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
