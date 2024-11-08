const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path = require("path");  // its necessary for ejs
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// ejs-mate helps in creating templates or layouts. It's a 'npm' package.
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const {listingSchema,reviewSchema}=require("./schema.js");
const Review =require("./models/review.js");

const listings= require("./routes/listing.js");

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


const validateReview=(req,res,next)=>{
    console.log(req.body); // Add this line
    let {error}=reviewSchema.validate(req.body); // schema.js
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

app.use("/listings",listings); // routes/listing.js

//Reviews
//POST Review Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send("new review saved");
}));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findById(reviewId);
    res.redirect(`/listings/${id}`);
}))

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