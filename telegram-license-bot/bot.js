/**
 * Horizon VMS License Bot - Telegram
 * Bot para gerenciar licenças remotamente via Telegram
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Configurações
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'SEU_TOKEN_AQUI';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || ''; // Seu chat ID do Telegram
const LICENSES_FILE = path.join(__dirname, 'licenses.json');

// Inicializar bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Estrutura de dados das licenças
let licenses = loadLicenses();

function loadLicenses() {
  try {
    if (fs.existsSync(LICENSES_FILE)) {
      return JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Erro ao carregar licenças:', error);
  }
  return {};
}

function saveLicenses() {
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(licenses, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar licenças:', error);
    return false;
  }
}

// Verificar se usuário é admin
function isAdmin(chatId) {
  if (!ADMIN_CHAT_ID) return true; // Se não configurado, permite todos
  return chatId.toString() === ADMIN_CHAT_ID.toString();
}

// Comando: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado. Este bot é privado.');
    return;
  }

  const welcomeMessage = `
🔐 *Horizon License Manager*

Bem-vindo ao sistema de gerenciamento de licenças!

*Comandos disponíveis:*

📋 /listar - Ver todas as licenças
➕ /adicionar - Adicionar nova licença
✅ /ativar CHAVE - Ativar licença
❌ /desativar CHAVE - Desativar licença
🔍 /status CHAVE - Ver status de uma licença
🗑️ /remover CHAVE - Remover licença
📊 /estatisticas - Ver estatísticas

*Seu Chat ID:* \`${chatId}\`
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando: /listar
bot.onText(/\/listar/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const licenseKeys = Object.keys(licenses);
  
  if (licenseKeys.length === 0) {
    bot.sendMessage(chatId, '📭 Nenhuma licença cadastrada ainda.');
    return;
  }

  let message = '📋 *Licenças Cadastradas:*\n\n';
  
  licenseKeys.forEach(key => {
    const license = licenses[key];
    const statusEmoji = license.status === 'active' ? '✅' : '❌';
    const expiresAt = new Date(license.expiresAt);
    const isExpired = expiresAt < new Date();
    
    message += `${statusEmoji} \`${key}\`\n`;
    message += `   Cliente: ${license.clientName}\n`;
    message += `   Domínio: ${license.domain}\n`;
    message += `   Expira: ${license.expiresAt} ${isExpired ? '⚠️ EXPIRADA' : ''}\n`;
    message += `   Status: ${license.status === 'active' ? 'Ativa' : 'Bloqueada'}\n\n`;
  });
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Comando: /adicionar
bot.onText(/\/adicionar/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const message = `
➕ *Adicionar Nova Licença*

Use o formato:
\`/adicionar CHAVE|CLIENTE|DOMINIO|DIAS\`

*Exemplo:*
\`/adicionar HORIZON-ABC123|Team Horizon|teamhorizon.com.br|30\`

Isso criará uma licença válida por 30 dias.
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Processar adição de licença
bot.onText(/\/adicionar (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const params = match[1].split('|');
  
  if (params.length !== 4) {
    bot.sendMessage(chatId, '❌ Formato inválido. Use: /adicionar CHAVE|CLIENTE|DOMINIO|DIAS');
    return;
  }

  const [key, clientName, domain, days] = params.map(p => p.trim());
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(days));
  
  licenses[key] = {
    clientName,
    domain,
    status: 'active',
    expiresAt: expiresAt.toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  if (saveLicenses()) {
    bot.sendMessage(chatId, `✅ Licença adicionada com sucesso!\n\n🔑 Chave: \`${key}\`\n👤 Cliente: ${clientName}\n🌐 Domínio: ${domain}\n📅 Expira: ${licenses[key].expiresAt}`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, '❌ Erro ao salvar licença.');
  }
});

// Comando: /ativar
bot.onText(/\/ativar (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const key = match[1].trim();
  
  if (!licenses[key]) {
    bot.sendMessage(chatId, `❌ Licença \`${key}\` não encontrada.`, { parse_mode: 'Markdown' });
    return;
  }
  
  licenses[key].status = 'active';
  
  if (saveLicenses()) {
    bot.sendMessage(chatId, `✅ Licença \`${key}\` ativada!\n\nCliente: ${licenses[key].clientName}`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, '❌ Erro ao salvar alteração.');
  }
});

// Comando: /desativar
bot.onText(/\/desativar (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const key = match[1].trim();
  
  if (!licenses[key]) {
    bot.sendMessage(chatId, `❌ Licença \`${key}\` não encontrada.`, { parse_mode: 'Markdown' });
    return;
  }
  
  licenses[key].status = 'blocked';
  
  if (saveLicenses()) {
    bot.sendMessage(chatId, `🚫 Licença \`${key}\` DESATIVADA!\n\nCliente: ${licenses[key].clientName}\n\n⚠️ O sistema do cliente será bloqueado em até 24 horas.`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, '❌ Erro ao salvar alteração.');
  }
});

// Comando: /status
bot.onText(/\/status (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const key = match[1].trim();
  
  if (!licenses[key]) {
    bot.sendMessage(chatId, `❌ Licença \`${key}\` não encontrada.`, { parse_mode: 'Markdown' });
    return;
  }
  
  const license = licenses[key];
  const statusEmoji = license.status === 'active' ? '✅' : '❌';
  const expiresAt = new Date(license.expiresAt);
  const isExpired = expiresAt < new Date();
  
  const message = `
${statusEmoji} *Status da Licença*

🔑 Chave: \`${key}\`
👤 Cliente: ${license.clientName}
🌐 Domínio: ${license.domain}
📅 Expira: ${license.expiresAt} ${isExpired ? '⚠️ EXPIRADA' : ''}
🔄 Status: ${license.status === 'active' ? '✅ Ativa' : '❌ Bloqueada'}
📆 Criada: ${license.createdAt}
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Comando: /estatisticas
bot.onText(/\/estatisticas/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  const total = Object.keys(licenses).length;
  const active = Object.values(licenses).filter(l => l.status === 'active').length;
  const blocked = Object.values(licenses).filter(l => l.status === 'blocked').length;
  const expired = Object.values(licenses).filter(l => new Date(l.expiresAt) < new Date()).length;
  
  const message = `
📊 *Estatísticas*

📋 Total de licenças: ${total}
✅ Ativas: ${active}
❌ Bloqueadas: ${blocked}
⚠️ Expiradas: ${expired}
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// API para validação (usado pelo cliente)
bot.on('message', (msg) => {
  // Ignorar comandos
  if (msg.text && msg.text.startsWith('/')) return;
  
  // Processar requisições de validação do sistema cliente
  try {
    const data = JSON.parse(msg.text);
    
    if (data.action === 'validate') {
      const license = licenses[data.licenseKey];
      
      if (!license) {
        bot.sendMessage(msg.chat.id, JSON.stringify({
          valid: false,
          error: 'License not found'
        }));
        return;
      }
      
      const expiresAt = new Date(license.expiresAt);
      const isExpired = expiresAt < new Date();
      
      bot.sendMessage(msg.chat.id, JSON.stringify({
        valid: license.status === 'active' && !isExpired,
        status: license.status,
        expiresAt: license.expiresAt,
        message: license.status === 'active' && !isExpired ? 'License valid' : 'License invalid or expired'
      }));
    }
  } catch (e) {
    // Não é uma requisição de validação, ignorar
  }
});

console.log('🤖 Bot do Telegram iniciado!');
console.log('📋 Licenças carregadas:', Object.keys(licenses).length);
