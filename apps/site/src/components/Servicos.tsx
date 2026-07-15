const SERVICOS = [
  {
    icone: "🏠",
    titulo: "Compra e Venda",
    texto:
      "Encontramos o imóvel ideal para você ou vendemos o seu com estratégia e agilidade.",
  },
  {
    icone: "🔑",
    titulo: "Locação",
    texto:
      "Aluguéis residenciais e comerciais com segurança jurídica e processo simplificado.",
  },
  {
    icone: "📋",
    titulo: "Consultoria",
    texto:
      "Orientação especializada para investimento imobiliário e avaliação de imóveis.",
  },
  {
    icone: "💳",
    titulo: "Financiamento",
    texto:
      "Assessoria completa para financiamento habitacional com as melhores taxas do mercado.",
  },
];

export function Servicos() {
  return (
    <section className="services" id="servicos">
      <div className="services-header reveal">
        <span className="section-badge">O que oferecemos</span>
        <h2 className="section-title">
          Soluções completas
          <br />
          para <em>cada necessidade</em>
        </h2>
        <p className="section-text">
          Do primeiro contato à entrega das chaves, cuidamos de tudo para
          você.
        </p>
      </div>
      <div className="services-grid">
        {SERVICOS.map((s) => (
          <div key={s.titulo} className="service-card reveal">
            <div className="service-icon">{s.icone}</div>
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
