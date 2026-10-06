const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => console.log('Fehler:', err.message));
process.on('unhandledRejection', (err) => console.log('Fehler:', err));

const HOST = process.env.MC_HOST || 'spookycraft.play.hosting';
const PORT = process.env.MC_PORT ? parseInt(process.env.MC_PORT, 10) : 25565;

function startBot() {
  console.log(`Verbinde zu ${HOST}:${PORT} ...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'SpookyBot',
    auth: 'offline',
    version: '1.21.11',
  });

  let moveTimer;

  const watchdog = setTimeout(() => {
    console.log('Kein Spawn nach 45 Sekunden, starte neu.');
    bot.end();
  }, 45000);

  bot.once('spawn', () => {
    clearTimeout(watchdog);
    console.log('Bot ist auf dem Server.');

    moveTimer = setInterval(() => {
      // Kopf drehen
      bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.6, true);
      // Springen
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
      // Kurz vor und wieder zurück
      bot.setControlState('forward', true);
      setTimeout(() => {
        bot.setControlState('forward', false);
        bot.setControlState('back', true);
        setTimeout(() => bot.setControlState('back', false), 400);
      }, 400);
    }, 5000);
  });

  bot.on('resourcePack', () => bot.acceptResourcePack());
  bot.on('kicked', (reason) => console.log('Gekickt:', JSON.stringify(reason)));
  bot.on('error', (err) => console.log('Fehler:', err.message));

  bot.on('end', () => {
    clearTimeout(watchdog);
    clearInterval(moveTimer);
    console.log('Getrennt. Neuer Versuch in 10 Sekunden.');
    setTimeout(startBot, 10000);
  });
}

startBot();
