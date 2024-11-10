const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js");

const listingController=require("../controllers/listings.js");

// Index route
router.get("/",
    wrapAsync(listingController.index)
);

// New route
router.get("/new",
    isLoggedIn,
    listingController.renderNewForm
); // Write 'New route' before the 'Show route'

//Show route
router.get("/:id",
    wrapAsync(listingController.showListing)
);

// Create Route
router.post(
    "/",
    isLoggedIn,
    validatelisting, 
    wrapAsync(listingController.createListing)
);

// Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

//Update route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    validatelisting,
    wrapAsync(listingController.updateListing)
);
// Delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);

module.exports=router;