const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    address: String,
    studentPhone: Number,
    parent: String,
    parentPhone: Number,
    batch: String,
    course: String,
    photo: String,
    photopath: String,

});
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;