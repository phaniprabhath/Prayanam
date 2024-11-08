const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require("path");  // its necessary for ejs
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// ejs-mate helps in creating templates or layouts. It's a 'npm' package.
const ExpressError = require("./utils/ExpressError.js");

const listings= require("./routes/listing.js");
const reviews=require("./routes/review.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate); // for ejs-mate
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{                   
    res.send("Hi, I am root");
});

// These two lines are for using Router object
app.use("/listings",listings); 
app.use("/listings/:id/reviews",reviews);

// The below code is for throwing the error if the user searches none of the above routes.
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"));
});

// Middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err; //default statuscode & message are written which will be useful if err doesn't contain them.
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});