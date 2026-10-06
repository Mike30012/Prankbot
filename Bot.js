const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => console.log('Fehler:', err.stack || err.message));
process.on('unhandledRejection', (err) => console.log('Fehler:', err));

const HOST = process.env.MC_HOST || 'spookycraft.play.hosting';
const PORT = process.env.MC_PORT ? parseInt(process.env.MC_PORT, 10) : 25681;

function startBot() {
  console.log(`Verbinde zu ${HOST}:${PORT} ...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'SpookyBot',
    auth: 'offline',
    version: '1.21.11',
    hideErrors: false,
    checkTimeoutInterval: 120000,
  });

  bot._client.on('state', (neu, alt) => console.log(`Status: ${alt} -> ${neu}`));
  bot.on('login', () => console.log('Login ok'));

  let jumpTimer;

  bot.once('spawn', () => {
    console.log('Bot ist auf dem Server.');
    jumpTimer = setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }, 5000);
  });

  bot.on('resourcePack', () => bot.acceptResourcePack());
  bot.on('kicked', (reason) => console.log('Gekickt:', JSON.stringify(reason)));
  bot.on('error', (err) => console.log('Fehler:', err.stack || err.message));

  bot.on('end', (reason) => {
    clearInterval(jumpTimer);
    console.log('Getrennt:', reason, '- neuer Versuch in 10 Sekunden.');
    setTimeout(startBot, 10000);
  });
}

startBot();
