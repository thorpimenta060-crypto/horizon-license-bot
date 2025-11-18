# 🚀 Deploy do Bot no Render.com

## Passo a Passo:

### 1. Criar conta no Render.com
- Acesse: https://render.com
- Clique em "Get Started"
- Faça login com GitHub (recomendado)

### 2. Criar repositório no GitHub

**Opção A: Via Interface Web**
1. Acesse: https://github.com/new
2. Nome do repositório: `horizon-license-bot`
3. Deixe como **Private**
4. Clique em "Create repository"

**Opção B: Via Linha de Comando**
```bash
# Crie um repositório no GitHub primeiro via web
# Depois execute:
cd /home/ubuntu/telegram-license-bot
git remote add origin https://github.com/SEU_USUARIO/horizon-license-bot.git
git branch -M main
git push -u origin main
```

### 3. Fazer Deploy no Render

1. **No Render Dashboard**, clique em "New +" → "Web Service"

2. **Conecte seu repositório GitHub:**
   - Autorize o Render a acessar seus repositórios
   - Selecione `horizon-license-bot`

3. **Configure o serviço:**
   - **Name:** `horizon-license-bot`
   - **Environment:** `Docker`
   - **Plan:** `Free`
   - **Branch:** `main`

4. **Adicione variáveis de ambiente:**
   - Clique em "Advanced"
   - Adicione:
     * `TELEGRAM_BOT_TOKEN` = `8371496211:AAEb3etvEZ9MsfeGAwRnCD5htTWFoqrWKu4`
     * `ADMIN_CHAT_ID` = (deixe vazio por enquanto)

5. **Clique em "Create Web Service"**

6. **Aguarde o deploy** (leva 2-3 minutos)

7. **Pronto!** O bot estará rodando 24/7 gratuitamente

---

## 📱 Configurar ADMIN_CHAT_ID (Opcional mas Recomendado)

Para que apenas você possa usar o bot:

1. **Abra o Telegram**
2. **Procure por:** `@userinfobot`
3. **Envie:** `/start`
4. **Copie seu Chat ID** (ex: `123456789`)
5. **No Render:**
   - Vá em "Environment"
   - Edite `ADMIN_CHAT_ID`
   - Cole seu Chat ID
   - Clique em "Save Changes"

---

## ✅ Verificar se está funcionando

1. **Abra o Telegram**
2. **Procure seu bot**
3. **Envie:** `/start`
4. **Deve responder** com a mensagem de boas-vindas

Se não responder, verifique os logs no Render Dashboard.

---

## 🔄 Atualizar o Bot

Sempre que fizer mudanças:

```bash
cd /home/ubuntu/telegram-license-bot
git add .
git commit -m "Atualização"
git push
```

O Render fará deploy automático!

---

## 💡 Alternativa Mais Simples

Se não quiser usar GitHub, você pode fazer upload direto:

1. Compacte a pasta: `telegram-license-bot.zip`
2. No Render, escolha "Deploy from Git" → "Upload Repository"
3. Faça upload do ZIP

Mas com GitHub é melhor pois você pode atualizar facilmente depois.
