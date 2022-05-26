const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const querySchema = new Schema({
    queryName: String,
    queryEmail: String,
    queryPhone: String,
    queryText: String,
    queryDate:{
        type: Date,
        default: Date.now()
    }
});

const query = mongoose.model('query', querySchema);
module.exports = query;