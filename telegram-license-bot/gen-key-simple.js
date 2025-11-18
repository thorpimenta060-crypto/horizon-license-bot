const crypto = require('crypto');

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length).toUpperCase();
}

// Calcular data de expiração (1 ano)
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 365);
const dateStr = expiryDate.toISOString().split('T')[0].replace(/-/g, '');

// Gerar chave
const part1 = generateRandomString(4);
const part2 = generateRandomString(4);
const part3 = generateRandomString(4);
const licenseKey = `HORIZON-${part1}-${part2}-${part3}-${dateStr}`;

console.log(licenseKey);
console.log(expiryDate.toISOString().split('T')[0]);
