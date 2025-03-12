const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/SymphXplore";
async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log(err);
});

const initDB = async ()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"67b7870c5466f34fd48abf77"}));
    await Listing.insertMany(initdata.data);
    console.log("Data was Initialized..");    
};

initDB();