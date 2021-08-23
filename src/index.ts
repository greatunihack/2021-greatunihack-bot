import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv'

import Bot from './bot';

dotenv.config();

const app = express();
const port = 8080;

const client = Bot();
app.set('client', client);

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server Listening on ${port}`);
});