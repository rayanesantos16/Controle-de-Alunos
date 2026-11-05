import express from "express";
import { listarTodos, salvarTodos } from "./FUNCOES/manipulador_arquivo.js";
import { processarRegistro } from "./FUNCOES/processamento.js";

const app = express();
const PORT = 3000;
app.use(express.json());

function validarId(req, res, next) {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
        return res.status(400).json({ erro: "O ID deve ser um número inteiro." });
    }
    req.idValido = idNum;
    next();
}

app.get("/", (req, res) => {
    res.send("Bem-Vindo à API do Sistema de Controle de Presença de Alunos");
});

app.get("/alunos", async (req, res) => {
    try {
        let alunos = await listarTodos();
        const { turma, alerta } = req.query;

        if (turma) {
            const turmaFiltro = turma.trim().toUpperCase();
            alunos = alunos.filter((a) => a.turma === turmaFiltro);
        }

        if (alerta) {
            const alertaBool = alerta === "true";
            alunos = alunos.filter((a) => a.alertaTempo === alertaBool);
        }

        return res.status(200).json(alunos);
    } catch (error) {
        console.log("Erro ao listar alunos", error);
        return res.status(500).json({ erro: "Não foi possível ler os registros de alunos" });
    }
});

app.get("/alunos/:id", validarId, async (req, res) => {
    try {
        const alunos = await listarTodos();
        const aluno = alunos.find((a) => a.id === req.idValido);

        if (!aluno) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        return res.status(200).json(aluno);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar o registro" });
    }
});

app.post("/alunos", async (req, res) => {
    try {
        const { matricula, nome, turma, minutosFora } = req.body;

        if (!matricula || !nome || !turma) {
            return res.status(400).json({ erro: "Campos obrigatórios ausentes: não é permitido cadastro sem matricula, nome e turma." });
        }

        if (minutosFora !== undefined && Number(minutosFora) < 0) {
            return res.status(400).json({ erro: "Não é aceito minutos Fora negativo." });
        }

        const alunos = await listarTodos();
        const proximoId = alunos.length > 0 ? Math.max(...alunos.map((a) => a.id)) + 1 : 1;

        const novoAluno = processarRegistro(req.body);
        novoAluno.id = proximoId;

        alunos.push(novoAluno);
        await salvarTodos(alunos);

        return res.status(201).json(novoAluno);
    } catch (error) {
        return res.status(500).json({ erro: "Não foi possível criar o registro" });
    }
});

app.patch("/alunos/:id/retorno", validarId, async (req, res) => {
    try {
        const { minutosFora } = req.body;

        if (minutosFora === undefined || Number(minutosFora) < 0) {
            return res.status(400).json({ erro: "É necessário informar um valor válido e não negativo para minutos Fora." });
        }

        const alunos = await listarTodos();
        const index = alunos.findIndex((a) => a.id === req.idValido);

        if (index === -1) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        if (!alunos[index].presente) {
            return res.status(400).json({ erro: "Não é possível alterar minutos fora de um aluno ausente." });
        }

        const dadosAtualizados = { ...alunos[index], minutosFora };
        const registroProcessado = processarRegistro(dadosAtualizados, alunos[index]);

        alunos[index] = registroProcessado;
        await salvarTodos(alunos);

        return res.status(200).json(registroProcessado);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao atualizar o retorno do aluno" });
    }
});

app.delete("/alunos/:id", validarId, async (req, res) => {
    try {
        const alunos = await listarTodos();
        const index = alunos.findIndex((a) => a.id === req.idValido);

        if (index === -1) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        const [alunoExcluido] = alunos.splice(index, 1);
        await salvarTodos(alunos);

        return res.status(200).json({ 
            mensagem: "Registro removido com sucesso.", 
            registroExcluido: alunoExcluido 
        });
    } catch (error) {
        console.log("Erro ao remover aluno", error);
        return res.status(500).json({ erro: "Não foi possível deletar o registro" });
    }
});

app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada" });
});

app.listen(PORT, () => {
    console.log("Está rodando na porta:", PORT);
});
