// requirements
const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const Plate  = require('../models/Plate');
const Well = require('../models/Well');

// size structs
const sizeList = [384, 96];
const sizeDict = [{rows: 24, cols:16}, {rows: 12, cols:8}];

//POST a new plate, checking size requirements and saving to DB
router.post('/', async (req, res) => {
    keys = Object.keys(req.body);
    const { name, size } = req.body
    if (keys.indexOf("size") != 1 && keys.indexOf("size") != 0) {
        return res.status(400).send("Make sure to include the size of the plate");
    }
    if (sizeList.indexOf(size) < 0) {
        return res.status(400).send("Plates can only be of size 96 or 384");
    }
    const plate = new Plate({
        name: name,
        size: size,
    });
    try {
        const savedPlate = await plate.save();
        res.json({id: savedPlate._id, name: savedPlate.name, size: savedPlate.size});
    } catch (err) {
        res.json({ message: err});
    }
});

//POST Well, checking well requirements, and adding it to the list of the plate's wells
router.post('/:plateID/wells', async (req, res) => {
    const { row, col, cell_line, chemical, concentration} = req.body
    const plateID = req.params.plateID;
    const cell_line_pattern = /^c[\d]+$/;
    const chemical_line_pattern = /^O[\d]+$/;
    
    keys = Object.keys(req.body);
    if (keys.indexOf("row") != 0) {
        return res.status(400).send("Make sure to include row of the well as the 1st key-value pair");
    }
    if (keys.indexOf("col") != 1) {
        return res.status(400).send("Make sure to include col of the well as the 2nd key-value pair");
    }
    
    if (cell_line !== undefined && cell_line !== "" && !cell_line_pattern.test(cell_line)) {
        return res.status(400).send("the cell line must start with c and be followed by numbers");
    }
    if (chemical !== undefined && chemical !== "" && !chemical_line_pattern.test(chemical)) {
        return res.status(400).send("the chemical must start with O and be followed by numbers");
    }
    if (concentration !== undefined && (chemical === undefined || chemical === "")) {
        return res.status(400).send("a concentration can only be entered if a chemical is also passed");
    }
    if (concentration < 0) {
        return res.status(400).send("concentration must be greater than 0");
    }
    try {
        const plateToChange = await Plate.findById(plateID);
        const sizeIndex = sizeList.indexOf(plateToChange.size)
        
        if (row < 1 || row > sizeDict[sizeIndex]["rows"]) {
            return res.status(400).send("the row value must be in bounds of the plate size");
        }
        if (col < 1 || col > sizeDict[sizeIndex]["cols"]) {
            return res.status(400).send("the column value must be in bounds of the plate size");
        }
        for (var i = 0; i < plateToChange.wells.length; i++){
            if ((plateToChange.wells[i].row == row) && (plateToChange.wells[i].col == col)) {
                return res.status(400).send("this well has already been used. please choose another one.");
            }
        }
        const well = new Well({
            row: row,
            col: col,
            cell_line: cell_line,
            chemical: chemical,
            concentration: concentration
        });
        plateToChange.wells.push(well);
        await Plate.findByIdAndUpdate(plateID, {$set: {wells: plateToChange.wells}});
        res.json(well);
    } catch (err) {
        res.status(404).send('The plate with the given ID was not found')
    }
});

//GET a specific post; return JSON
router.get('/:plateID', async (req, res) => {
    const plateID = req.params.plateID;
    const plate = await Plate.findById(plateID);
    if (plate === null){
        return res.status(404).send('The plate with the given ID was not found');
    }
    res.json(plate);
})
module.exports = router;