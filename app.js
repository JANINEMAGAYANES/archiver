var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Archiver = require("./models/archiver"),
    Transaction = require("./models/transaction"),
    Blacklist = require("./models/blacklist"),
    Duplicate = require("./models/duplicate"),
    User = require("./models/user"),
    Reward = require("./models/reward"),
    Whitelist = require("./models/whitelist"),
    Arweave = require('arweave/node'),
    passportMongooseAr = require('./middleware/passport-mongoose-ar')


const instance = Arweave.init({
    host: 'arweave.net',
    port: 443,
    logging: true,
    protocol: 'https'
});

console.log(instance)

//REQUIRE ROUTES
var transactionRoutes = require("./routes/transaction"),
    archiverRoutes = require("./routes/user"),
    indexRoutes = require("./routes/index"),
    userRoutes = require("./routes/user"),
    exportRoutes = require("./routes/export"),
    uploadRoutes = require("./routes/upload"),
    computationRoutes = require("./routes/computation")


mongoose.connect("mongodb://localhost/archiver");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "archiver123",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Use our custom strategy and serialize/de-serialize routines.
// We give the strategy a name 'ar-custom' and we should use that
// elsewhere with passport.
passport.use('ar-custom', passportMongooseAr.authenticateByWallet); 
passport.serializeUser(passportMongooseAr.serializeUser);
passport.deserializeUser(passportMongooseAr.deserializeUser);

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});

app.use("/", indexRoutes);
app.use("/archiver", archiverRoutes);
app.use("/transaction", transactionRoutes);
app.use("/profile", userRoutes);
app.use("/export", exportRoutes);
app.use("/upload", uploadRoutes);
app.use("/computation/admin/arweave", computationRoutes);


app.listen(3000, function () {
    console.log("Server Has Started!");
});

