/**
 * Gerador de Chaves de Licença - Horizon VMS
 * Use este script para gerar novas chaves de licença
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length).toUpperCase();
}

function generateLicenseKey(clientName, days) {
  // Calcular data de expiração
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + parseInt(days));
  
  // Formato: YYYYMMDD
  const dateStr = expiryDate.toISOString().split('T')[0].replace(/-/g, '');
  
  // Gerar partes da chave
  const part1 = generateRandomString(4);
  const part2 = generateRandomString(4);
  const part3 = generateRandomString(4);
  
  // Chave final: HORIZON-XXXX-XXXX-XXXX-YYYYMMDD
  const licenseKey = `HORIZON-${part1}-${part2}-${part3}-${dateStr}`;
  
  return {
    key: licenseKey,
    expiresAt: expiryDate.toISOString().split('T')[0],
    clientName
  };
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   🔑 Gerador de Chaves de Licença - Horizon VMS');
  console.log('═══════════════════════════════════════════════\n');
  
  const clientName = await question('👤 Nome do Cliente: ');
  const domain = await question('🌐 Domínio (ex: teamhorizon.com.br): ');
  const days = await question('📅 Validade em dias (ex: 30): ');
  
  console.log('\n⏳ Gerando chave...\n');
  
  const license = generateLicenseKey(clientName, days);
  
  console.log('═══════════════════════════════════════════════');
  console.log('✅ CHAVE GERADA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('📋 INFORMAÇÕES DA LICENÇA:\n');
  console.log(`   🔑 Chave: ${license.key}`);
  console.log(`   👤 Cliente: ${clientName}`);
  console.log(`   🌐 Domínio: ${domain}`);
  console.log(`   📅 Expira em: ${license.expiresAt}`);
  console.log(`   ⏱️  Válida por: ${days} dias`);
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📝 PRÓXIMOS PASSOS:');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('1️⃣  Adicione a licença no bot do Telegram:');
  console.log(`   /adicionar ${license.key}|${clientName}|${domain}|${days}\n`);
  
  console.log('2️⃣  Configure no .env do cliente:');
  console.log(`   LICENSE_KEY=${license.key}\n`);
  
  console.log('3️⃣  Reinicie o serviço do cliente:');
  console.log('   sudo systemctl restart horizon-vms\n');
  
  console.log('═══════════════════════════════════════════════\n');
  
  rl.close();
}

main().catch(console.error);
