const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobTitle: String,
    jobSnipet: String,
    jobDetails: String,
    jobLink: String,
    jobApply: String
});

const Jobs = mongoose.model('Jobs', jobSchema);

module.exports = Jobs;