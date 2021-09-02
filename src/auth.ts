import { Request, Response, NextFunction } from 'express';

export default function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (req.header('Authorization') === process.env.APPLICATION_SECRET) next();
    else res.sendStatus(401);
}