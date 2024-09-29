const mongoose =require("mongoose");
const Schema=mongoose.Schema;

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
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;