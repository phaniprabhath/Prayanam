const mongoose =require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
    },
    image:{
        // type:String,
        filename:String,
        url:String,
        // default:"https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-4Q9aOJF-64Q9aOJF-6vI",
        // set:(v)=>v===""?"https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-4Q9aOJF-64Q9aOJF-6vI"
        //     :v,
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