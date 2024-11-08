// This is an Express Router for Restructuring Listings

const express=require("express");
const router=express.Router();
// these are requirements related to listing
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");


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
router.get("/",  wrapAsync(async (req,res)=>{ // wrapAsync helps to avoid try-catch everytime
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// New route
router.get("/new",async(req,res)=>{
    res.render("listings/new.ejs");
}); // Write 'New route' before the 'Show route'

//Show route
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

// Create Route
router.post(
    "/",
    validatelisting, // passing 'validatelisting' as a middleware
    wrapAsync(async (req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", wrapAsync( async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update route
router.put(
    "/:id",
    validatelisting,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // This is using JavaScript's spread syntax to expand the properties of req.body.listing into a new object.
    // The spread operator (...) takes all key-value pairs in req.body.listing and inserts them into the update query.
    res.redirect(`/listings/${id}`);
}));
// Delete route
router.delete("/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports=router;