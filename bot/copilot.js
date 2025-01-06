// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const path = require("path");

// // Iniciando o Cliente e mantendo o Login
// console.log("Iniciando...");
// const client = new Client({
//   authStrategy: new LocalAuth({
//     dataPath: path.resolve("session"),
//   }),
// });

// client.on("ready", async () => {
//   console.log("Bot iniciado!");

//   async function sendMsg() {
//     const chat = "553186403130@c.us";
//     const mentionId = "13135550002@c.us"; // ID do contato a ser mencionado
//     const numberOnly = mentionId.split("@")[0]; // Extrai apenas o número do contato

//     client.sendMessage(chat, `@${numberOnly}, o que é microbit?`, {
//       mentions: [mentionId], // Menção configurada corretamente
//     });
//   }

//   client.on("message", async (msg) => {
//     console.log(msg.body);
//   });

//   setTimeout(() => {
//     sendMsg();
//   }, 3000);
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// client.initialize();
