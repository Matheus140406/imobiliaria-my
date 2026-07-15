import { WhatsappIcon } from "./WhatsappIcon";

export function CtaSection({
  whatsappUrl,
  whatsappNumero,
}: {
  whatsappUrl: string | null;
  whatsappNumero?: string | null;
}) {
  return (
    <section className="cta-section" id="contato">
      <span className="section-badge reveal">Pronto para começar?</span>
      <h2 className="section-title reveal">
        Seu próximo lar está
        <br />
        <em>a uma mensagem</em> de distância
      </h2>
      <p className="section-text reveal">
        Fale agora com nossa equipe pelo WhatsApp e dê o primeiro passo para
        realizar o sonho da casa própria.
      </p>
      {whatsappUrl && (
        <a href={whatsappUrl} className="wa-btn reveal" target="_blank" rel="noopener noreferrer">
          <WhatsappIcon />
          <div>
            <div>Falar com a M&amp;Y agora</div>
            <div className="wa-btn-sub">
              {whatsappNumero ? `${whatsappNumero} · Resposta rápida` : "Resposta rápida"}
            </div>
          </div>
        </a>
      )}
    </section>
  );
}
