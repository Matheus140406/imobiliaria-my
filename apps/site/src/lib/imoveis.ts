import { createClient } from "@imobiliaria/db/client";
import type { ImovelComMidias } from "./types";

const SELECT_IMOVEL =
  "*, corretor:corretores_publico(nome, whatsapp), midias(id, url, tipo, ordem, thumbnail_url)";

export async function getImoveisDisponiveis(): Promise<ImovelComMidias[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_IMOVEL)
    .eq("status", "disponivel")
    .is("deletado_em", null)
    .order("criado_em", { ascending: false })
    .order("ordem", { referencedTable: "midias", ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ImovelComMidias[];
}

export async function getImoveisVendidos(): Promise<ImovelComMidias[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_IMOVEL)
    .eq("status", "ocupada")
    .is("deletado_em", null)
    .order("data_venda", { ascending: false, nullsFirst: false })
    .order("ordem", { referencedTable: "midias", ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ImovelComMidias[];
}

export async function getImovelPorSlug(
  slug: string,
): Promise<ImovelComMidias | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_IMOVEL)
    .eq("slug", slug)
    .is("deletado_em", null)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ImovelComMidias | null;
}
