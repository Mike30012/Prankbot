const bedrock = require("bedrock-protocol");

const client = bedrock.createClient({
  host: process.env.SERVER_HOST,
  port: Number(process.env.SERVER_PORT || 19132),
  username: "TestBot",
  offline: true
});

client.on("join", () => {
  console.log("✅ Bot ist verbunden!");

  setTimeout(() => {
    console.log("⏹️ Test beendet.");
    client.disconnect();
  }, 10000);
});

client.on("disconnect", (reason) => {
  console.log("Bot getrennt:", reason);
});

client.on("error", (err) => {
  console.error("Fehler:", err);
});
