"use client";
import { useState } from 'react';
import { executarEncadeamento } from '@/lib/inference';
import regras from '@/data/rules.json';

export default function Home() {
  const [fatosAtivos, setFatosAtivos] = useState<string[]>([]);
  const [resultado, setResultado] = useState<any>(null);

  const handleCheckbox = (label: string) => {
    setFatosAtivos(prev => 
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  const analisar = () => {
    const res = executarEncadeamento(fatosAtivos, regras);
    setResultado(res);
  };

  return (
    <div className="bg-black text-white min-h-screen p-10 flex justify-center">
      <h1 className="text-blue-600 text-3xl font-bold mb-6">Sistema Especialista: Suporte Técnico</h1>
      
      <div className="border border-gray-700 rounded-lg p-6 max-w-3xl">
        <h2 className="mb-4 font-bold">Selecione os Sintomas</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {["Computador está lento", "Internet caindo constantemente", "Wi-Fi não conecta", "Ocorreu uma tela azul (BSOD)", "Aviso de pouco espaço em disco"].map(sintoma => (
            <label key={sintoma} className="flex items-center space-x-3 border border-gray-700 p-3 rounded hover:bg-gray-900 cursor-pointer">
              <input type="checkbox" onChange={() => handleCheckbox(sintoma)} className="w-4 h-4" />
              <span>{sintoma}</span>
            </label>
          ))}
        </div>

        <button onClick={analisar} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold">
          Analisar Problemas (Encadeamento para Frente)
        </button>
      </div>

      {resultado && resultado.conclusoes.length > 0 && (
        <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-blue-500">
          <h3 className="text-xl font-bold text-blue-400 mb-2">Conclusão:</h3>
          {resultado.conclusoes.map((c: string) => <p key={c} className="text-lg">➔ {c}</p>)}
          
          <h3 className="text-xl font-bold text-blue-400 mt-6 mb-2">Explicação:</h3>
          {resultado.caminho.map((r: any) => (
            <div key={r.id} className="text-sm text-gray-400 mb-2 italic">
              "Aplicada a {r.id}: {r.explicacao}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
}