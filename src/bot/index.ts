import { CategoryChannel, Client, Intents } from 'discord.js';

export default class Bot {
    client: Client;

    async login() {
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

        client.on('ready', () => {
            console.log('Discord Bot Online');
        });

        await client.login(process.env.DISCORD_BOT_TOKEN);

        this.client = client;
    }

    async setup(server: string) {
        const guilds = await this.client.guilds.fetch();
        const guildManager = guilds.find(guild => guild.id == server);
        
        if (!guildManager) return [404, null];
        
        const guild = await guildManager.fetch();
        const roles = await guild.roles.fetch();
        const channels = await guild.channels.fetch();
        
        roles.each(async (role) => {
            if (!role.managed && role.name != '@everyone') await role.delete();
        });
        channels.each(async (channel) => {
            await channel.delete();
        });

        const everyoneRole = guild.roles.everyone;
        const staffRole = await guild.roles.create({ name: "Staff", color: '#01ACFF', hoist: true, permissions: ["ADMINISTRATOR"], mentionable: false });
        const sponsorRole = await guild.roles.create({ name: "Sponsor", color: '#EB403B', hoist: true, mentionable: false });
        const judgeRole = await guild.roles.create({ name: "Judge", color: '#32C744', hoist: true, mentionable: false });
        const mentorRole = await guild.roles.create({ name: "Mentor", color: '#765CB1', hoist: true, mentionable: false });

        const announcementsCategory = await guild.channels.create("Group Channels", { type: "GUILD_CATEGORY" });
        const welcomeChannel = await guild.channels.create("welcome", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        const announcementsChannel = await guild.channels.create("announcements", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        const sponsorsAnnouncementsChannel = await guild.channels.create("sponsors", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: sponsorRole, allow: ['SEND_MESSAGES', 'EMBED_LINKS'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        const helpChannel = await guild.channels.create("help", { parent: announcementsCategory, permissionOverwrites: [{ id: everyoneRole, deny: ['EMBED_LINKS'] }] });

        const staffCategory = await guild.channels.create("Staff Channels", { type: "GUILD_CATEGORY" });
        const staffChannel = await guild.channels.create("staff", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        const sponsorsChannel = await guild.channels.create("sponsors", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: sponsorRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        const judgesChannel = await guild.channels.create("judges", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: judgeRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        const mentorsChannel = await guild.channels.create("mentors", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: mentorRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });

        const teamCategory = await guild.channels.create("Team Channels", { type: "GUILD_CATEGORY" });

        everyoneRole.permissions.remove(['CREATE_INSTANT_INVITE', 'MENTION_EVERYONE']);

        return [200, null];
    }

    async newTeam(server: string, options: { name: string }) {
        const guilds = await this.client.guilds.fetch();
        const guildManager = guilds.find(guild => guild.id == server);
        
        if (!guildManager) return [404, null];
        
        const guild = await guildManager.fetch();
        const roles = await guild.roles.fetch();
        const channels = await guild.channels.fetch();

        const teamCategory = channels.find(channel => channel.name == "Team Channels" && channel.type == "GUILD_CATEGORY");

        if (!teamCategory) return [404, null];

        const everyoneRole = guild.roles.everyone;
        const staffRole = roles.find(role => role.name == 'Staff');
        const mentorRole = roles.find(role => role.name == 'Mentor');
        const teamRole = await guild.roles.create({ name: options.name, mentionable: false });
        const teamChannel = await guild.channels.create(options.name, { parent: teamCategory as CategoryChannel, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: mentorRole, allow: ['VIEW_CHANNEL'] }, { id: teamRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
    
        return [200, teamRole.id];
    }

    async setTeam(server: string, team: string, participant: string) {
        const guilds = await this.client.guilds.fetch();
        const guildManager = guilds.find(guild => guild.id == server);
        
        if (!guildManager) return [404, null];
        
        const guild = await guildManager.fetch();
        const roles = await guild.roles.fetch();
        const users = await guild.members.fetch();

        const user = users.find(user => user.id == participant);
        const role = roles.find(role => role.id == team);

        if (!user || !role) return [404, null];

        await user.roles.set([role]);

        return [200, null];
    }
}