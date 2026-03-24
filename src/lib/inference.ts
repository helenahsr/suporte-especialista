// Tipo que representa uma regra de produção no sistema especialista
export type Regra = {
  id: string;
  condicoes: string[];
  conclusao: string;
  explicacao: string;
};

// Tipo que representa um passo na cadeia de inferência
export type PassoInferencia = {
  passo: number;
  regraId: string;
  condicoesUsadas: string[];
  conclusaoGerada: string;
  explicacao: string;
  explicacaoNatural: string;
  fatosAntesDisparo: string[];
  fatosDepoisDisparo: string[];
};

// Tipo do resultado do encadeamento
export type ResultadoInferencia = {
  conclusoes: string[];
  cadeia: PassoInferencia[];
  totalIteracoes: number;
  fatosFinais: string[];
  regrasDisparadas: Regra[];
};

/**
 * Motor de Inferência por Encadeamento para Frente (Forward Chaining)
 * 
 * Aplica as regras de produção repetidamente até que nenhuma nova 
 * conclusão possa ser derivada dos fatos conhecidos.
 * 
 * Cada iteração percorre todas as regras verificando se suas condições
 * são satisfeitas pelos fatos atuais. Quando uma regra dispara, sua
 * conclusão é adicionada à base de fatos e a cadeia de inferência
 * é registrada para o motor de explicação.
 */
export function executarEncadeamento(
  fatosIniciais: string[],
  regras: Regra[]
): ResultadoInferencia {
  // Base de fatos atual (começa com os fatos iniciais)
  let fatos = new Set(fatosIniciais);
  // Registro de todos os passos da cadeia de inferência
  let cadeia: PassoInferencia[] = [];
  // Regras que já foram disparadas
  let regrasDisparadas: Regra[] = [];
  // Controle de loop
  let novasConclusoes = true;
  let totalIteracoes = 0;
  let passoAtual = 0;

  while (novasConclusoes) {
    novasConclusoes = false;
    totalIteracoes++;

    for (const regra of regras) {
      // Se a conclusão já é um fato conhecido, pula
      if (fatos.has(regra.conclusao)) continue;

      // Verifica se todas as condições da regra estão na base de fatos
      const podeDisparar = regra.condicoes.every((c) => fatos.has(c));

      if (podeDisparar) {
        passoAtual++;
        const fatosAntes = Array.from(fatos);

        // Adiciona a conclusão aos fatos
        fatos.add(regra.conclusao);

        const fatosDepois = Array.from(fatos);

        // Gera explicação em linguagem natural
        const condicoesTexto = regra.condicoes
          .map((c) => `"${c}"`)
          .join(" e ");
        const explicacaoNatural =
          `Passo ${passoAtual}: Como os fatos ${condicoesTexto} estão presentes na base de conhecimento, ` +
          `a regra ${regra.id} foi ativada e concluiu: "${regra.conclusao}". ` +
          `Justificativa: ${regra.explicacao}`;

        // Registra o passo na cadeia de inferência
        cadeia.push({
          passo: passoAtual,
          regraId: regra.id,
          condicoesUsadas: [...regra.condicoes],
          conclusaoGerada: regra.conclusao,
          explicacao: regra.explicacao,
          explicacaoNatural,
          fatosAntesDisparo: fatosAntes,
          fatosDepoisDisparo: fatosDepois,
        });

        regrasDisparadas.push(regra);
        novasConclusoes = true;
      }
    }
  }

  return {
    conclusoes: Array.from(fatos).filter((f) => !fatosIniciais.includes(f)),
    cadeia,
    totalIteracoes,
    fatosFinais: Array.from(fatos),
    regrasDisparadas,
  };
}