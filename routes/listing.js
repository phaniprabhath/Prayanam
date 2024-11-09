// This is an Express Router for Restructuring Listings

const express=require("express");
const router=express.Router();
// these are requirements related to listing
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema}=require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

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
router.get("/new",isLoggedIn,(req,res)=>{ // adding middleware 'isLoggedIn'
    res.render("listings/new.ejs");
}); // Write 'New route' before the 'Show route'

//Show route
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

// Create Route
router.post(
    "/",
    isLoggedIn,
    validatelisting, // passing 'validatelisting' as a middleware
    wrapAsync(async (req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", isLoggedIn,wrapAsync( async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//Update route
router.put(
    "/:id",
    isLoggedIn,
    validatelisting,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // This is using JavaScript's spread syntax to expand the properties of req.body.listing into a new object.
    // The spread operator (...) takes all key-value pairs in req.body.listing and inserts them into the update query.
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));
// Delete route
router.delete("/:id", isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports=router;