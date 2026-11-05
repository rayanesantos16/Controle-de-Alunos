export function sanitizarTexto(texto) {
    if (!texto) return "";
    return texto.trim().toLocaleUpperCase("pt-BR");
}

export function obterDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

export function verificarAlertaTempo(minutos) {
    return Number(minutos) > 15;
}

export function processarRegistro(dados, registroExistente = null) {
    const id = registroExistente ? registroExistente.id : null;
    const matricula = dados.matricula ? dados.matricula.trim() : (registroExistente?.matricula || "");
    const nome = dados.nome ? sanitizarTexto(dados.nome) : (registroExistente?.nome || "");
    const turma = dados.turma ? sanitizarTexto(dados.turma) : (registroExistente?.turma || "");
    const data = dados.data ? dados.data : (registroExistente?.data || obterDataAtual());
    
    let presente = registroExistente ? registroExistente.presente : true;
    if (dados.presente !== undefined) {
        presente = String(dados.presente) === "true" || dados.presente === true;
    }

    let motivoSaida = dados.motivoSaida ? sanitizarTexto(dados.motivoSaida) : (registroExistente?.motivoSaida || "");
    let minutosFora = dados.minutosFora !== undefined ? Number(dados.minutosFora) : (registroExistente?.minutosFora || 0);

    if (!presente) {
        minutosFora = 0;
        motivoSaida = "AUSENTE";
    }

    const alertaTempo = verificarAlertaTempo(minutosFora);

    return {
        id,
        matricula,
        nome,
        turma,
        data,
        presente,
        motivoSaida,
        minutosFora,
        alertaTempo
    };
}
