// schema for well document
const mongoose = require('mongoose');

const WellsSchema = mongoose.Schema({ 
    row: {type: Number, required: true},
    col: {type: Number, required: true},
    cell_line: {type: String},
    chemical: {type: String},
    concentration: {type: Number},
}, { versionKey: false }
);
module.exports = mongoose.model('Well', WellsSchema);