import type { Metadata } from "next";
import Link from "next/link";
import { ScrollParaTopo } from "@/components/ScrollParaTopo";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da Imobiliária M&Y, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="legal-page" id="conteudo-principal" tabIndex={-1} style={{ outline: "none" }}>
      <ScrollParaTopo />
      <div className="legal-page-inner">
        <Link href="/" className="legal-page-back">
          ← Voltar ao site
        </Link>
        <h1>Política de Privacidade</h1>
        <p className="legal-page-updated">Última atualização: 16 de julho de 2026</p>

        <h2>1. Introdução</h2>
        <p>
          Esta Política de Privacidade descreve como a Imobiliária M&amp;Y coleta,
          usa, armazena e protege os dados pessoais dos visitantes deste site e dos
          clientes atendidos por nossa equipe, em conformidade com a Lei Geral de
          Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>2. Dados coletados</h2>
        <p>Podemos coletar as seguintes categorias de dados:</p>
        <ul>
          <li>Dados de identificação e contato: nome e número de WhatsApp, informados voluntariamente em formulários de interesse em imóveis.</li>
          <li>Dados de navegação: páginas visitadas, tempo de permanência e origem do acesso, coletados por meio de cookies e ferramentas de análise.</li>
        </ul>

        <h2>3. Finalidade do tratamento</h2>
        <p>Os dados coletados são utilizados para:</p>
        <ul>
          <li>Responder a solicitações de contato e interesse em imóveis;</li>
          <li>Encaminhar sua solicitação ao corretor responsável via WhatsApp;</li>
          <li>Melhorar a experiência de navegação e o desempenho do site;</li>
          <li>Cumprir obrigações legais e regulatórias aplicáveis à atividade imobiliária.</li>
        </ul>

        <h2>4. Base legal</h2>
        <p>
          O tratamento de dados pessoais realizado por este site tem como base
          legal o consentimento do titular (art. 7º, I, LGPD) e o legítimo
          interesse da Imobiliária M&amp;Y em responder a solicitações de contato
          (art. 7º, IX, LGPD).
        </p>

        <h2>5. Compartilhamento de dados</h2>
        <p>
          Seus dados podem ser compartilhados com o corretor responsável pelo
          imóvel de interesse e com fornecedores de infraestrutura técnica
          (hospedagem, banco de dados e envio de mensagens) estritamente
          necessários para o funcionamento do site. Não vendemos nem alugamos
          dados pessoais a terceiros.
        </p>

        <h2>6. Cookies e tecnologias semelhantes</h2>
        <p>
          Utilizamos cookies essenciais ao funcionamento do site e cookies de
          análise para entender como os visitantes utilizam nossas páginas. Você
          pode gerenciar suas preferências de cookies a qualquer momento pelas
          configurações do seu navegador.
        </p>

        <h2>7. Armazenamento e segurança</h2>
        <p>
          Os dados são armazenados em infraestrutura segura, com controles de
          acesso restritos, pelo tempo necessário ao cumprimento das finalidades
          descritas nesta política ou conforme exigido por lei.
        </p>

        <h2>8. Direitos do titular dos dados</h2>
        <p>Nos termos da LGPD, você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados;</li>
          <li>Acessar, corrigir ou atualizar seus dados;</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Solicitar a portabilidade dos dados a outro fornecedor;</li>
          <li>Revogar o consentimento a qualquer momento.</li>
        </ul>

        <h2>9. Como solicitar exclusão, correção ou portabilidade</h2>
        <p>
          Para exercer qualquer um dos direitos acima, entre em contato pelo
          e-mail{" "}
          <a href="mailto:emanoel.tecedif@gmail.com">emanoel.tecedif@gmail.com</a>{" "}
          ou pelo WhatsApp informado no rodapé do site. Responderemos à sua
          solicitação dentro dos prazos previstos em lei.
        </p>

        <h2>10. Contato do responsável pelo tratamento</h2>
        <p>
          Emanoel Dias De Freitas Neto — Corretor de Imóveis (CRECI/GO 40574)
          <br />
          E-mail: <a href="mailto:emanoel.tecedif@gmail.com">emanoel.tecedif@gmail.com</a>
        </p>

        <h2>11. Alterações desta política</h2>
        <p>
          Esta política pode ser atualizada periodicamente para refletir
          melhorias em nossas práticas de privacidade ou mudanças na legislação.
          A data da última atualização está indicada no topo desta página.
        </p>
      </div>
    </div>
  );
}
