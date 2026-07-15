export function formatPreco(preco: number | null) {
  if (preco == null) return "Consulte";
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function whatsappLink(numero: string, mensagem: string) {
  const digits = numero.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(mensagem)}`;
}
