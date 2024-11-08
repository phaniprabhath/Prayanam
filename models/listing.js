const mongoose =require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    image:{
        // type:String,
        // filename:String,
        url:{
            type:String,
            default:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            set:function(v){
                return v===""
                ?"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
                :v;
            }
        }
    
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});

// A Mongoose Middleware used to delete reviews of a listing,if the listing gets deleted
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;