import { WhatsappIcon } from "./WhatsappIcon";

export function Hero({
  whatsappUrl,
  heroImageUrl,
  totalDisponiveis,
  totalVendidos,
}: {
  whatsappUrl: string | null;
  heroImageUrl?: string | null;
  totalDisponiveis: number;
  totalVendidos: number;
}) {
  const mostrarStats = totalDisponiveis > 0 || totalVendidos > 0;

  return (
    <section className="hero" id="inicio">
      <div
        className="hero-bg"
        style={
          heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined
        }
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-label">Imobiliária M&amp;Y • Águas Lindas de Goiás</div>
        <h1>
          Realize o Sonho
          <br />
          da <em>Casa Própria</em>
        </h1>
        <p>
          Encontre o imóvel perfeito para você e sua família com quem entende
          do mercado e cuida de cada detalhe com dedicação.
        </p>
        <div className="hero-actions">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon />
              Falar pelo WhatsApp
            </a>
          )}
          <a href="#imoveis" className="btn-secondary">
            Ver Imóveis
          </a>
        </div>
      </div>

      {mostrarStats && (
        <div className="hero-stats">
          {totalDisponiveis > 0 && (
            <div className="stat-item">
              <div className="stat-num">{totalDisponiveis}</div>
              <div className="stat-label">Imóveis disponíveis</div>
            </div>
          )}
          {totalVendidos > 0 && (
            <div className="stat-item">
              <div className="stat-num">{totalVendidos}</div>
              <div className="stat-label">Imóveis vendidos</div>
            </div>
          )}
        </div>
      )}

      <div className="hero-scroll">Role</div>
    </section>
  );
}
