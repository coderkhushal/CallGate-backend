import { Request, Response } from "express"

const express= require('express')
const router = express.Router()

router.post("/", (req: Request, res: Response)=>{
    console.log(req.body)
    res.send("Received")
})

module.exports= router