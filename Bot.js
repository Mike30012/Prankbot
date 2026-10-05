const mineflayer = require('mineflayer');

const config = {
  host: process.env.MC_HOST || 'spookycraft.play.hosting',
  port: parseInt(process.env.MC_PORT || '25874', 10),
  username: process.env.MC_USERNAME || 'SpookyBot',
  version: process.env.MC_VERSION || false, // false = automatisch erkennen
};

function startBot() {
  console.log(`Verbinde zu ${config.host}:${config.port} ...`);
  const bot = mineflayer.createBot(config);
  let jumpTimer;

  bot.once('spawn', () => {
    console.log('Bot ist auf dem Server.');
    // Alle 30 Sekunden kurz springen (Anti-AFK)
    jumpTimer = setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  // Resource-Pack des Servers automatisch annehmen
  bot.on('resourcePack', () => {
    bot.acceptResourcePack();
  });

  bot.on('kicked', (reason) => console.log('Gekickt:', reason));
  bot.on('error', (err) => console.log('Fehler:', err.message));

  bot.on('end', (reason) => {
    clearInterval(jumpTimer);
    console.log(`Getrennt (${reason}). Neuer Versuch in 15 Sekunden.`);
    setTimeout(startBot, 15000);
  });
}

startBot();
