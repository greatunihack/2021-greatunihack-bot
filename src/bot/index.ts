import { CategoryChannel, Channel, Client, Collection, Guild, GuildMember, Intents, NewsChannel, OAuth2Guild, Role, StageChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

type AnyChannel = TextChannel | NewsChannel | CategoryChannel | VoiceChannel | StageChannel | StoreChannel;

export class HTTPResponse {
    code: number;
    message: string | null;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }
}

export default class Bot {
    client: Client;

    async login() {
        const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

        client.on('ready', (): void => {
            console.log('Discord Bot Online');
        });

        await client.login(process.env.DISCORD_BOT_TOKEN);

        this.client = client;
    }

    async setup(server: string): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const roles: Collection<string, Role> = await guild.roles.fetch();
        const channels: Collection<string, Channel> = await guild.channels.fetch();
        
        roles.each(async (role: Role) => {
            if (!role.managed && role.name != '@everyone') await role.delete();
        });
        channels.each(async (channel: Channel) => {
            await channel.delete();
        });

        const everyoneRole: Role = guild.roles.everyone;
        const staffRole: Role = await guild.roles.create({ name: "Staff", color: '#01ACFF', hoist: true, permissions: ["ADMINISTRATOR"], mentionable: false });
        const sponsorRole: Role = await guild.roles.create({ name: "Sponsor", color: '#EB403B', hoist: true, mentionable: false });
        const judgeRole: Role = await guild.roles.create({ name: "Judge", color: '#32C744', hoist: true, mentionable: false });
        const mentorRole: Role = await guild.roles.create({ name: "Mentor", color: '#765CB1', hoist: true, mentionable: false });

        const announcementsCategory: CategoryChannel = await guild.channels.create("Group Channels", { type: "GUILD_CATEGORY" });
        const staffCategory: CategoryChannel = await guild.channels.create("Staff Channels", { type: "GUILD_CATEGORY" });
        
        await guild.channels.create("welcome", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        await guild.channels.create("announcements", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        await guild.channels.create("sponsors", { parent: announcementsCategory, permissionOverwrites: [{ id: staffRole, allow: ['SEND_MESSAGES'] }, { id: sponsorRole, allow: ['SEND_MESSAGES', 'EMBED_LINKS'] }, { id: everyoneRole, deny: ['SEND_MESSAGES', 'EMBED_LINKS'] }] });
        await guild.channels.create("general", { parent: announcementsCategory, permissionOverwrites: [{ id: everyoneRole, deny: ['EMBED_LINKS'] }] });
        await guild.channels.create("help", { parent: announcementsCategory, permissionOverwrites: [{ id: everyoneRole, deny: ['EMBED_LINKS'] }] });

        await guild.channels.create("staff", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        await guild.channels.create("sponsors", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: sponsorRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        await guild.channels.create("judges", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: judgeRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        await guild.channels.create("mentors", { parent: staffCategory, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: mentorRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        
        await guild.channels.create("Team Channels", { type: "GUILD_CATEGORY" });
        
        everyoneRole.permissions.remove(['CREATE_INSTANT_INVITE', 'MENTION_EVERYONE']);

        return new HTTPResponse(200, null);
    }

    async newTeam(server: string, options: { name: string }): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const roles: Collection<string, Role> = await guild.roles.fetch();
        const channels: Collection<string, AnyChannel> = await guild.channels.fetch();

        const teamCategory: Channel = channels.find((channel: AnyChannel) => channel.name == "Team Channels" && channel.type == "GUILD_CATEGORY");

        if (!teamCategory) return new HTTPResponse(404, null);

        const everyoneRole: Role = guild.roles.everyone;
        const staffRole: Role = roles.find((role: Role) => role.name == 'Staff');
        const mentorRole: Role = roles.find((role: Role) => role.name == 'Mentor');
        const teamRole: Role = await guild.roles.create({ name: options.name, mentionable: false });
        
        await guild.channels.create(options.name, { parent: teamCategory as CategoryChannel, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: mentorRole, allow: ['VIEW_CHANNEL'] }, { id: teamRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });
        await guild.channels.create(options.name, { type: 'GUILD_VOICE', parent: teamCategory as CategoryChannel, permissionOverwrites: [{ id: staffRole, allow: ['VIEW_CHANNEL'] }, { id: mentorRole, allow: ['VIEW_CHANNEL'] }, { id: teamRole, allow: ['VIEW_CHANNEL'] }, { id: everyoneRole, deny: ['VIEW_CHANNEL'] }] });

        return new HTTPResponse(200, "token" + teamRole.id.toString());
    }

    async deleteTeam(server: string, team: string): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const roles: Collection<string, Role> = await guild.roles.fetch();
        const channels: Collection<string, Channel> = await guild.channels.fetch();

        const role: Role = roles.find((role: Role) => role.id == team);

        if (!role) return new HTTPResponse(404, null);
        if (role.members.size) return new HTTPResponse(400, null);

        const teamChannels: Collection<string, Channel> = channels.filter((channel: AnyChannel) => channel.permissionsFor(role).has('VIEW_CHANNEL') && channel.parent && channel.parent.name == 'Team Channels');
        teamChannels.each(async (channel: Channel) => {
            await channel.delete();
        });

        await role.delete();

        return new HTTPResponse(200, null);
    }

    async assignParticipant(server: string, team: string, participant: string): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const roles: Collection<string, Role> = await guild.roles.fetch();
        const users: Collection<string, GuildMember> = await guild.members.fetch();

        const user: GuildMember = users.find((user: GuildMember) => user.id == participant);
        const role: Role = roles.find((role: Role) => role.id == team);

        if (!user || !role) return new HTTPResponse(404, null);

        await user.roles.set([role]);

        return new HTTPResponse(200, null);
    }

    async checkParticipant(server: string, participant: string): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const users: Collection<string, GuildMember> = await guild.members.fetch();

        const user: GuildMember = users.find((user: GuildMember) => user.id == participant);

        if (!user) return new HTTPResponse(404, null);
        return new HTTPResponse(200, null);
    }

    async unassignParticipant(server: string, participant: string): Promise<HTTPResponse> {
        const guilds: Collection<string, OAuth2Guild> = await this.client.guilds.fetch();
        const guildManager: OAuth2Guild = guilds.find((guild: OAuth2Guild) => guild.id == server);
        
        if (!guildManager) return new HTTPResponse(404, null);
        
        const guild: Guild = await guildManager.fetch();
        const users: Collection<string, GuildMember> = await guild.members.fetch();

        const user: GuildMember = users.find((user: GuildMember) => user.id == participant);

        if (!user) return new HTTPResponse(404, null);

        await user.roles.set([]);

        return new HTTPResponse(200, null);
    }
}