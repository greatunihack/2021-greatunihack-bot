import express, { Express, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv'

import checkAuth from './auth';

import Bot, { HTTPResponse } from './bot';

dotenv.config();

const app: Express = express();
const port: number = 8080;

const client: Bot = new Bot();
client.login();
app.set('client', client);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

/**
 * 
 * @api {get} / Check Web Server Status
 * @apiName Test
 * @apiDescription Returns a 200 Code when the Web Server is Running
 * @apiGroup Developer
 * @apiVersion  0.1.0
 * 
 * @apiSuccess (Successes) 200 Web Server is OK
 * 
 */
app.get('/', (req: Request, res: Response): void => {
    res.sendStatus(200);
});

/**
 * 
 * @api {post} /prepare/:server Prepare Server
 * @apiName PrepareServer
 * @apiDescription Prepares a server for a Hackathon event. All existing channels and roles are deleted and new ones implemented. You should do this on a new server.
 * @apiGroup Server
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Server to Prepare
 * 
 * @apiSuccess (Successes) 200 Server was Successfully Prepared
 * @apiError (Failures) 401 Application Secret Not Given or Invalid
 * @apiError (Failures) 404 Bot is Not in Server Given
 * 
 */
app.post('/prepare/:server', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.setup(req.params.server);
    res.status(resp.code).send(resp.message);
});

/**
 * 
 * @api {post} /team/:server Create Team
 * @apiName CreateTeam
 * @apiDescription Creates a new team in the Discord server - automatically creating a team role with a text and voice channel pre-assigned.
 * @apiGroup Teams
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Prepared Hackathon Server
 * 
 * @apiParam (Body Attributes) {String} name Name of New Team
 * 
 * @apiSuccess (Successes) 200 Team Added Successfully
 * @apiError (Failures) 401 Application Secret Not Given or Invalid
 * @apiError (Failures) 404 Bot is Not in Server Given
 * 
 */
app.post('/team/:server', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.newTeam(req.params.server, req.body);
    res.status(resp.code).send(resp.message);
});

/**
 * 
 * @api {delete} /team/:server/:team Delete Team
 * @apiName DeleteTeam
 * @apiDescription Deletes an existing team in the Discord server - automatically removing its role, text channel and voice channel. Only allowed when no participants are assigned to it.
 * @apiGroup Teams
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Prepared Hackathon Server
 * @apiParam (URL Parameters) {String} team ID of Existing Team
 * 
 * @apiSuccess (Successes) 200 Team Removed Successfully
 * @apiError (Failures) 400 Participant is Still Assigned to Team
 * @apiError (Failures) 401 Application Secret Not Given or Invalid
 * @apiError (Failures) 404 Bot is Not in Server Given or No Team Found with Given ID
 * 
 */
app.delete('/team/:server/:team', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.deleteTeam(req.params.server, req.params.team);
    res.status(resp.code).send(resp.message);
});

/**
 * 
 * @api {put} /participant/:server/:participant/:team Assign Participant to Team
 * @apiName AssignParticipant
 * @apiDescription Assigns a participant to an existing team - automatically granting access to their team's text and voice channels. If the participant is already assigned to a team, they will lose access to their old team.
 * @apiGroup Participants
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Prepared Hackathon Server
 * @apiParam (URL Parameters) {String} participant ID of Participant's Discord Account
 * @apiParam (URL Parameters) {String} team ID of Existing Team
 * 
 * @apiSuccess (Successes) 200 Participant Assigned Successfully
 * @apiError (Failures) 401 Application Secret Not Given or Invalid
 * @apiError (Failures) 404 Bot is Not in Server Given, No Team Found with Given ID or No Participant Found with Given ID
 * 
 */
app.put('/participant/:server/:participant/:team', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.assignParticipant(req.params.server, req.params.team, req.params.participant);
    res.status(resp.code).send(resp.message);
});

/**
 * 
 * @api {get} /participant/:server/:participant Check Participant is in Server
 * @apiName CheckParticipant
 * @apiDescription Check if a participant is in the Hackathon Discord Server.
 * @apiGroup Participants
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Prepared Hackathon Server
 * @apiParam (URL Parameters) {String} participant ID of Participant's Discord Account
 * 
 * @apiSuccess (Successes) 200 Participant in Server
 * @apiError (Failures) 404 Bot is Not in Server Given or Participant Not in Server
 * 
 */
app.get('/participant/:server/:participant', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.checkParticipant(req.params.server, req.params.participant);
    res.status(resp.code).send(resp.message);
});

/**
 * 
 * @api {delete} /participant/:server/:participant Unassign Participant from All Teams
 * @apiName UnassignParticipant
 * @apiDescription Unassign a participant from all teams - automatically removing access to all teams' text and voice channels.
 * @apiGroup Participants
 * @apiVersion  0.1.0
 * 
 * @apiHeader (Headers) {String} Authorization Application Secret String
 * 
 * @apiParam (URL Parameters) {String} server ID of Prepared Hackathon Server
 * @apiParam (URL Parameters) {String} participant ID of Participant's Discord Account
 * 
 * @apiSuccess (Successes) 200 Participant Unassigned Successfully
 * @apiError (Failures) 401 Application Secret Not Given or Invalid
 * @apiError (Failures) 404 Bot is Not in Server Given or No Participant Found with Given ID
 * 
 */
app.delete('/participant/:server/:participant', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const resp: HTTPResponse = await client.unassignParticipant(req.params.server, req.params.participant);
    res.status(resp.code).send(resp.message);
});

app.listen(port, (): void => {
    console.log(`Server Listening on ${port}`);
});
