const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => console.log('Fehler:', err.message));
process.on('unhandledRejection', (err) => console.log('Fehler:', err));

function startBot() {
  console.log('Verbinde zu spookycraft.play.hosting:25681 ...');

  const bot = mineflayer.createBot({
    host: 'spookycraft.play.hosting',
    port: 25681,
    username: 'SpookyBot',
    auth: 'offline',
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
