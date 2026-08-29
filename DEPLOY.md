# Deploy AnjosDevOS no Vercel

## Pre-requisitos
- Conta gratuita em https://vercel.com
- Repositorio no GitHub com o codigo do AnjosDevOS
- (Opcional) Chaves de API dos provedores de IA

---

## Passo 1 — Subir o codigo para o GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/anjosdevos.git
git push -u origin main
```

---

## Passo 2 — Importar no Vercel

1. Acesse https://vercel.com/new
2. Clique em **Import Git Repository**
3. Selecione o repositorio `anjosdevos`
4. Framework preset: **Next.js** (detectado automaticamente)
5. Clique em **Deploy**

---

## Passo 3 — Variaveis de Ambiente

No painel do Vercel (Settings > Environment Variables), adicione:

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | OpenAI GPT-4 | Nao |
| `ANTHROPIC_API_KEY` | Claude | Nao |
| `GOOGLE_API_KEY` | Gemini | Nao |
| `DEEPSEEK_API_KEY` | DeepSeek | Nao |
| `GROQ_API_KEY` | Groq (Llama) | Nao |
| `XAI_API_KEY` | xAI Grok | Nao |
| `TOGETHER_API_KEY` | Together AI | Nao |
| `OPENROUTER_API_KEY` | OpenRouter | Nao |
| `MISTRAL_API_KEY` | Mistral | Nao |
| `COHERE_API_KEY` | Cohere | Nao |

> Adicione pelo menos uma chave para ativar os agentes de IA.

---

## Passo 4 — Headers COOP/COEP (WebContainers)

O `vercel.json` na raiz do projeto ja configura os headers necessarios.
Nao e preciso fazer nada extra.

---

## Resultado

Apos o deploy:
- URL: `https://anjosdevos.vercel.app` (ou dominio customizado)
- Auto-deploy a cada `git push main`
- HTTPS automatico
- Edge Network global

---

## Deploy com Docker (alternativa)

```bash
docker build -t anjosdevos .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  anjosdevos
```

Ou com docker-compose:

```bash
# Edite o .env com suas chaves
cp .env.example .env
docker-compose up -d
```

---

## Dominio Customizado

1. Vercel > Settings > Domains
2. Adicione seu dominio (ex: `os.seudominio.com.br`)
3. Configure o CNAME no seu DNS apontando para `cname.vercel-dns.com`