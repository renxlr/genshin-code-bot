const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [
    new SlashCommandBuilder()
        .setName('codigos')
        .setDescription('Mostra os códigos ativos de Genshin Impact')
        .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comando...');

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });

        console.log('Comando registrado com sucesso!');
    } catch (error) {
        console.error(error);
    }
})();
