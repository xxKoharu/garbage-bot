const express = require('express');
const bodyParser = require('body-parser');

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.BOT_TOKEN);

client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

app.get('/', (req, res) => {
  res.send('running');
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'running',
    time: new Date().toISOString()
  });
});

app.post('/send', async (req, res) => {
  try {
    await sendDiscordMessage(req.body.content, 'main');
    res.sendStatus(200);
  } catch (error) {
    console.error('send error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/reminder', async (req, res) => {
  try {
    await sendDiscordMessage(req.body.content, 'reminder');
    res.sendStatus(200);
  } catch (error) {
    console.error('reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function sendDiscordMessage(content, type) {
  if (!process.env.CHANNEL_ID) {
    throw new Error('CHANNEL_ID is not set');
  }

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!channel) {
    throw new Error('Discord channel not found');
  }

  const useEmbeds = String(process.env.USE_EMBEDS || '').toLowerCase() === 'true';

  if (useEmbeds) {
    const embed = new EmbedBuilder()
      .setDescription(content)
      .setTimestamp(new Date());

    if (type === 'reminder') {
      embed.setTitle('ゴミ出し再通知');
      embed.setColor(0xf59e0b);
    } else {
      embed.setTitle('ゴミの日通知');
      embed.setColor(0x22c55e);
    }

    await channel.send({ embeds: [embed] });
    return;
  }

  await channel.send({ content });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
