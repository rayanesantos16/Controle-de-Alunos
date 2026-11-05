import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caminhoDados = path.join(__dirname, "..", "bd", "registros_alunos.json");

async function verificarArquivo() {
    try {
        await fs.access(caminhoDados);
    } catch {
        const dir = path.dirname(caminhoDados);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(caminhoDados, JSON.stringify([], null, 2), "utf-8");
    }
}

export async function listarTodos() {
    await verificarArquivo();
    const conteudo = await fs.readFile(caminhoDados, "utf-8");
    return JSON.parse(conteudo);
}

export async function salvarTodos(cadastros) {
    await verificarArquivo();
    await fs.writeFile(
        caminhoDados,
        JSON.stringify(cadastros, null, 2),
        "utf-8"
    );
}
