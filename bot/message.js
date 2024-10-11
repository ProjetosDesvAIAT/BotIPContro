const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

console.log("Iniciando...");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve("session"),
  }),
});

let userLastInteraction = {};
const INACTIVITY_PERIOD = 15 * 60 * 1000;

client.on("ready", async () => {
  console.log("Bot iniciado!");

  client.on("message", async (message) => {
    const chat = await message.getChat();
    const userId = message.from;
    const now = new Date().getTime();

    if (message.body !== "" && !chat.isGroup) {
      if (
        !userLastInteraction[userId] ||
        now - userLastInteraction[userId] > INACTIVITY_PERIOD
      ) {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n5 - Instagram\n6 - Contato"
        );
      }

      userLastInteraction[userId] = now;

      if (message.body == "1") {
        message.reply(
          "👾Duvidas👾\n\n*Escolha a opcao desejada:*\n\n1 - Duvidas Gerais\n2 - Duvidas sobre as Placas De Prototipagem\n3 - Duvidas sobre Impressao 3D\n4 - Duvidas sobre as plataformas\n5 - Outras\n6 - Voltar"
        );
      } else if (message.body == "2") {
        message.reply(
          "👾Plataforma De Cursos👾\n\n*Para acessar nossa plataforma, entre no link abaixo:*\n\nSite: https://learntechipcontrol.com/login/index.php\n\nEntre com seu email criado:\n(EX: seunomeipcontrol@gmail.com)\nE sua senha:\n(EX: coordenador123)"
        );
      }
    }
  });
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
