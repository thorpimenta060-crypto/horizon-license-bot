# 🔐 Sistema de Licenciamento Horizon VMS - Telegram Bot

**Autor:** Manus AI  
**Data:** 18 de Novembro de 2025

---

## ✅ O que foi implementado

Criei um sistema completo de licenciamento com controle remoto via bot do Telegram. Você pode ativar, desativar e gerenciar licenças de qualquer lugar usando apenas mensagens no Telegram.

---

## 🎯 Como Funciona

### 1. **Bot do Telegram** (Seu Painel de Controle)
Você controla tudo via comandos no Telegram:
- `/listar` - Ver todas as licenças
- `/adicionar` - Criar nova licença
- `/ativar CHAVE` - Ativar licença
- `/desativar CHAVE` - Desativar licença (cliente para em 24h)
- `/status CHAVE` - Ver detalhes de uma licença

### 2. **Sistema do Cliente** (Horizon VMS)
- Valida a licença a cada 24 horas automaticamente
- Se a licença estiver bloqueada, o sistema para de funcionar
- Cache de 48h para funcionar mesmo se o bot estiver offline temporariamente

---

## 📱 Como Usar o Bot

### Primeiro Acesso:

1. **Abra o Telegram**
2. **Procure pelo seu bot:** `@horizon_license_bot` (ou o nome que você escolheu)
3. **Envie:** `/start`
4. **Copie seu Chat ID** que aparecerá na mensagem

### Adicionar sua primeira licença:

```
/adicionar HORIZON-7540-EAF3-74CD-20261118|Team Horizon|teamhorizon.com.br|365
```

Isso cria uma licença válida por 365 dias (1 ano).

### Desativar se o cliente não pagar:

```
/desativar HORIZON-7540-EAF3-74CD-20261118
```

Em até 24h o sistema do cliente para de funcionar.

### Reativar quando o cliente pagar:

```
/ativar HORIZON-7540-EAF3-74CD-20261118
```

---

## 🔧 Integração no Servidor do Cliente

### Passo 1: Adicionar arquivo de validação

O arquivo `license-checker.ts` já foi copiado para:
```
/var/www/horizon-vms/server/license-checker.ts
```

### Passo 2: Configurar variáveis de ambiente

**IMPORTANTE:** Você precisa adicionar manualmente no arquivo `.env` do cliente:

```bash
# Conecte via SSH
ssh root@195.35.42.14

# Edite o arquivo .env
nano /var/www/horizon-vms/.env

# Adicione no final:
LICENSE_KEY=HORIZON-7540-EAF3-74CD-20261118
LICENSE_BOT_URL=https://api.telegram.org/bot8371496211:AAEb3etvEZ9MsfeGAwRnCD5htTWFoqrWKu4/sendMessage
DOMAIN=teamhorizon.com.br

# Salve: Ctrl+O, Enter, Ctrl+X
```

### Passo 3: Integrar no código

Edite `/var/www/horizon-vms/server/_core/index.ts`:

```typescript
// Adicione no início do arquivo
import { initializeLicenseValidation, checkLicense } from '../license-checker';

// Logo após as importações, adicione:
initializeLicenseValidation();
```

### Passo 4: Proteger rotas críticas

Edite `/var/www/horizon-vms/server/routers/client.ts`:

```typescript
// Adicione no início
import { checkLicense } from '../license-checker';

// Em cada procedure que cria VMs, adicione:
createVM: protectedProcedure
  .input(z.object({
    planId: z.number(),
    name: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Verificar licença ANTES de criar VM
    await checkLicense();
    
    // ... resto do código original
  }),
```

### Passo 5: Rebuild e restart

```bash
cd /var/www/horizon-vms
npm run build
sudo systemctl restart horizon-vms
```

### Passo 6: Verificar logs

```bash
sudo journalctl -u horizon-vms -f
```

Você deve ver:
```
[LICENSE] 🔄 Iniciando validação periódica...
[LICENSE] ✅ Licença válida até 2026-11-18
```

---

## 🚀 Manter o Bot Rodando 24/7

O bot está rodando temporariamente. Para mantê-lo online permanentemente, você tem 3 opções:

### Opção 1: Rodar na sua VPS (Recomendado)

```bash
# Copie os arquivos do bot para sua VPS
scp -r telegram-license-bot root@SUA_VPS:/root/

# Conecte na VPS
ssh root@SUA_VPS

# Instale dependências
cd /root/telegram-license-bot
npm install

# Instale PM2 para manter rodando
npm install -g pm2

# Inicie o bot
pm2 start bot.js --name horizon-license-bot

# Configure para iniciar automaticamente
pm2 startup
pm2 save
```

### Opção 2: Rodar no Servidor do Cliente

Mesmos comandos acima, mas na VPS do cliente (195.35.42.14).

### Opção 3: Usar serviço gratuito (Render.com, Railway, etc.)

Posso te ajudar a fazer deploy em um serviço gratuito se preferir.

---

## 🔑 Gerar Novas Chaves de Licença

Quando precisar gerar uma nova chave (renovação, novo cliente, etc.):

```bash
cd telegram-license-bot
node gen-key-simple.js
```

Isso gera:
```
HORIZON-XXXX-XXXX-XXXX-YYYYMMDD
2026-11-18
```

Depois adicione no bot:
```
/adicionar CHAVE|NOME_CLIENTE|DOMINIO|DIAS
```

---

## 📊 Comandos Úteis do Bot

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/start` | Iniciar bot e ver comandos | `/start` |
| `/listar` | Ver todas as licenças | `/listar` |
| `/adicionar` | Criar nova licença | `/adicionar CHAVE\|Cliente\|dominio.com\|30` |
| `/ativar CHAVE` | Ativar licença | `/ativar HORIZON-ABC123` |
| `/desativar CHAVE` | Desativar licença | `/desativar HORIZON-ABC123` |
| `/status CHAVE` | Ver detalhes | `/status HORIZON-ABC123` |
| `/estatisticas` | Ver resumo | `/estatisticas` |

---

## ⚠️ Pontos Importantes

### Segurança
- ✅ Nunca compartilhe o token do bot
- ✅ Configure o `ADMIN_CHAT_ID` no `.env` do bot para restringir acesso
- ✅ O bot só responde para você

### Funcionamento
- ✅ Cliente valida a cada 24h automaticamente
- ✅ Se você desativar, cliente para em até 24h
- ✅ Cache de 48h permite funcionamento offline temporário
- ✅ Mensagens claras para o cliente quando licença estiver inválida

### Renovação
- ✅ Gere nova chave com nova data
- ✅ Adicione no bot
- ✅ Cliente atualiza no `.env`
- ✅ Reinicia o serviço

---

## 🎉 Resumo do que Você Tem Agora

✅ **Bot do Telegram funcionando** - Controle total via mensagens  
✅ **Sistema de validação criado** - Pronto para integrar  
✅ **Chave de licença gerada** - Válida por 1 ano  
✅ **Gerador de chaves** - Crie quantas precisar  
✅ **Documentação completa** - Tudo explicado passo a passo  

---

## 📝 Próximos Passos

1. ✅ **Adicionar licença no bot** (já feito)
2. ⏳ **Configurar .env no servidor do cliente** (manual)
3. ⏳ **Integrar código no Horizon VMS** (manual)
4. ⏳ **Testar criação de VM** (verificar se valida)
5. ⏳ **Mover bot para VPS permanente** (opcional)

---

## 🆘 Suporte

Se tiver qualquer dúvida ou problema, me avise!

**Token do Bot:** `8371496211:AAEb3etvEZ9MsfeGAwRnCD5htTWFoqrWKu4`  
**Chave do Cliente:** `HORIZON-7540-EAF3-74CD-20261118`  
**Expira em:** `2026-11-18`
