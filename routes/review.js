// restructuring reviews

const express=require("express");
const router=express.Router({mergeParams:true});
// these are requirements of reviews
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review =require("../models/review.js");
const {reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body); // schema.js
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


//POST Review Route
router.post("/",validateReview,wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send("new review saved");
}));

// Delete Review Route
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findById(reviewId);
    res.redirect(`/listings/${id}`);
}))

module.exports=router;