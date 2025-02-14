const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

// Iniciando o Cliente e mantendo o Login
console.log("Iniciando...");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve("session"),
  }),
});

let userLastInteraction = {};
const INACTIVITY_PERIOD = 15 * 60 * 1000;
let useroption = {};
let userState = {}; // Aqui armazenamos o estado atual do usuário
let userData = {};

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
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
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
          "👾Manutenção👾\n\nEscolha uma opção:\n\n1 - Outras\n2 - Menu Principal"
        );
        useroption[userId] = "maintenance";
      } else if (message.body == "1") {
        message.reply(
          "👾Duvidas👾\n\n*Escolha a opcao desejada:*\n\n1 - Duvidas Gerais\n2 - Duvidas sobre as Placas De Prototipagem\n3 - Duvidas sobre Impressao 3D\n4 - Menu Principal"
        );
        useroption[userId] = "questions";
      } else if (message.body == "2") {
        message.reply(
          "👾Plataforma De Cursos👾\n\n*Para acessar nossa plataforma de cursos, entre no link abaixo:*\n\nSite: https://learntechipcontrol.com/login/index.php\n\nEntre com seu email criado:\n(EX: seunomeipcontrol@gmail.com)\nE sua senha:\n(EX: coordenador123)"
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "3") {
        message.reply(
          "👾Teachers Guide👾\n\nClick no teachers guide desejado:\n\nFundamental I: https://docs.google.com/spreadsheets/d/13BtfbZHkhoOYkXJcDMLNP6uNx4MBc_GZ/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true \n\nFundamental II: https://docs.google.com/spreadsheets/d/1Nw4Ro8U4xMDRsKQuAc6Io1i-026e0SG2/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true \n\nEnsino Médio: https://docs.google.com/spreadsheets/d/1NwcEwLx82jWSSMSHEAoD1WCtiEvQDgOb/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true"
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "4") {
        message.reply(
          "👾Instagram👾\n\nAcesse nosso instagram:\n\nhttps://www.instagram.com/ipcontroltecnologias/"
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "5") {
        message.reply(
          "👾Contato👾\n\nPara entrar em contato, você precisará abrir uma demanda.\n\nDigite seu nome completo:"
        );
        userState[message.from] = "collect_name"; // Muda o estado para coletar o nome
      } else if (userState[message.from] === "collect_name") {
        userData[message.from] = { name: message.body }; // Armazena o nome
        message.reply("Digite sua unidade:");
        userState[message.from] = "collect_unit"; // Muda o estado para coletar a Unidade
      } else if (userState[message.from] === "collect_unit") {
        userData[message.from].unit = message.body; // Armazena o nome
        message.reply("Digite sua demanda:");
        userState[message.from] = "collect_demand"; // Muda o estado para coletar a demanda
      } else if (userState[message.from] === "collect_demand") {
        userData[message.from].demand = message.body; // Armazena a demanda
        message.reply("Digite seu número de telefone com DDD:");
        userState[message.from] = "collect_number"; // Muda o estado para coletar o número
      } else if (userState[message.from] === "collect_number") {
        userData[message.from].number = message.body; // Armazena o número

        userData[message.from].status = "Pendente";
        userData[message.from].date = new Date().toLocaleDateString();

        // Confirmação final
        const { name, demand, number, date, status, unit } =
          userData[message.from];
        message.reply(
          `Sua demanda foi enviada com sucesso!\n\nNome: ${name}\nDemanda: ${demand}\nNúmero: ${number}\n Data: ${date}\nStatus: ${status} \nUnidade: ${unit}\n\n Em breve entraremos em contato!`
        );
        async function sendDatas() {
          fetch("https://ipdemandas.vercel.app/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData[message.from]),
          });
        }
        sendDatas();

        // Limpa os dados e reseta o estado do usuário
        delete userState[message.from];
        delete userData[message.from];

        // Retorna ao menu principal
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu"; // Volta ao menu principal
      } else if (message.body == "6") {
        message.reply(
          "Para consultar sua demanda, digite o seu nome completo:"
        );
        useroption[userId] = "consult_demand";
      }
    } else if (useroption[userId] == "consult_demand") {
      const response = await fetch(
        "https://ipdemandas.vercel.app/"
      );

      const demands = await response.json();
      const userDemands = demands.filter(
        (demand) => demand.name === message.body
      );
      userDemands.forEach((demand) => {
        if (demand.status === "Pendente") {
          message.reply(
            `${demand.id} - Nome: ${demand.name}\nUnidade: ${demand.unit}\nDemanda: ${demand.demand}\nData: ${demand.date}\nStatus: ${demand.status}`
          );
        }
      });
      setTimeout(() => {
        message.reply(
          "Caso queira marcar como finalizada alguma demanda, digite o numero da demanda: (0 Para voltar ao menu principal)"
        );
      }, 3000);
      useroption[userId] = "finalize_demand";
    } else if (useroption[userId] == "finalize_demand") {
      if (message.body == "0") {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else {
        await fetch(
          `https://bot-ip-contro.vercel.app/demands/${message.body}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Finalizado" }),
          }
        );
        message.reply("Demanda finalizada com sucesso!!!");
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      }
    } else if (useroption[userId] == "questions") {
      if (message.body == "1") {
        message.reply(
          "👾Duvidas Gerais👾\n\nCaso tenha alguma duvida sobre treinamentos, horarios, planos de aula e demais ocasioes, entre em contato com o seu *COORDENADOR*."
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "2") {
        message.reply(
          `👾 *Dúvidas sobre as Placas de Prototipagem* 👾

          *Arduino*

          O Arduino é uma plataforma de prototipagem eletrônica de código aberto, amplamente utilizada por hobistas, estudantes e profissionais. Ele permite a criação de projetos interativos e dispositivos eletrônicos de forma simples e acessível. Com uma vasta gama de placas e módulos disponíveis, o Arduino pode ser utilizado para uma variedade de aplicações, desde projetos simples, como acender LEDs, até sistemas complexos, como robôs autônomos e sistemas de automação residencial.

          - *Site Oficial*: [arduino.cc](https://www.arduino.cc/)  
          - *Plataforma de Cursos IP*: [learntechipcontrol.com](https://learntechipcontrol.com/login/index.php)  
          - *Plataforma para Simulação*: [tinkercad.com](https://www.tinkercad.com/circuits)  
          - *YouTube*: (https://youtu.be/Vuof27YELEI?si=xVQthAw5T_cD6UuG)  
          - *Plataforma de Programação*: [mblock.cc](https://mblock.cc/)  
          ---
          *Micro:bit*

          O micro:bit é uma placa de prototipagem compacta e fácil de usar, projetada especialmente para ensinar programação e eletrônica a crianças e iniciantes. Desenvolvido pela BBC, o micro:bit possui uma variedade de sensores, LEDs e conectividade sem fio, permitindo que os usuários criem projetos interativos de forma rápida e divertida.

          - *Site Oficial*: [microbit.org](https://microbit.org/)  
          - *Plataforma de Cursos IP*: [learntechipcontrol.com](https://learntechipcontrol.com/login/index.php)  
          - *Plataforma de Programação*: [makecode.microbit.org](https://makecode.microbit.org/)`
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "3") {
        message.reply(
          `👾 *Dúvidas sobre Impressão 3D* 👾

         A impressão 3D é uma tecnologia de fabricação aditiva que cria objetos tridimensionais a partir de modelos digitais, construindo-os camada por camada. Ela utiliza diferentes materiais, como plásticos (PLA, ABS, PETG), resinas e até metais, dependendo do tipo de impressora (FDM, SLA, SLS).

        As principais vantagens incluem a personalização de peças, a redução de desperdícios e a possibilidade de fabricar objetos com designs complexos de forma rápida. É amplamente utilizada em áreas como prototipagem, indústria, medicina, educação e arte. No entanto, a impressão 3D pode enfrentar desafios como o custo inicial, tempo de impressão e a necessidade de manutenção constante.

          - *Site Oficial*: [ultimaker.com](https://ultimaker.com/)
          - *Plataforma de Cursos IP*: [learntechipcontrol.com](https://learntechipcontrol.com/login/index.php)
          - *Plataforma de Modelagem*: [tinkercad.com](https://www.tinkercad.com/)
          - *YouTube*: (https://www.youtube.com/results?search_query=impressao+3d)
          - *Plataforma de Impressoes*: [thingeverse.com](https://www.thingiverse.com/tag:ultimaker)`
        );
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      } else if (message.body == "4") {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      }
    } else if (useroption[userId] == "maintenance") {
      // if (message.body == "1") {
      //   message.reply("👾Manutenção Arduino👾\n\n");
      //   message.reply(
      //     "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato"
      //   );
      //   useroption[userId] = "main_menu";
      // } else if (message.body == "2") {
      //   message.reply("👾Manutenção Microbit👾\n\n");
      //   message.reply(
      //     "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato\n6 - Consultar Demanda"
      //   );
      //   useroption[userId] = "main_menu";
      // } else if (message.body == "3") {
      //   message.reply("👾Manutenção Impressora3D👾\n\n");
      //   message.reply(
      //     "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato\n6 - Consultar Demanda"
      //   );
      //   useroption[userId] = "main_menu";
      // }
      if (message.body == "1") {
        message.reply(
          "👾Manutenção Outras👾\n\nCaso tenha alguma duvida, consulte seu coordenador ou utilize @Meta AI e faça a sua pergunta!!!"
        );

        setTimeout(() => {
          message.reply(
            "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
          );
          useroption[userId] = "main_menu";
        }, 3000);
      } else if (message.body == "2") {
        message.reply(
          "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda"
        );
        useroption[userId] = "main_menu";
      }
    }
  }
});

// Gerando QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
