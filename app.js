if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}




const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const { redirect, cookie } = require("express/lib/response.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
 
// const Listing = require("./models/listing.js");
// const wrapAsync = require("./utils/wrapAsync.js");
// const {listingSchema , reviewSchema} = require("./schema.js");
// const Review = require("./models/review.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/SymphXplore";

const dbUrl = process.env.ATLASDB_URI;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("Mongo Session Store Error", err);
});

const sessionOptions = {
    store,  
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie :{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


// app.get("/", (req, res) => {
//     res.send("Hello Simon");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demoUser", async(req, res) => {
// let fakeUser = new User({
//     email:"student@gmail.com",
//     username: "student",
// });
// let newUser = await User.register(fakeUser, "helloworld");
// res.send(newUser);

// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});


//Default Error Handling
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});


app.listen(8000, () => {
    console.log("server is running on port 8000");
});