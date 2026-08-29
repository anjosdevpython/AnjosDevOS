# ⚡ Manual do Automation Studio — AnjosDevOS

O **Automation Studio** é a central de automação e orquestração de workflows do AnjosDevOS, permitindo que desenvolvedores criem pipelines inteligentes que combinam gatilhos de eventos, ações de agentes de IA e integrações externas.

---

## 1. Conceitos Fundamentais

Um fluxo de automação no AnjosDevOS é composto por:

- **Gatilhos (Triggers):** Eventos que iniciam a execução do fluxo (ex: Agendamento Cron, Webhook HTTP, Git Push, PR Aberto ou Disparo Manual).
- **Ações (Actions):** Tarefas executadas por nós de código ou agentes especialistas (ex: AnjosReviewer auditando repositório, AnjosAutoPilot extraindo dados web).
- **Condicionais (Conditions):** Nós de decisão baseados em critérios (ex: `Score de Segurança > 80?`).
- **Saídas (Outputs):** Disparos de notificação, escrita em arquivos ou webhooks de terceiros (Discord, Slack, WhatsApp).

---

## 2. Criando um Fluxo com IA (Prompt-to-Flow)

O AnjosDevOS possui um gerador de fluxos em linguagem natural alimentado pelo `AnjosAutoPilot`:

1. Abra o app **⚡ Automação** no AnjosDevOS.
2. Na barra superior, digite a descrição do pipeline desejado. Exemplos:
   - *"Monitorar commits na branch main, rodar auditoria de segurança e notificar no Slack"*
   - *"Extrair dados diários de cotações às 08:00, resumir com AnjosDocs e enviar via Webhook"*
3. Clique em **Criar com IA**. O `AnjosAutoPilot` gerará instantaneamente os nós e conexões no canvas visual.

---

## 3. Execução Interativa em Tempo Real

Ao clicar no botão **▶️ Executar Fluxo**:

1. O motor de execução percorre a cadeia de nós na ordem das conexões.
2. Cada nó ativo tem seu status alterado para `running` (amarelo pulsante) e, em seguida, para `success` (verde neon).
3. O terminal inferior registra os logs de telemetria em tempo real com tempos de resposta em milissegundos.
4. Ao término, os contadores de execuções e a data da última execução são atualizados automaticamente.

---

## 4. Executando Automações via Terminal

Você também pode gerenciar e disparar automações através do **Terminal**:

```bash
# Listar fluxos configurados
allan@anjosdevos:~$ flows

# Disparar um enxame de automação
allan@anjosdevos:~$ swarm "Criar pipeline de deploy para Kubernetes com healthcheck"
```
