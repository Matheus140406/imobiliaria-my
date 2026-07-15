import { WhatsappIcon } from "./WhatsappIcon";

export function WhatsappFloat({ whatsappUrl }: { whatsappUrl: string | null }) {
  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      className="wa-float"
      target="_blank"
      rel="noopener noreferrer"
      title="Falar pelo WhatsApp"
    >
      <WhatsappIcon />
    </a>
  );
}
