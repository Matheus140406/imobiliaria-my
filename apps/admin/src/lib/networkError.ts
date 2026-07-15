/**
 * Heurística para reconhecer falhas de rede (sem internet) e diferenciá-las
 * de erros "normais" do Supabase (validação, RLS, etc). Não é 100% precisa
 * (não existe forma garantida de saber a causa de todo erro de fetch), mas
 * cobre os casos comuns: `TypeError: Failed to fetch` do navegador e o
 * `navigator.onLine` mudando para `false` durante a operação.
 */
export function pareceErroDeRede(erro: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;

  if (erro instanceof TypeError) return true;

  const mensagem =
    erro instanceof Error
      ? erro.message
      : typeof erro === "string"
        ? erro
        : "";

  return /fetch|network|conex(ã|a)o|internet/i.test(mensagem);
}
