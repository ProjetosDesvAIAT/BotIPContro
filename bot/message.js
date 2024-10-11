const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

//Iniciando o Cliente e mantendo o Login
console.log("Iniciando...");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve("session"),
  }),
});

let userLastInteraction = {};
const INACTIVITY_PERIOD = 15 * 60 * 1000;
let useroption = {};

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
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato"
        );
        useroption[userId] = "main_menu";
      }

      userLastInteraction[userId] = now;
      options(userId, message);
    }
  });

  async function options(userId, message) {
    if (useroption[userId] == "main_menu") {
      if (message.body == "0") {
        message.reply(
          "👾Manutenção👾\n\nEscolha uma opção:\n\n1 - Arduino\n2 - Microbit\n3 - Impressora3D\n4 - Outras\n5 - Menu Principal"
        );
        useroption[userId] = "maintenance";
      } else if (message.body == "1") {
        message.reply(
          "👾Duvidas👾\n\n*Escolha a opcao desejada:*\n\n1 - Duvidas Gerais\n2 - Duvidas sobre as Placas De Prototipagem\n3 - Duvidas sobre Impressao 3D\n4 - Duvidas sobre as plataformas\n5 - Outras\n6 - Menu Principal"
        );
        useroption[userId] = "questions";
      } else if (message.body == "2") {
        message.reply(
          "👾Plataforma De Cursos👾\n\n*Para acessar nossa plataforma de cursos, entre no link abaixo:*\n\nSite: https://learntechipcontrol.com/login/index.php\n\nEntre com seu email criado:\n(EX: seunomeipcontrol@gmail.com)\nE sua senha:\n(EX: coordenador123)"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "3") {
        message.reply(
          "👾Teachers Guide👾\n\nClick no teachers guide desejado:\n\nFundamental I: \n\nFundamental II: https://docs.google.com/spreadsheets/d/11Ew_zxPaPP88hdukJteznjMFfgFpkdIFZjzIs9r-lvo/edit?gid=662943470#gid=662943470"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "4") {
        message.reply(
          "👾Instagram👾\n\nAcesse nosso instagram:\n\nhttps://www.instagram.com/ipcontrol/"
        );
        useroption[userId] = "main_menu";
      }
    } else if (useroption[userId] == "questions") {
      if (message.body == "1") {
        message.reply("👾Duvidas Gerais👾\n\n");
      } else if (message.body == "2") {
        message.reply("👾Duvidas sobre as Placas De Prototipagem👾\n\n");
      } else if (message.body == "6") {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato"
        );
        useroption[userId] = "main_menu";
      }
    } else if (useroption[userId] == "maintenance") {
      if (message.body == "1") {
        message.reply("👾Manutenção Arduino👾\n\n");
      } else if (message.body == "2") {
        message.reply("👾Manutenção Microbit👾\n\n");
      } else if (message.body == "3") {
        message.reply("👾Manutenção Impressora3D👾\n\n");
      } else if (message.body == "4") {
        message.reply("👾Manutenção Outras👾\n\n");
      } else if (message.body == "5") {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato"
        );
        useroption[userId] = "main_menu";
      }
    }
  }
});

//Gerando QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
