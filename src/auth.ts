import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
    if (req.header('Authorization') === process.env.APPLICATION_SECRET) next();
    else res.sendStatus(401);
}