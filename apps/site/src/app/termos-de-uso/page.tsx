import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do site da Imobiliária M&Y.",
  alternates: { canonical: "/termos-de-uso" },
};

export default function TermosDeUsoPage() {
  return (
    <div className="legal-page" id="conteudo-principal" tabIndex={-1} style={{ outline: "none" }}>
      <div className="legal-page-inner">
        <Link href="/" className="legal-page-back">
          ← Voltar ao site
        </Link>
        <h1>Termos de Uso</h1>
        <p className="legal-page-updated">Última atualização: 16 de julho de 2026</p>

        <h2>1. Aceitação dos termos</h2>
        <p>
          Ao acessar e utilizar este site, você concorda com os termos descritos
          nesta página. Caso não concorde, recomendamos que não utilize o site.
        </p>

        <h2>2. Caráter das informações</h2>
        <p>
          As informações, imagens e valores exibidos neste site têm caráter
          publicitário e meramente ilustrativo. Não constituem proposta
          vinculante e estão sujeitas a alteração, atualização cadastral ou
          indisponibilidade sem aviso prévio.
        </p>

        <h2>3. Uso permitido</h2>
        <p>
          O conteúdo deste site pode ser acessado para fins pessoais e não
          comerciais relacionados à busca por imóveis. É vedada a reprodução,
          distribuição ou uso comercial do conteúdo sem autorização prévia da
          Imobiliária M&amp;Y.
        </p>

        <h2>4. Propriedade intelectual</h2>
        <p>
          A marca, o layout e os textos originais deste site pertencem à
          Imobiliária M&amp;Y. Fotos de imóveis podem pertencer aos respectivos
          proprietários ou anunciantes.
        </p>

        <h2>5. Limitação de responsabilidade</h2>
        <p>
          Envidamos esforços para manter as informações atualizadas, mas não nos
          responsabilizamos por eventuais desatualizações momentâneas de preço,
          disponibilidade ou características dos imóveis anunciados.
        </p>

        <h2>6. Alterações</h2>
        <p>
          Estes termos podem ser atualizados periodicamente. A data da última
          atualização está indicada no topo desta página.
        </p>

        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre estes termos podem ser enviadas para{" "}
          <a href="mailto:emanoel.tecedif@gmail.com">emanoel.tecedif@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
