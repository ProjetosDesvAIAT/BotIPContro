const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

// Nota: Este código requer Node.js 18+ que possui fetch global.
// Para versões anteriores, instale node-fetch: npm install node-fetch
// e adicione: const fetch = require('node-fetch');

// Configurações
const INACTIVITY_PERIOD = 15 * 60 * 1000; // 15 minutos
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutos para limpeza de dados inativos
const API_BASE_URL = "https://ipdemandas.vercel.app";
const REQUEST_TIMEOUT = 10000; // 10 segundos timeout para requisições
const MESSAGE_DELAY = 1500; // Delay entre mensagens sequenciais

// Iniciando o Cliente e mantendo o Login
console.log("Iniciando...");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve("session"),
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Estado dos usuários - armazenamento unificado
const userSessions = new Map();

// Função para obter ou criar sessão do usuário
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      lastInteraction: 0,
      currentMenu: null,
      state: null,
      data: {},
    });
  }
  return userSessions.get(userId);
}

// Função para limpar sessões inativas
function cleanupInactiveSessions() {
  const now = Date.now();
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.lastInteraction > INACTIVITY_PERIOD * 2) {
      userSessions.delete(userId);
      console.log(`[CLEANUP] Sessão removida para usuário: ${userId}`);
    }
  }
}

// Executar limpeza periodicamente
setInterval(cleanupInactiveSessions, CLEANUP_INTERVAL);

// Função helper para fazer requisições com timeout e tratamento de erros
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Requisição expirou. Tente novamente.");
    }
    throw error;
  }
}

// Função para validar dados do usuário
function validateUserData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres.");
  }

  if (!data.unit || data.unit.trim().length < 2) {
    errors.push("Unidade deve ser informada.");
  }

  if (!data.demand || data.demand.trim().length < 10) {
    errors.push("Demanda deve ter pelo menos 10 caracteres.");
  }

  if (!data.number || !/^\d{10,11}$/.test(data.number.replace(/\D/g, ""))) {
    errors.push("Número de telefone inválido. Use formato: DDD + número (10 ou 11 dígitos).");
  }

  return errors;
}

// Menu principal como constante
const MAIN_MENU =
  "👾Seja bem-vindo ao Bot IP!👾\n\n*Escolha a opcao desejada:*\n\n0 - Manutenção\n1 - Duvidas\n2 - Plataforma De Cursos\n3 - Teachers Guide\n4 - Instagram\n5 - Contato/Abrir Demanda\n6 - Consultar Demanda";

// Função para enviar menu principal
async function sendMainMenu(message, userId) {
  const session = getUserSession(userId);
  session.currentMenu = "main_menu";
  session.state = null;
  await message.reply(MAIN_MENU);
}

client.on("ready", async () => {
  console.log("Bot iniciado!");

  client.on("message", async (message) => {
    try {
      const chat = await message.getChat();
      const userId = message.from;
      const now = Date.now();

      // Ignorar mensagens vazias e de grupos
      if (!message.body || message.body.trim() === "" || chat.isGroup) {
        return;
      }

      const session = getUserSession(userId);
      const messageText = message.body.trim();

      console.log(`[MSG] ${userId}: ${messageText} | Menu: ${session.currentMenu} | State: ${session.state}`);

      // Verifica se é novo usuário ou inativo
      if (!session.lastInteraction || now - session.lastInteraction > INACTIVITY_PERIOD) {
        await sendMainMenu(message, userId);
        session.lastInteraction = now;
        return;
      }

      session.lastInteraction = now;
      await processUserInput(userId, message, messageText);
    } catch (error) {
      console.error("[ERROR] Erro ao processar mensagem:", error);
      try {
        await message.reply("❌ Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.");
      } catch {
        console.error("[ERROR] Falha ao enviar mensagem de erro");
      }
    }
  });

  async function processUserInput(userId, message, messageText) {
    const session = getUserSession(userId);

    // Primeiro verifica se está em um estado de coleta de dados
    if (session.state) {
      await handleDataCollection(userId, message, messageText);
      return;
    }

    // Processa baseado no menu atual
    switch (session.currentMenu) {
      case "main_menu":
        await handleMainMenu(userId, message, messageText);
        break;
      case "maintenance":
        await handleMaintenanceMenu(userId, message, messageText);
        break;
      case "questions":
        await handleQuestionsMenu(userId, message, messageText);
        break;
      case "consult_demand":
        await handleConsultDemand(userId, message, messageText);
        break;
      case "finalize_demand":
        await handleFinalizeDemand(userId, message, messageText);
        break;
      default:
        await sendMainMenu(message, userId);
        break;
    }
  }

  async function handleMainMenu(userId, message, messageText) {
    const session = getUserSession(userId);

    switch (messageText) {
      case "0":
        await message.reply(
          "👾Manutenção👾\n\nEscolha uma opção:\n\n1 - Outras\n2 - Menu Principal"
        );
        session.currentMenu = "maintenance";
        break;

      case "1":
        await message.reply(
          "👾Duvidas👾\n\n*Escolha a opcao desejada:*\n\n1 - Duvidas Gerais\n2 - Duvidas sobre as Placas De Prototipagem\n3 - Duvidas sobre Impressao 3D\n4 - Menu Principal"
        );
        session.currentMenu = "questions";
        break;

      case "2":
        await message.reply(
          "👾Plataforma De Cursos👾\n\n*Para acessar nossa plataforma de cursos, entre no link abaixo:*\n\nSite: https://learntechipcontrol.com/login/index.php\n\nEntre com seu email criado:\n(EX: seunomeipcontrol@gmail.com)\nE sua senha:\n(EX: coordenador123)"
        );
        await sendMainMenu(message, userId);
        break;

      case "3":
        await message.reply(
          "👾Teachers Guide👾\n\nClick no teachers guide desejado:\n\nFundamental I: https://docs.google.com/spreadsheets/d/13BtfbZHkhoOYkXJcDMLNP6uNx4MBc_GZ/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true \n\nFundamental II: https://docs.google.com/spreadsheets/d/1Nw4Ro8U4xMDRsKQuAc6Io1i-026e0SG2/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true \n\nEnsino Médio: https://docs.google.com/spreadsheets/d/1NwcEwLx82jWSSMSHEAoD1WCtiEvQDgOb/edit?usp=sharing&ouid=101815314869275332344&rtpof=true&sd=true"
        );
        await sendMainMenu(message, userId);
        break;

      case "4":
        await message.reply(
          "👾Instagram👾\n\nAcesse nosso instagram:\n\nhttps://www.instagram.com/ipcontroltecnologias/"
        );
        await sendMainMenu(message, userId);
        break;

      case "5":
        await message.reply(
          "👾Contato👾\n\nPara entrar em contato, você precisará abrir uma demanda.\n\nDigite seu nome completo:"
        );
        session.state = "collect_name";
        session.data = {};
        break;

      case "6":
        await message.reply(
          "Para consultar sua demanda, digite o seu nome completo:"
        );
        session.currentMenu = "consult_demand";
        break;

      default:
        await message.reply(
          "❌ Opção inválida. Por favor, digite um número de 0 a 6."
        );
        break;
    }
  }

  async function handleDataCollection(userId, message, messageText) {
    const session = getUserSession(userId);

    switch (session.state) {
      case "collect_name":
        if (messageText.length < 3) {
          await message.reply("❌ Nome muito curto. Por favor, digite seu nome completo:");
          return;
        }
        session.data.name = messageText;
        await message.reply("Digite sua unidade:");
        session.state = "collect_unit";
        break;

      case "collect_unit":
        if (messageText.length < 2) {
          await message.reply("❌ Unidade inválida. Por favor, digite sua unidade:");
          return;
        }
        session.data.unit = messageText;
        await message.reply("Digite sua demanda (descreva detalhadamente):");
        session.state = "collect_demand";
        break;

      case "collect_demand":
        if (messageText.length < 10) {
          await message.reply("❌ Por favor, descreva sua demanda com mais detalhes (mínimo 10 caracteres):");
          return;
        }
        session.data.demand = messageText;
        await message.reply("Digite seu número de telefone com DDD (apenas números):");
        session.state = "collect_number";
        break;

      case "collect_number":
        const cleanNumber = messageText.replace(/\D/g, "");
        if (cleanNumber.length < 10 || cleanNumber.length > 11) {
          await message.reply("❌ Número inválido. Digite o DDD + número (10 ou 11 dígitos):");
          return;
        }
        session.data.number = cleanNumber;
        session.data.status = "Pendente";
        session.data.date = new Date().toLocaleDateString("pt-BR");

        // Validação final
        const errors = validateUserData(session.data);
        if (errors.length > 0) {
          await message.reply(`❌ Erro na validação:\n${errors.join("\n")}\n\nPor favor, inicie novamente digitando 5.`);
          session.state = null;
          session.data = {};
          await sendMainMenu(message, userId);
          return;
        }

        // Confirmação
        const { name, demand, number, date, status, unit } = session.data;
        await message.reply(
          `✅ Sua demanda foi registrada!\n\n📋 *Resumo:*\nNome: ${name}\nUnidade: ${unit}\nDemanda: ${demand}\nNúmero: ${number}\nData: ${date}\nStatus: ${status}\n\n⏳ Em breve entraremos em contato!`
        );

        // Envia dados para a API
        try {
          await fetchWithTimeout(`${API_BASE_URL}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(session.data),
          });
          console.log(`[API] Demanda enviada com sucesso para ${userId}`);
        } catch (error) {
          console.error("[API ERROR] Erro ao enviar demanda:", error);
          await message.reply("⚠️ Houve um problema ao salvar sua demanda no sistema. Nossa equipe foi notificada e entrará em contato.");
        }

        // Limpa dados e volta ao menu
        session.state = null;
        session.data = {};
        await sendMainMenu(message, userId);
        break;

      default:
        session.state = null;
        await sendMainMenu(message, userId);
        break;
    }
  }

  async function handleConsultDemand(userId, message, messageText) {
    const session = getUserSession(userId);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/`);
      const demands = await response.json();

      if (!Array.isArray(demands)) {
        throw new Error("Resposta inválida da API");
      }

      const userDemands = demands.filter(
        (demand) => demand.name && demand.name.toLowerCase() === messageText.toLowerCase()
      );

      const pendingDemands = userDemands.filter(
        (demand) => demand.status === "Pendente"
      );

      if (pendingDemands.length === 0) {
        await message.reply("📭 Nenhuma demanda pendente encontrada para este nome.");
        await sendMainMenu(message, userId);
        return;
      }

      for (const demand of pendingDemands) {
        await message.reply(
          `📋 *Demanda #${demand.id}*\nNome: ${demand.name}\nUnidade: ${demand.unit || "N/A"}\nDemanda: ${demand.demand}\nData: ${demand.date}\nStatus: ${demand.status}`
        );
      }

      // Pequeno delay para garantir que todas as mensagens foram enviadas
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));

      await message.reply(
        "🔄 Para finalizar uma demanda, digite o número dela.\nDigite *0* para voltar ao menu principal."
      );
      session.currentMenu = "finalize_demand";
    } catch (error) {
      console.error("[API ERROR] Erro ao consultar demandas:", error);
      await message.reply("❌ Não foi possível consultar suas demandas no momento. Tente novamente mais tarde.");
      await sendMainMenu(message, userId);
    }
  }

  async function handleFinalizeDemand(userId, message, messageText) {
    if (messageText === "0") {
      await sendMainMenu(message, userId);
      return;
    }

    const demandId = messageText.trim();

    // Validar que é um número válido
    if (!/^\d+$/.test(demandId)) {
      await message.reply("❌ ID inválido. Digite apenas números ou *0* para voltar.");
      return;
    }

    try {
      await fetchWithTimeout(
        `${API_BASE_URL}/demands/${demandId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Finalizado" }),
        }
      );
      await message.reply("✅ Demanda finalizada com sucesso!");
      console.log(`[API] Demanda ${demandId} finalizada por ${userId}`);
    } catch (error) {
      console.error("[API ERROR] Erro ao finalizar demanda:", error);
      await message.reply("❌ Não foi possível finalizar a demanda. Verifique o ID e tente novamente.");
    }

    await sendMainMenu(message, userId);
  }

  async function handleQuestionsMenu(userId, message, messageText) {
    switch (messageText) {
      case "1":
        await message.reply(
          "👾Duvidas Gerais👾\n\nCaso tenha alguma duvida sobre treinamentos, horarios, planos de aula e demais ocasioes, entre em contato com o seu *COORDENADOR*."
        );
        await sendMainMenu(message, userId);
        break;

      case "2":
        await message.reply(
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
        await sendMainMenu(message, userId);
        break;

      case "3":
        await message.reply(
          `👾 *Dúvidas sobre Impressão 3D* 👾

A impressão 3D é uma tecnologia de fabricação aditiva que cria objetos tridimensionais a partir de modelos digitais, construindo-os camada por camada. Ela utiliza diferentes materiais, como plásticos (PLA, ABS, PETG), resinas e até metais, dependendo do tipo de impressora (FDM, SLA, SLS).

As principais vantagens incluem a personalização de peças, a redução de desperdícios e a possibilidade de fabricar objetos com designs complexos de forma rápida. É amplamente utilizada em áreas como prototipagem, indústria, medicina, educação e arte. No entanto, a impressão 3D pode enfrentar desafios como o custo inicial, tempo de impressão e a necessidade de manutenção constante.

- *Site Oficial*: [ultimaker.com](https://ultimaker.com/)
- *Plataforma de Cursos IP*: [learntechipcontrol.com](https://learntechipcontrol.com/login/index.php)
- *Plataforma de Modelagem*: [tinkercad.com](https://www.tinkercad.com/)
- *YouTube*: (https://www.youtube.com/results?search_query=impressao+3d)
- *Plataforma de Impressoes*: [thingeverse.com](https://www.thingiverse.com/tag:ultimaker)`
        );
        await sendMainMenu(message, userId);
        break;

      case "4":
        await sendMainMenu(message, userId);
        break;

      default:
        await message.reply("❌ Opção inválida. Digite um número de 1 a 4.");
        break;
    }
  }

  async function handleMaintenanceMenu(userId, message, messageText) {
    const session = getUserSession(userId);

    switch (messageText) {
      case "1":
        await message.reply(
          "👾Manutenção Outras👾\n\nCaso tenha alguma duvida, consulte seu coordenador ou utilize @Meta AI e faça a sua pergunta!!!"
        );
        // Usando await ao invés de setTimeout
        await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
        await sendMainMenu(message, userId);
        break;

      case "2":
        await sendMainMenu(message, userId);
        break;

      default:
        await message.reply("❌ Opção inválida. Digite 1 ou 2.");
        break;
    }
  }
});

// Gerando QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
