const mineflayer = require('mineflayer');

const config = {
  host: process.env.MC_HOST,
  port: parseInt(process.env.MC_PORT || '25565', 10),
  username: process.env.MC_EMAIL,
  auth: 'microsoft',
  profilesFolder: process.env.AUTH_DIR || './auth',
  version: process.env.MC_VERSION || false,
  onMsaCode: (data) => {
    console.log('=== MICROSOFT LOGIN NÖTIG ===');
    console.log(`Öffne ${data.verification_uri} und gib den Code ein: ${data.user_code}`);
  },
};

if (!config.host || !config.username) {
  console.error('MC_HOST oder MC_EMAIL fehlt! Setze die Variablen in Railway.');
  process.exit(1);
}

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

  bot.on('kicked', (reason) => console.log('Gekickt:', reason));
  bot.on('error', (err) => console.log('Fehler:', err.message));

  bot.on('end', (reason) => {
    clearInterval(jumpTimer);
    console.log(`Getrennt (${reason}). Neuer Versuch in 30 Sekunden.`);
    setTimeout(startBot, 30000);
  });
}

startBot();
