const mongoose = require('mongoose');
const marked = require('marked');
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true
    },
    blogSnippet: {
        type: String,
        required: true
    },
    blogDetails: {
        type: String, 
        requires: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

blogSchema.pre('validate', function (next) { 
  
    if (this.blogDetails) {
      this.sanitizedHtml = dompurify.sanitize(marked.parse(this.blogDetails))
    }
  
    next()
  })

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog; 