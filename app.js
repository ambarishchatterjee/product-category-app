const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./app/config/db');

dotenv.config({ quiet: true });
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE in forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public')); // just in case

// Session setup
app.use(session({
  secret: 'adminsecret123',
  resave: false,
  saveUninitialized: true,
}));

// Flash message middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Custom Routes
const adminRoutes = require('./app/routes/adminRoutes');
const productRoutes = require('./app/routes/productRoutes');
//const employeeRoutes = require('./app/routes/employeeRoutes'); // ✅ New route

app.use('/admin', adminRoutes);       // Admin Panel
app.use('/', productRoutes);          // Customer Portal
//app.use('/api', employeeRoutes);      // ✅ Employee API route (POST /api/employee)

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


function transformToObjects(numberArray) {
    let newArr = []
    numberArray.map((number)=> newArr.push({val:number}))
    return newArr
}

transformToObjects([1,2,3])