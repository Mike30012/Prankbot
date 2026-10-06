const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => console.log('Fehler:', err.message));
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
  });

  let jumpTimer;

  bot.once('spawn', () => {
    console.log('Bot ist auf dem Server.');
    jumpTimer = setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }, 5000);
  });

  bot.on('resourcePack', () => bot.acceptResourcePack());
  bot.on('kicked', (reason) => console.log('Gekickt:', reason));
  bot.on('error', (err) => console.log('Fehler:', err.message));

  bot.on('end', () => {
    clearInterval(jumpTimer);
    console.log('Getrennt. Neuer Versuch in 10 Sekunden.');
    setTimeout(startBot, 10000);
  });
}

startBot();
