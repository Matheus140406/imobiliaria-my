# Deploy — Imobiliária M&Y

Este monorepo tem duas aplicações Next.js (`apps/site` e `apps/admin`) que
compartilham `packages/db`. O CI/CD já está preparado; falta só conectar as
contas (isso não foi feito automaticamente — nenhum push ou deploy real foi
disparado).

## 1. Subir pro GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/imobiliaria-my.git
git add .
git commit -m "Setup inicial do projeto"
git push -u origin main
```

A partir daí, todo `git push` roda o workflow `.github/workflows/ci.yml`
automaticamente: instala as dependências e builda as duas apps (`site` e
`admin`) pra garantir que nada quebrou antes de ir pro ar.

**Secrets do GitHub Actions** (Settings → Secrets and variables → Actions):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

(valores em `apps/site/.env.local` / `apps/admin/.env.local` — são públicos,
não são segredo de verdade, mas ficam como secret do GH só por organização)

## 2. Conectar na Vercel (recomendado, é quem já tem `vercel.json` pronto)

Como são duas aplicações no mesmo repositório, crie **dois projetos Vercel**
apontando pro mesmo repositório GitHub:

1. Import Project → selecione o repositório.
2. Em "Root Directory", escolha `apps/site` → nome do projeto ex.
   `imobiliaria-my-site`.
3. Repita o import, dessa vez com Root Directory `apps/admin` → nome ex.
   `imobiliaria-my-admin`.
4. Em cada projeto, adicione as environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Pronto — a partir do próximo `git push` na branch `main`, a Vercel builda
   e publica as duas apps automaticamente (preview em PRs, produção em
   `main`).

## 3. Alternativa: Netlify

Mesma lógica (dois "sites" apontando pro mesmo repo, um com base directory
`apps/site` e outro `apps/admin`, build command `npm run build`, publish
directory `.next`, e o plugin oficial `@netlify/plugin-nextjs`).

## Observação sobre o nome da pasta local

O ambiente de desenvolvimento local está em uma pasta com "&" no nome
(`ImobiliariaM&Y`), o que quebra o `npm run` no Windows (bug do `cmd.exe`
com esse caractere). Isso é só uma limitação da máquina de desenvolvimento —
não afeta o GitHub Actions nem a Vercel/Netlify, que fazem checkout em
diretórios próprios sem esse problema.
