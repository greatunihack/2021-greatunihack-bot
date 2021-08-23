import { Client, Intents } from 'discord.js';

export default async function Bot() {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

    client.on('ready', () => {
        console.log('Discord Bot Online');
    });

    await client.login(process.env.DISCORD_BOT_TOKEN);

    return client;
};
