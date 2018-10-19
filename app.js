require('dotenv').config();

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

//requiring routes
var commentRoutes       = require("./routes/comments"),
    reviewRoutes        = require("./routes/reviews"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes          = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
var connectOptions = { useNewUrlParser: true };
mongoose.connect(url, connectOptions);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
//seedDB(); //seed the database

// clear db with db.collection.drop()

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "vae victus",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware, function is called on every route
//pass req.user to every template
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//express router, shorthand for routes
app.use("/", indexRoutes); // not necessary, added for completeness
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server started");
});