class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const q = this.queryStr.q ? {
      $or: [
        {
          title: { $regex: this.queryStr.q, $options: 'i' }
        },
        {
          brief: { $regex: this.queryStr.q, $options: 'i' }
        },
        {
          tags: { $regex: this.queryStr.q, $options: 'i' }
        }
      ]
    } : {};
    this.query = this.query.find({ ...q }).populate('author').sort({ createdAt: -1 });
    return this
  }

  filter() {
    const queryCopy = { ...this.queryStr }
    const del_keys = ['q', 'page', 'pageSize', 'cat'];
    del_keys.map(key => delete queryCopy[key]);

    const cat = this.queryStr.cat ? {
      cat: { $regex: this.queryStr.cat, $options: 'i' }
    } : {}

    this.query = this.query.find({ ...queryCopy, ...cat });
    return this
  }

  pagination(pageSize) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = pageSize * (currentPage - 1);
    this.query = this.query.limit(pageSize).skip(skip);
    return this;
  }

}

module.exports = ApiFeatures;