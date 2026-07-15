import type { Tables } from "@imobiliaria/db/types";

export type Midia = Pick<
  Tables<"midias">,
  "id" | "url" | "tipo" | "ordem" | "thumbnail_url"
>;

export type CorretorPublico = {
  nome: string | null;
  whatsapp: string | null;
} | null;

export type ImovelComMidias = Tables<"imoveis"> & {
  midias: Midia[];
  corretor: CorretorPublico;
};
