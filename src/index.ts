import express, { Request, Response } from 'express';

const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server Listening on ${port}`);
});