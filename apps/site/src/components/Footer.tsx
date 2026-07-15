export function Footer({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <footer>
      <div className="footer-logo">
        Imobiliária <span>M&amp;Y</span>
      </div>
      <div className="footer-divider" />
      <p className="footer-text">
        {whatsapp && <>{whatsapp} &nbsp;·&nbsp; </>}
        Águas Lindas de Goiás, GO
        <br />
        {`© ${new Date().getFullYear()} Imobiliária M&Y. Todos os direitos reservados.`}
      </p>
    </footer>
  );
}
