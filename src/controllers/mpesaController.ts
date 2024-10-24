import { Request, Response } from "express";

export const mpesaDeposit = async(req:Request, res:Response)=>{
    return res.json({message: "in mpesa deposit!!"})
}