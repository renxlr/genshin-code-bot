const fs = require('fs');
const axios = require('axios');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const dotenv = require('dotenv');
const { log } = require('console');
dotenv.config();
const { TOKEN, CLIENT_ID, GUILD_ID, CHANNEL_ID } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    checkCodes();
    setInterval(checkCodes, CHECK_INTERVAL);
});

const CHECK_INTERVAL = 1000 * 60 * 30;
const API_URL = 'https://api.ennead.cc/mihoyo/genshin/codes';

function loadSavedCodes() {
    try {
        const data = fs.readFileSync('savedCodes.json', 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveCodes(codes) {
    fs.writeFileSync('savedCodes.json', JSON.stringify(codes, null, 2));
}

async function checkCodes() {
    try {
        const res = await axios.get(API_URL);

        const active = Array.isArray(res.data.active) ? res.data.active : [];

        const saved = loadSavedCodes();
        const newCodes = active.filter((c) => !saved.includes(c.code));

        if (newCodes.length > 0) {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel) return console.log('Canal não encontrado.');

            for (const c of newCodes) {
                const embed = new EmbedBuilder()
                    .setColor(0x9b59b6)
                    .setTitle('Código Genshin 💎')
                    .addFields(
                        { name: 'Código', value: `**${c.code}**` },
                        { name: 'Recompensas', value: c.rewards.join('\n') },
                    )
                    .setFooter({ text: 'renbot' })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });

                saved.push(c.code);
            }

            saveCodes(saved);
        }
    } catch (err) {
        console.error('Erro ao checar API:', err.message);
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'codigos') {
        await interaction.deferReply();

        try {
            const res = await axios.get(API_URL);
            const active = res.data.active || [];

            if (active.length === 0) {
                return interaction.editReply('Nenhum código ativo no momento.');
            }

            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle('Códigos Ativos - Genshin Impact')
                .setFooter({ text: 'renbot' })
                .setTimestamp();

            active.forEach((c) => {
                embed.addFields({
                    name: `💎 ${c.code}`,
                    value: Array.isArray(c.rewards)
                        ? c.rewards.join('\n')
                        : c.rewards || 'Sem descrição',
                });
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply('Erro ao buscar os códigos.');
        }
    }
});

client.login(TOKEN);
