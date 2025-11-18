#!/bin/bash

echo "═══════════════════════════════════════════════"
echo "  🔐 Instalação do Sistema de Licenciamento"
echo "  Horizon VMS - Automático"
echo "═══════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "/var/www/horizon-vms/package.json" ]; then
    echo -e "${RED}❌ Erro: Horizon VMS não encontrado em /var/www/horizon-vms${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Passo 1: Fazendo backup do .env atual...${NC}"
cp /var/www/horizon-vms/.env /var/www/horizon-vms/.env.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Backup criado${NC}"
echo ""

echo -e "${YELLOW}📝 Passo 2: Adicionando configurações de licença ao .env...${NC}"
cat >> /var/www/horizon-vms/.env << 'EOF'

# ═══════════════════════════════════════════════
# Sistema de Licenciamento - Adicionado automaticamente
# ═══════════════════════════════════════════════
LICENSE_KEY=HORIZON-7540-EAF3-74CD-20261118
LICENSE_BOT_URL=https://api.telegram.org/bot8371496211:AAEb3etvEZ9MsfeGAwRnCD5htTWFoqrWKu4/sendMessage
DOMAIN=teamhorizon.com.br
EOF
echo -e "${GREEN}✅ Configurações adicionadas${NC}"
echo ""

echo -e "${YELLOW}📦 Passo 3: Copiando arquivo de validação...${NC}"
# O arquivo license-checker.ts já deve estar no servidor
if [ ! -f "/var/www/horizon-vms/server/license-checker.ts" ]; then
    echo -e "${RED}⚠️  Arquivo license-checker.ts não encontrado${NC}"
    echo -e "${YELLOW}   Você precisa copiar manualmente ou eu posso te ajudar${NC}"
else
    echo -e "${GREEN}✅ Arquivo de validação encontrado${NC}"
fi
echo ""

echo -e "${YELLOW}🔧 Passo 4: Instalando dependência axios...${NC}"
cd /var/www/horizon-vms
npm install axios
echo -e "${GREEN}✅ Dependência instalada${NC}"
echo ""

echo -e "${YELLOW}🏗️  Passo 5: Rebuilding do projeto...${NC}"
npm run build
echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

echo -e "${YELLOW}🔄 Passo 6: Reiniciando serviço...${NC}"
systemctl restart horizon-vms
sleep 3
echo -e "${GREEN}✅ Serviço reiniciado${NC}"
echo ""

echo -e "${YELLOW}📊 Passo 7: Verificando status...${NC}"
systemctl status horizon-vms --no-pager | head -20
echo ""

echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ INSTALAÇÃO CONCLUÍDA!${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Verifique os logs:"
echo "   sudo journalctl -u horizon-vms -f"
echo ""
echo "2. Procure por:"
echo "   [LICENSE] 🔄 Iniciando validação periódica..."
echo "   [LICENSE] ✅ Licença válida até 2026-11-18"
echo ""
echo "3. Teste criar uma VM no sistema"
echo ""
echo "═══════════════════════════════════════════════"
echo ""
echo "🔑 Informações da Licença:"
echo "   Chave: HORIZON-7540-EAF3-74CD-20261118"
echo "   Cliente: Team Horizon"
echo "   Domínio: teamhorizon.com.br"
echo "   Expira: 2026-11-18"
echo ""
echo "═══════════════════════════════════════════════"
