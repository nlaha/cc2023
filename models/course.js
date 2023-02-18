const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Course = new Schema({
    courseTitle: {
        type: String,
        default: "",
        unique: true,
    },
    subjectCode: {
        type: String,
        default: "",
        unique: false,
    },
    instructor_id: {
        type: String,
        default: "",
        unique: false,
    },
    semester: {
        type: String,
        enum: ['fall','spring','summer'],
        unique: false,
    }
    // TODO: Students taking course - how will that be represented
});
const COURSE = mongoose.model("Course", Course, "courses");
module.exports = COURSE;