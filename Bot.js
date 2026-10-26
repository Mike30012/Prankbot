const mineflayer = require('mineflayer');
const dns = require('dns');

process.on('uncaughtException', (err) => console.log('Fehler:', err.message));
process.on('unhandledRejection', (err) => console.log('Fehler:', err));

const HOST = process.env.MC_HOST || 'spookycraft.play.hosting';
const PORT = process.env.MC_PORT ? parseInt(process.env.MC_PORT, 10) : 25565;

let wait = 10000;
let running = false; // verhindert, dass zwei Bots im selben Prozess laufen

function startBot() {
  if (running) return;
  running = true;
  console.log(`Verbinde zu ${HOST}:${PORT} ...`);

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'SpookyBot',
    auth: 'offline',
  });

  let moveTimer;
  let joinedAt = 0;
  let stopped = false;

  // Resource-Pack direkt beantworten
  bot._client.on('add_resource_pack', (packet) => {
    console.log('Resource-Pack angefragt, bestätige ...');
    const uuid = packet.uuid;
    const send = (result) => {
      try {
        bot._client.write('resource_pack_receive', { uuid, result });
      } catch (e) {
        console.log('Pack-Antwort fehlgeschlagen:', e.message);
      }
    };
    send(3);
    setTimeout(() => send(4), 300);
    setTimeout(() => send(0), 600);
  });

  bot.on('login', () => console.log('Login ok'));

  const watchdog = setTimeout(() => {
    console.log('Kein Spawn nach 150 Sekunden, starte neu.');
    bot.end();
  }, 150000);

  function moveLoop() {
    if (stopped) return;
    try {
      const dirs = ['forward', 'back', 'left', 'right'];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.8, true);
      bot.setControlState(dir, true);
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
      bot.swingArm('right');
      setTimeout(() => bot.setControlState(dir, false), 400 + Math.random() * 500);
    } catch (e) {
      console.log('Bewegung fehlgeschlagen:', e.message);
    }
    moveTimer = setTimeout(moveLoop, 4000 + Math.random() * 4000);
  }

  bot.once('spawn', () => {
    clearTimeout(watchdog);
    joinedAt = Date.now();
    console.log('Bot ist auf dem Server.');
    moveLoop();
  });

  bot.on('kicked', (reason) => console.log('Gekickt:', JSON.stringify(reason)));
  bot.on('error', (err) => console.log('Fehler:', err.message));

  bot.on('end', (reason) => {
    stopped = true;
    clearTimeout(watchdog);
    clearTimeout(moveTimer);
    const secs = joinedAt ? Math.round((Date.now() - joinedAt) / 1000) : 0;
    console.log(`Getrennt: ${reason} | Zeit auf dem Server: ${secs} Sekunden`);
    if (secs > 60) wait = 10000;
    console.log(`Neuer Versuch in ${Math.round(wait / 1000)} Sekunden.`);
    running = false;
    setTimeout(startBot, wait);
    wait = Math.min(wait * 2, 60000);
  });
}

dns.resolveSrv(`_minecraft._tcp.${HOST}`, (err, records) => {
  console.log('SRV:', err ? 'keiner (' + err.code + ')' : JSON.stringify(records));
  startBot();
});
