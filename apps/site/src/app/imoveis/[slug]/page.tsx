import { redirect } from "next/navigation";
import { getImovelPorSlug } from "@/lib/imoveis";

// Mesma razão do app/page.tsx: sem isso, essa rota pode ser cacheada pela
// Vercel e redirecionar um visitante pra um imóvel já removido/vendido
// como se ainda existisse.
export const dynamic = "force-dynamic";

export default async function ImovelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const imovel = await getImovelPorSlug(slug);

  if (!imovel) {
    redirect("/?imovel_indisponivel=1");
  }

  // Ainda não existe uma página de detalhe dedicada: o site mostra os
  // imóveis no túnel 3D e na grade da home. Leva o visitante direto pra lá.
  redirect(`/#imoveis`);
}
