import type { ImovelComMidias } from "@/lib/types";

export type TunnelItem = {
  id: string;
  url: string;
  titulo: string;
  localizacao: string | null;
  vendida: boolean;
  imovel: ImovelComMidias;
};
