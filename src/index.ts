import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv'

import Bot from './bot';

dotenv.config();

const app = express();
const port = 8080;

const client = new Bot();
client.login();
app.set('client', client);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.post('/setup/:server', async (req: Request, res: Response) => {
    const resp = await client.setup(req.params.server);
    res.send(resp[0]);
});

app.post('/team/:server', async (req: Request, res: Response) => {
    const resp = await client.newTeam(req.params.server, req.body);
    res.send(resp[0]);
});

app.delete('/team/:server/:team', async (req: Request, res: Response) => {
    const resp = await client.deleteTeam(req.params.server, req.params.team);
    res.send(resp[0]);
});

app.post('/participant/:server/:team/:participant', async (req: Request, res: Response) => {
    const resp = await client.setTeam(req.params.server, req.params.team, req.params.participant);
    res.send(resp[0]);
});

app.listen(port, () => {
    console.log(`Server Listening on ${port}`);
});