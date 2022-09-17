const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const methodOverride = require('method-override');
const multer = require('multer');
const bodyParser = require('body-parser');
const PORT = 8020;


//Mongoose
const db = require('./config/keys').MongoURI;

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('DB Connected'))
    .catch(err => console.log(err));

const Student = require('./models/student');
const Blog = require('./models/blog');
const Jobs = require('./models/job');


//EXPRESS
app.use(express.json());
app.use('/static', express.static('static'));//For serving static files
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: false}));

//Set static folder
// app.use(express.static(path.join(__dirname,'public')));

//EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//MULTER RELATED
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/upload');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage });

const pathh = path.resolve(__dirname, 'public');
app.use(express.static(pathh));

//Admin details
const admins = [{
    nameadmin: "Ranacharya",
    emailadmin: "ranacharyaborah@gmail.com",
    passwordadmin: "rana@123"
}];

//Routes

app.use('/api/auth', require('./routes/auth'));
app.get('/', (req, res) => {
    Blog.find({}, function(err, blog){
        if(err){
            console.log(err);
        }else{
            res.render('index.ejs', {blog: blog})
        }
    })
})

app.post('/login', (req, res) => {
    const admin = admins.find(admin => admin.emailadmin === req.body.email)
    if (req.body.password === admin.passwordadmin) {
        res.redirect('/admin.ejs')
    } else {
        res.send('Not Allowed')
    }
})

app.delete('/logout', (req, res) => {
    res.redirect('/')
})

app.get('/admin.ejs', (req, res) => {
    res.render('admin.ejs')
})

//Blog
app.post('/blog-update', (req, res) => {
    const { blogTitle, blogSnippet, blogDetails } = req.body;
    const newBlog = new Blog({
        blogTitle,
        blogSnippet,
        blogDetails
    })
    newBlog.save((err, blog) => {
        if (err) {
            console.log(err)
        }
        res.redirect('/admin.ejs')
    })
})

app.get('/Blog.ejs', (req, res) => {
    Blog.find({}, function(err, blog){
        if(err){
            console.log(err);
        }else{
            res.render('blog.ejs', {blog: blog})
        }
    })
})

app.get('/blogs/:id', (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
    .then(result => {
        res.render('details.ejs', { blog: result, title: 'Blog Details' })
    })
    .catch(err => {
        console.log(err);
    })
})

app.get('/job.ejs', (req, res) => {
    Jobs.find({}, function(err, details){
        if(err){
            console.log(err);
        }else{
            res.render('job.ejs', {details: details})
        }
    })
})

app.get('/record.ejs', (req, res) => {
    Student.find({}, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.render('record.ejs', {data: data})
        }
    })
})

app.get('/deleterecord/:id', (req, res) => {
    Student.deleteOne({_id: req.params.id }, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.redirect('/record.ejs');
        }
    })
})

app.post('/job-update', (req, res) => {
    const { jobTitle, jobSnipet, jobDetails, jobLink, jobApply } = req.body;
    const newJob = new Jobs({
        jobTitle,
        jobSnipet,
        jobDetails,
        jobLink,
        jobApply
    })
    newJob.save((err, details) => {
        if (err) {
            console.log(err)
        }
        res.redirect('/admin.ejs')
    })
})

app.post('/register', upload.single('photo'), (req, res) => {
    const { name, studentPhone, address, parent, parentPhone, course, batch} = req.body;
    const photo = req.file.originalname;
    const photopath = 'upload/' + req.file.originalname;
    const newStudent = new Student({
        name,
        address,
        studentPhone,
        parent,
        parentPhone,
        course,
        batch,
        photo,
        photopath
    });
    newStudent.save((err, data) => {
        if (err) {
            console.log(err)
        }
        res.send('Registered successfully')
    })
    console.log(Student)
})

app.get('/dashboard.ejs', (req, res) => {
    Promise.all([Blog.find({}), Jobs.find({})])
    .then(result => {
        const [blog, details] = result;
        res.render('dashboard.ejs', {blog: blog, details: details});
    })
    .catch(err => {
        console.log(err);
    })
})

app.get('/deleteblog/:id', (req, res) => {
    Blog.deleteOne({_id: req.params.id }, function(err, blog){
        if(err){
            console.log(err);
        }else{
            res.redirect('/dashboard.ejs');
        }
    })
})

app.get('/deletejob/:id', (req, res) => {
    Jobs.deleteOne({_id: req.params.id }, function(err, details){
        if(err){
            console.log(err);
        }else{
            res.redirect('/dashboard.ejs');
        }
    })
})

//Query
const query = require('./models/message');

app.post('/query', (req, res) =>{
    const newquery = new query({
        queryName: req.body.name,
        queryEmail: req.body.email,
        queryPhone: req.body.phone,
        queryText: req.body.message
    })
    newquery.save((err, data) => {
        if(err){
            console.log(err)
        }
        res.redirect('/')
    })
    console.log(newquery)
})

app.get('/message.ejs', (req, res) => {
    query.find({}, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.render('message.ejs', {data: data})
        }
    })
})

app.get('/deletequery/:id', (req, res) => {
    query.deleteOne({_id: req.params.id }, function(err, data){
        if(err){
            console.log(err);
        }else{
            res.redirect('/message.ejs');
        }
    })
})


app.listen(3000, () => console.log(`Server started on 3000`));

