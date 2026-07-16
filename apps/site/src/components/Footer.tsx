import Link from "next/link";

export function Footer({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            Imobiliária <span>M&amp;Y</span>
          </div>
          <p className="footer-corretor" style={{ marginTop: "1rem" }}>
            <strong>Emanoel Dias</strong> — Corretor de Imóveis
            <br />
            CRECI/GO 40574
            <br />
            Atendimento Digital
            <br />
            <a href="mailto:emanoel.tecedif@gmail.com" style={{ color: "inherit" }}>
              emanoel.tecedif@gmail.com
            </a>
            {whatsapp && (
              <>
                <br />
                WhatsApp: {whatsapp}
              </>
            )}
          </p>
        </div>

        <div>
          <div className="footer-col-title">Institucional</div>
          <ul className="footer-links">
            <li><a href="#sobre">Sobre nós</a></li>
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#imoveis">Imóveis</a></li>
            <li><a href="#contato">Fale conosco</a></li>
          </ul>
        </div>

        <div>
          <div className="footer-col-title">Legal</div>
          <ul className="footer-links">
            <li><Link href="/politica-de-privacidade">Política de Privacidade (LGPD)</Link></li>
            <li><Link href="/codigo-de-defesa-do-consumidor">Direitos do Consumidor</Link></li>
            <li><Link href="/termos-de-uso">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">
          Águas Lindas de Goiás, GO
          <br />
          {`© ${new Date().getFullYear()} Imobiliária M&Y. Todos os direitos reservados.`}
        </p>
        <p className="footer-disclaimer">
          As imagens utilizadas possuem caráter meramente ilustrativo. Os imóveis
          anunciados estão sujeitos a disponibilidade, atualização cadastral e
          alteração de valores sem aviso prévio. As informações aqui disponibilizadas
          não constituem proposta vinculante.
        </p>
      </div>
    </footer>
  );
}
