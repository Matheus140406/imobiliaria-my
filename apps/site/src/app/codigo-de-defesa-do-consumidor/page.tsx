import type { Metadata } from "next";
import Link from "next/link";
import { ScrollParaTopo } from "@/components/ScrollParaTopo";

export const metadata: Metadata = {
  title: "Direitos do Consumidor",
  description:
    "Resumo dos direitos do consumidor aplicáveis a serviços de intermediação imobiliária, conforme o Código de Defesa do Consumidor (Lei nº 8.078/1990).",
  alternates: { canonical: "/codigo-de-defesa-do-consumidor" },
};

export default function CodigoDeDefesaDoConsumidorPage() {
  return (
    <div className="legal-page" id="conteudo-principal" tabIndex={-1} style={{ outline: "none" }}>
      <ScrollParaTopo />
      <div className="legal-page-inner">
        <Link href="/" className="legal-page-back">
          ← Voltar ao site
        </Link>
        <h1>Direitos do Consumidor</h1>
        <p className="legal-page-updated">Última atualização: 16 de julho de 2026</p>

        <p>
          A Imobiliária M&amp;Y atua em conformidade com o Código de Defesa do
          Consumidor (Lei nº 8.078/1990). Este resumo tem caráter informativo e
          não substitui a leitura da legislação nem o contrato específico firmado
          em cada negociação.
        </p>

        <h2>Direito à informação clara</h2>
        <p>
          Você tem direito a receber informações claras, precisas e ostensivas
          sobre os imóveis anunciados, incluindo características, condições de
          pagamento, valores e eventuais restrições, antes da formalização de
          qualquer negócio.
        </p>

        <h2>Transparência nas condições</h2>
        <p>
          Preços, condições de financiamento e disponibilidade divulgados neste
          site são informativos e podem ser atualizados sem aviso prévio. As
          condições definitivas de cada negociação são formalizadas em contrato
          específico entre as partes.
        </p>

        <h2>Direito de arrependimento</h2>
        <p>
          Em contratações realizadas fora do estabelecimento comercial (por
          exemplo, exclusivamente à distância), aplica-se o direito de
          arrependimento previsto no art. 49 do CDC, dentro do prazo legal de 7
          dias corridos a contar da assinatura do contrato ou do recebimento do
          serviço.
        </p>

        <h2>Atendimento e canais de contato</h2>
        <p>
          Dúvidas, solicitações ou reclamações podem ser encaminhadas diretamente
          ao corretor responsável pelo WhatsApp informado no rodapé deste site,
          ou pelo e-mail{" "}
          <a href="mailto:emanoel.tecedif@gmail.com">emanoel.tecedif@gmail.com</a>.
          Buscamos responder a todas as solicitações com transparência e dentro
          de prazo razoável.
        </p>

        <h2>Vinculação contratual</h2>
        <p>
          As informações disponibilizadas neste site têm caráter publicitário e
          não constituem, por si só, proposta vinculante, nos termos da
          legislação vigente. Os direitos e deveres específicos de cada
          negociação são definidos no contrato firmado entre as partes.
        </p>
      </div>
    </div>
  );
}
