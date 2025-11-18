#!/bin/bash

echo "═══════════════════════════════════════════════"
echo "  Configuração do .env - Horizon VMS"
echo "═══════════════════════════════════════════════"
echo ""
echo "Execute este script NA VPS DO CLIENTE:"
echo "ssh root@195.35.42.14"
echo ""
echo "Depois cole estes comandos:"
echo ""
echo "═══════════════════════════════════════════════"
echo ""

cat << 'EOF'
# Fazer backup do .env atual
cp /var/www/horizon-vms/.env /var/www/horizon-vms/.env.backup

# Adicionar configurações de licença
cat >> /var/www/horizon-vms/.env << 'ENVEOF'

# ═══════════════════════════════════════════════
# Sistema de Licenciamento
# ═══════════════════════════════════════════════
LICENSE_KEY=HORIZON-7540-EAF3-74CD-20261118
LICENSE_BOT_URL=https://api.telegram.org/bot8371496211:AAEb3etvEZ9MsfeGAwRnCD5htTWFoqrWKu4/sendMessage
DOMAIN=teamhorizon.com.br
ENVEOF

echo "✅ Configurações adicionadas ao .env"
echo ""
echo "Verificando..."
tail -10 /var/www/horizon-vms/.env
EOF

echo ""
echo "═══════════════════════════════════════════════"
echo ""
echo "Depois de executar, reinicie o serviço:"
echo "sudo systemctl restart horizon-vms"
echo ""
echo "E verifique os logs:"
echo "sudo journalctl -u horizon-vms -f"
echo ""
echo "═══════════════════════════════════════════════"
