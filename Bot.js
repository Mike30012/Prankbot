const mineflayer = require('mineflayer');
const dns = require('dns');

process.on('uncaughtException', (err) => console.log('Fehler:', err.message));
process.on('unhandledRejection', (err) => console.log('Fehler:', err));

const HOST = process.env.MC_HOST || 'spookycraft.play.hosting';
// 25565 = Standard: der echte Port wird automatisch über die Domain gefunden
const PORT = process.env.MC_PORT ? parseInt(process.env.MC_PORT, 10) : 25565;

function startBot() {
  console.log(`Verbinde zu ${HOST}:${PORT} ...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'SpookyBot',
    auth: 'offline',
  });

  let moveTimer;

  const watchdog = setTimeout(() => {
    console.log('Kein Spawn nach 150 Sekunden, starte neu.');
    bot.end();
  }, 150000);

  bot.once('spawn', () => {
    clearTimeout(watchdog);
    console.log('Bot ist auf dem Server.');

    moveTimer = setInterval(() => {
      bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.6, true);
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
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

dns.resolveSrv(`_minecraft._tcp.${HOST}`, (err, records) => {
  console.log('SRV:', err ? 'keiner (' + err.code + ')' : JSON.stringify(records));
  startBot();
});
