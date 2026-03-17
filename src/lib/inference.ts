export type Regra = {
    id: string;
    condicoes: string[];
    conclusao: string;
    explicacao: string;
  };
  
  export function executarEncadeamento(fatosIniciais: string[], regras: Regra[]) {
    let fatos = new Set(fatosIniciais);
    let regrasDisparadas: Regra[] = [];
    let novasConclusoes = true;
  
    while (novasConclusoes) {
      novasConclusoes = false;
      for (const regra of regras) {
        // Se a conclusão já é um fato conhecido, pula para a próxima regra
        if (fatos.has(regra.conclusao)) continue;
  
        // Verifica se todas as condições da regra estão na base de fatos atual [cite: 34]
        const podeDisparar = regra.condicoes.every(c => fatos.has(c));
  
        if (podeDisparar) {
          fatos.add(regra.conclusao);
          regrasDisparadas.push(regra); // Registra para o motor de explicação [cite: 40]
          novasConclusoes = true; // Força uma nova iteração para buscar encadeamentos
        }
      }
    }
  
    return {
      conclusoes: Array.from(fatos).filter(f => !fatosIniciais.includes(f)),
      caminho: regrasDisparadas
    };
  }