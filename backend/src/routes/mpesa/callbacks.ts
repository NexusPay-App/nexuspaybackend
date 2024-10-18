import { Router, Request, Response, NextFunction } from "express"

const router = Router();

router.post(
    "/mpesa/callback/b2c",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body

            console.log("data ", data)
            console.log("result ", data.Result.ReferenceData)

            return res.status(200)

        } catch (error) {
            next(error)
        }
    }
)


router.post(
    "mpesa/callbacks/c2b",
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("res ", req.body)
    }
)

export { router as MpesaCallbackRouter }