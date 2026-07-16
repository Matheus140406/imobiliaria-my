import { WhatsappIcon } from "./WhatsappIcon";
import { HeroParallaxBg } from "./HeroParallaxBg";

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
    <section className="hero" id="inicio" aria-label="Início">
      <span id="conteudo-principal" tabIndex={-1} style={{ outline: "none" }} />
      <HeroParallaxBg imageUrl={heroImageUrl} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-label">Imobiliária M&amp;Y • Águas Lindas de Goiás</div>
        <h1>
          Realize o Sonho
          <br />
          da <em>Casa Própria</em>
        </h1>
        <p>
          Conduzimos cada etapa da conquista do seu imóvel com a segurança,
          a transparência e a atenção que um patrimônio dessa importância
          merece.
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
