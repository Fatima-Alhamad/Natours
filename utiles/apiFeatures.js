class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObj = { ...this.queryString };
    // exclude fields
    const excludedFields = ['limit', 'page', 'fields', 'sort'];
    excludedFields.forEach((ele) => delete queryObj[ele]);

    // ADVANCED FILTERING:
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(lt|lte|gt|gte|ne)\b/g,
      (match) => `$${match}`
    );
    queryObj = JSON.parse(queryStr);
    this.query = this.query.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    //  else {
    //     this.query = this.query.sort('duration');
    // }
    return this;
  }
  limitFields() {
    // LIMITING FIELDS:
    if (this.queryString.fields) {
      let selectedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    // PAGINATION:
    let page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 100;
    let skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
