```javascript
const express = require('express');
const bodyParser = require('body-parser');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const app = express();

app.use(bodyParser.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.BOT_TOKEN);

app.post('/send', async (req, res) => {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(req.body.components[0].components[0].custom_id)
        .setLabel('✅ 出した')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(req.body.components[0].components[1].custom_id)
        .setLabel('⏰ まだ')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(req.body.components[0].components[2].custom_id)
        .setLabel('❌ 無理')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: req.body.content,
      components: [row]
    });

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  let msg = '';

  if (interaction.customId.startsWith('done_')) {
    msg = '✅ ゴミ出し完了！';
  }

  if (interaction.customId.startsWith('later_')) {
    msg = '⏰ 後で再通知します';
  }

  if (interaction.customId.startsWith('skip_')) {
    msg = '❌ スキップ記録しました';
  }

  await interaction.reply({
    content: msg,
    ephemeral: true
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('running');
});
```
