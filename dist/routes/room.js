"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uid_1 = require("uid");
const express = require("express");
const router = express.Router();
// const Room = require("../service/room")
router.get("/newroom", (req, res) => {
    // write a function using uuid that generate a string of 9 random alphabets
    // send this code as response
    // TODO: create a in socket and join the user in that room 
    res.send((0, uid_1.uid)(9));
});
module.exports = router;
