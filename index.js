const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

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

    const channel =
      await client.channels.fetch(
        process.env.CHANNEL_ID
      );

    const row =
      new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            `done_${req.body.notifyId}`
          )
          .setLabel('✅ 出した')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(
            `later_${req.body.notifyId}`
          )
          .setLabel('⏰ まだ')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(
            `skip_${req.body.notifyId}`
          )
          .setLabel('❌ 無理')
          .setStyle(ButtonStyle.Danger)
      );

    await channel.send({
      content:
        `🔔 今日は「${req.body.garbageName}」です！`,
      components: [row]
    });

    res.sendStatus(200);

  } catch (e) {

    console.error(e);

    res.sendStatus(500);
  }
});

app.post('/reminder', async (req, res) => {

  try {

    const channel =
      await client.channels.fetch(
        process.env.CHANNEL_ID
      );

    await channel.send({
      content: req.body.message
    });

    res.sendStatus(200);

  } catch (e) {

    console.error(e);

    res.sendStatus(500);
  }
});

client.on(
  'interactionCreate',
  async interaction => {

    if (!interaction.isButton())
      return;

    const [
      action,
      notifyId
    ] =
      interaction.customId.split('_');

    let status = '';
    let message = '';

    if (action === 'done') {

      status = 'done';

      message =
        '✅ ゴミ出し完了！';
    }

    if (action === 'later') {

      status = 'later';

      message =
        '⏰ 後で再通知します';
    }

    if (action === 'skip') {

      status = 'skip';

      message =
        '❌ スキップ記録しました';
    }

    await axios.post(
      process.env.GAS_WEBHOOK_URL,
      {
        notifyId,
        status,
        user:
          interaction.user.username
      }
    );

    const disabledRow =
      new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId('done_disabled')
          .setLabel('✅ 出した')
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId('later_disabled')
          .setLabel('⏰ まだ')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId('skip_disabled')
          .setLabel('❌ 無理')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );

    await interaction.update({
      components: [disabledRow]
    });

    await interaction.followUp({
      content: message,
      ephemeral: true
    });
  }
);

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('running');
});

app.get('/', (req, res) => {
  res.send('running');
});

