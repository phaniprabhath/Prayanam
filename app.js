const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path = require("path");  // its necessary for ejs
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// ejs-mate helps in creating templates or layouts. It's a 'npm' package.
const wrapAsync=require("./utils/wrapAsync.js");
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

// Index route
app.get("/listings", async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

// New route
app.get("/listings/new",async(req,res)=>{
    res.render("listings/new.ejs");
}); // Write 'New route' before the 'Show route'

//Show route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});
// Create Route
app.post(
    "/listings",
    wrapAsync(async (req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//Update route
app.put("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    // This is using JavaScript's spread syntax to expand the properties of req.body.listing into a new object.
    // The spread operator (...) takes all key-value pairs in req.body.listing and inserts them into the update query.
    res.redirect(`/listings/${id}`);
});
// Delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// Middleware
app.use((err,req,res,next)=>{
    res.send("something went wrong!");
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});