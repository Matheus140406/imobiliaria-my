"use client";

import { useEffect, useRef } from "react";
import styles from "./Depoimentos.module.css";

const LOCAL = "Águas Lindas de Goiás, GO";

const DEPOIMENTOS = [
  {
    nome: "Ana Beatriz Souza",
    texto:
      "A equipe M&Y foi incrível! Me ajudaram em cada passo do processo, do financiamento até a entrega das chaves. Realizei o sonho da casa própria.",
  },
  {
    nome: "Ricardo Pereira Lima",
    texto:
      "Atendimento excepcional, muito transparentes e honestos. Encontraram exatamente o imóvel que eu precisava dentro do meu orçamento.",
  },
  {
    nome: "Carlos Eduardo Ferreira",
    texto:
      "Comprei meu primeiro apartamento com a M&Y. O suporte foi incrível e me senti seguro em cada decisão. Super recomendo a todos!",
  },
  {
    nome: "Juliana Santos Costa",
    texto:
      "Processo rápido e sem burocracia. A equipe explicou cada detalhe do contrato e tirou todas as minhas dúvidas com paciência.",
  },
  {
    nome: "Fernando Almeida Rocha",
    texto:
      "Depois de anos alugando, finalmente comprei minha casa. A M&Y cuidou de tudo, desde a visita até a assinatura da escritura.",
  },
  {
    nome: "Patrícia Oliveira Dias",
    texto:
      "Profissionalismo do início ao fim. Fui muito bem orientada sobre financiamento e consegui condições que não imaginava conseguir.",
  },
  {
    nome: "Marcos Vinícius Ribeiro",
    texto:
      "Vendi meu imóvel em poucas semanas, com um preço justo e negociação tranquila. A equipe é muito competente e ágil.",
  },
  {
    nome: "Camila Rodrigues Alves",
    texto:
      "Me senti acolhida em cada visita. Encontraram um imóvel que combinava perfeitamente com o que minha família procurava.",
  },
  {
    nome: "Rafael Nascimento Barros",
    texto:
      "A M&Y simplificou algo que parecia complicado. Consegui financiar meu apartamento com taxas melhores do que eu esperava.",
  },
  {
    nome: "Fernanda Carvalho Teixeira",
    texto:
      "Equipe atenciosa e sempre disponível para tirar dúvidas, mesmo fora do horário comercial. Isso fez toda a diferença na decisão.",
  },
  {
    nome: "Bruno Henrique Martins",
    texto:
      "Recomendo de olhos fechados. Encontrei o terreno ideal para construir e todo o processo de documentação foi conduzido com cuidado.",
  },
  {
    nome: "Larissa Gomes Cardoso",
    texto:
      "Realizei o sonho de ter minha casa própria em Águas Lindas graças à orientação da M&Y. Atendimento nota dez do começo ao fim.",
  },
  {
    nome: "Diego Souza Machado",
    texto:
      "Fiquei impressionado com a agilidade no atendimento. Em poucos dias já estava visitando imóveis que combinavam com o meu perfil.",
  },
  {
    nome: "Vanessa Lima Correia",
    texto:
      "A negociação foi justa para as duas partes e a equipe sempre buscou o melhor para mim. Fiquei muito satisfeita com o resultado.",
  },
  {
    nome: "Thiago Batista Nunes",
    texto:
      "Comprei um imóvel para investimento com total segurança jurídica. A M&Y cuidou de toda a documentação sem dor de cabeça.",
  },
  {
    nome: "Priscila Araújo Monteiro",
    texto:
      "Depois de visitar várias imobiliárias, a M&Y foi a única que realmente entendeu o que eu procurava. Fechei negócio com confiança.",
  },
  {
    nome: "Gustavo Henrique Pinto",
    texto:
      "Um atendimento humano e próximo, sem aquela pressão de vendedor. Me senti respeitado durante todo o processo de compra.",
  },
  {
    nome: "Aline Cristina Moura",
    texto:
      "Consegui alugar rapidamente um imóvel excelente e bem localizado. A equipe foi transparente sobre todas as condições do contrato.",
  },
  {
    nome: "Leonardo Duarte Farias",
    texto:
      "Realizamos o sonho da casa própria com o apoio total da M&Y. Cada etapa foi explicada com clareza e muita paciência.",
  },
  {
    nome: "Simone Cavalcante Reis",
    texto:
      "Excelente experiência do início ao fim. A equipe da M&Y é competente, honesta e realmente se importa com o cliente.",
  },
];

function iniciaisDoNome(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes[partes.length - 1]?.[0] ?? "";
  return `${primeira}${ultima}`.toUpperCase();
}

const DEPOIMENTOS_LOOP = [...DEPOIMENTOS, ...DEPOIMENTOS];
const VELOCIDADE_PX_POR_FRAME = 0.6;

export function Depoimentos() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzMovimento) return;

    let frameId: number;

    function tick() {
      if (wrapper) {
        wrapper.scrollLeft += VELOCIDADE_PX_POR_FRAME;
        const metade = wrapper.scrollWidth / 2;
        if (wrapper.scrollLeft >= metade) {
          wrapper.scrollLeft -= metade;
        }
      }
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function mover(direcao: 1 | -1) {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.scrollLeft += direcao * 356;
  }

  return (
    <section className={styles.section} id="depoimentos">
      <div className={`${styles.header} reveal`}>
        <span className={styles.badge}>Depoimentos</span>
        <h2 className={styles.title}>
          O que nossos clientes <em>dizem</em>
        </h2>
        <p className={styles.text}>
          Histórias reais de famílias que realizaram o sonho com a M&amp;Y.
        </p>
      </div>

      <div className={styles.carouselWrap}>
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Ver depoimentos anteriores"
          className={styles.arrowBtn}
          style={{ left: "1rem" }}
        >
          ‹
        </button>

        <div ref={wrapperRef} className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {DEPOIMENTOS_LOOP.map((d, i) => (
              <div key={`${d.nome}-${i}`} className={styles.card}>
                <div className={styles.stars}>★★★★★</div>
                <p className={styles.quoteText}>{d.texto}</p>
                <div className={styles.author}>
                  <div className={styles.avatar}>{iniciaisDoNome(d.nome)}</div>
                  <div>
                    <div className={styles.name}>{d.nome}</div>
                    <div className={styles.location}>{LOCAL}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Ver mais depoimentos"
          className={styles.arrowBtn}
          style={{ right: "1rem" }}
        >
          ›
        </button>
      </div>
    </section>
  );
}
