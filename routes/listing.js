// This is an Express Router for Restructuring Listings

const express=require("express");
const router=express.Router();
// these are requirements related to listing
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js");

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
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{path:"author"}
    })
    .populate("owner");
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
        newListing.owner=req.user._id;
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync( async (req,res)=>{
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
    isOwner,
    validatelisting,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});    // This is using JavaScript's spread syntax to expand the properties of req.body.listing into a new object.
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));
// Delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports=router;