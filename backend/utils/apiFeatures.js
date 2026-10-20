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
}
module.exports = APIFeatures
