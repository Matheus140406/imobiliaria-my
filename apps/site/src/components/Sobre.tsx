import Image from "next/image";

export function Sobre() {
  return (
    <section className="about" id="sobre">
      <div className="about-grid">
        <div className="about-image-wrap reveal">
          <div className="about-image-photo">
            <Image
              src="/confianca-2.jpg"
              alt="Assinatura de contrato de compra de imóvel"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="about-image-photo-secundaria">
            <Image
              src="/confianca-1.jpg"
              alt="Aperto de mãos selando a negociação de um imóvel"
              fill
              sizes="(max-width: 768px) 60vw, 28vw"
            />
          </div>
          <div className="about-image-accent" />
        </div>
        <div className="reveal">
          <span className="section-badge">Quem somos</span>
          <h2 className="section-title">
            Mais que uma imobiliária —<br />
            somos <em>seu parceiro</em> no sonho
          </h2>
          <p className="section-text">
            A Imobiliária M&amp;Y nasceu do desejo de tornar a conquista da
            casa própria uma experiência tranquila, transparente e
            inesquecível em Águas Lindas de Goiás e região. Atendemos cada
            cliente de forma única, com atenção, ética e resultado.
          </p>
          <ul className="about-list">
            <li>Atendimento personalizado e humanizado</li>
            <li>Documentação e processos simplificados</li>
            <li>Financiamento com as melhores condições</li>
            <li>Equipe experiente e comprometida</li>
            <li>Imóveis residenciais e comerciais</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
