import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define o caminho para o arquivo de regras (persistência em JSON)
const rulesFilePath = path.join(process.cwd(), 'src', 'data', 'rules.json');

// Função auxiliar para ler as regras do arquivo
function lerRegras() {
    const fileData = fs.readFileSync(rulesFilePath, 'utf8');
    return JSON.parse(fileData || '[]');
}

// Função auxiliar para salvar as regras no arquivo
function salvarRegras(regras: any[]) {
    fs.writeFileSync(rulesFilePath, JSON.stringify(regras, null, 2));
}

/**
 * GET /api/regras
 * Retorna todas as regras da base de conhecimento
 */
export async function GET() {
    try {
        const regras = lerRegras();
        return NextResponse.json(regras, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao ler regras.' }, { status: 500 });
    }
}

/**
 * POST /api/regras
 * Adiciona uma nova regra à base de conhecimento
 */
export async function POST(request: Request) {
    try {
        const novaRegra = await request.json();

        // Lê o arquivo atual
        const regras = lerRegras();

        // Gera um ID simples (ex: R3, R4...)
        const maxId = regras.reduce((max: number, r: any) => {
            const num = parseInt(r.id.replace('R', ''));
            return num > max ? num : max;
        }, 0);
        novaRegra.id = `R${maxId + 1}`;

        // Adiciona a nova regra ao array
        regras.push(novaRegra);

        // Reescreve o arquivo JSON com a nova regra
        salvarRegras(regras);

        return NextResponse.json(
            { message: 'Regra cadastrada com sucesso!', regra: novaRegra },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao salvar a regra.' }, { status: 500 });
    }
}

/**
 * DELETE /api/regras
 * Remove uma regra pelo ID (passado via query string ?id=R1)
 */
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID da regra não informado.' }, { status: 400 });
        }

        const regras = lerRegras();
        const index = regras.findIndex((r: any) => r.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Regra não encontrada.' }, { status: 404 });
        }

        regras.splice(index, 1);
        salvarRegras(regras);

        return NextResponse.json({ message: `Regra ${id} removida com sucesso.` }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao remover regra.' }, { status: 500 });
    }
}

/**
 * PUT /api/regras
 * Atualiza uma regra existente pelo ID
 */
export async function PUT(request: Request) {
    try {
        const regraAtualizada = await request.json();
        const regras = lerRegras();
        const index = regras.findIndex((r: any) => r.id === regraAtualizada.id);

        if (index === -1) {
            return NextResponse.json({ error: 'Regra não encontrada.' }, { status: 404 });
        }

        regras[index] = regraAtualizada;
        salvarRegras(regras);

        return NextResponse.json(
            { message: `Regra ${regraAtualizada.id} atualizada.`, regra: regraAtualizada },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao atualizar regra.' }, { status: 500 });
    }
}