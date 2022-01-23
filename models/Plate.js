// schema for plate document
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const WellsSchema = require("./Well.js").schema;

const PlateSchema = mongoose.Schema({
    _id: Number,
    name: {type: String},
    size: {type: Number, required: true},
    wells: {type: [WellsSchema]},
}, { versionKey: false }
);
PlateSchema.plugin(AutoIncrement);


module.exports = mongoose.model('Plate', PlateSchema);