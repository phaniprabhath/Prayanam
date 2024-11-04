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
const {listingSchema}=require("./schema.js");
const Review =require("./models/review.js");

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

const validatelisting=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body); // schema.js
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

// Index route
app.get("/listings",  wrapAsync(async (req,res)=>{ // wrapAsync helps to avoid try-catch everytime
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// New route
app.get("/listings/new",async(req,res)=>{
    res.render("listings/new.ejs");
}); // Write 'New route' before the 'Show route'

//Show route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));
// Create Route
app.post(
    "/listings",
    validatelisting, // passing 'validatelisting' as a middleware
    wrapAsync(async (req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync( async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update route
app.put(
    "/listings/:id",
    validatelisting,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // This is using JavaScript's spread syntax to expand the properties of req.body.listing into a new object.
    // The spread operator (...) takes all key-value pairs in req.body.listing and inserts them into the update query.
    res.redirect(`/listings/${id}`);
}));
// Delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Reviews
//POST Route
app.post("/listings/:id/reviews",async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send("new review saved");
})

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