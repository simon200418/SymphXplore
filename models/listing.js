const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { type } = require("express/lib/response.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String,

        // default: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

        // set: (v) => {
        //     if (typeof v === "object" && v.url) {
        //         return v.url; // Extract `url` if an object is passed
        //     }
            
        // },
    },
    price: Number,
    location: String,
    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        },
      },
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;