function atualizarCampos() {
    const tipo = document.getElementById("tipoRede").value;
    const campos = document.getElementById("camposDinamicos");
    const resultado = document.getElementById("resultado");
    const botaoPdf = document.getElementById("btnPdf");

    campos.innerHTML = "";
    resultado.className = "resultado resultado-vazio";
    resultado.innerHTML = "Preencha os dados e clique em Calcular.";
    botaoPdf.style.display = "none";

    if (tipo === "mono") {
        campos.innerHTML = `
            <label for="potMono">Potência total (W)</label>
            <input type="number" id="potMono" placeholder="Ex.: 4500">
        `;
    }

    if (tipo === "tri220") {
        campos.innerHTML = `
            <label for="potRT">Potência entre R-T (W)</label>
            <input type="number" id="potRT" placeholder="Ex.: 3000">

            <label for="potSR">Potência entre S-R (W)</label>
            <input type="number" id="potSR" placeholder="Ex.: 2500">

            <label for="potTS">Potência entre T-S (W)</label>
            <input type="number" id="potTS" placeholder="Ex.: 2800">
        `;
    }

    if (tipo === "tri380") {
        campos.innerHTML = `
            <label for="potRN">Potência entre R-N (W)</label>
            <input type="number" id="potRN" placeholder="Ex.: 2000">

            <label for="potSN">Potência entre S-N (W)</label>
            <input type="number" id="potSN" placeholder="Ex.: 1800">

            <label for="potTN">Potência entre T-N (W)</label>
            <input type="number" id="potTN" placeholder="Ex.: 2200">
        `;
    }
}

/* =========================
   TABELAS INTERNAS DA EMPRESA
========================= */

const disjuntoresMono = [
    { corrente: 10, erp: "79516", descricao: "DISJUNTOR UNIPOLAR 10A MDWP-B10" },
    { corrente: 16, erp: "705", descricao: "DISJUNTOR UNIPOLAR 16A MDW-C16" },
    { corrente: 25, erp: "720", descricao: "DISJUNTOR UNIPOLAR 25A" },
    { corrente: 35, erp: "706", descricao: "DISJUNTOR UNIPOLAR 35A" },
    { corrente: 70, erp: "87774", descricao: "DISJUNTOR MONOF. UNIPOLAR 70A" }
];

const disjuntoresTri = [
    { corrente: 10, erp: "71118", descricao: "DISJUNTOR TRIPOLAR 10A" },
    { corrente: 16, erp: "715", descricao: "DISJUNTOR TRIPOLAR 16A" },
    { corrente: 20, erp: "716", descricao: "DISJUNTOR TRIPOLAR 20A" },
    { corrente: 25, erp: "707", descricao: "DISJUNTOR TRIPOLAR 25A" },
    { corrente: 32, erp: "708", descricao: "DISJUNTOR TRIPOLAR 32A" },
    { corrente: 40, erp: "35443", descricao: "DISJUNTOR TRIPOLAR 40A" },
    { corrente: 50, erp: "709", descricao: "DISJUNTOR TRIPOLAR 50A" },
    { corrente: 63, erp: "97695", descricao: "DISJUNTOR TRIPOLAR MBW 63A" },
    { corrente: 80, erp: "131178", descricao: "DISJUNTOR TRIPOLAR MDW 80A" },
    { corrente: 100, erp: "163957", descricao: "DISJUNTOR TRIPOLAR MDW 100A" }
];

const seccionadorasTri = [
    { corrente: 25, erp: "18232", descricao: "CHAVE SECCAO 25A 3 POLOS" },
    { corrente: 40, erp: "35444", descricao: "CHAVE SECCAO 40A 3 POLOS" },
    { corrente: 63, erp: "37746", descricao: "CHAVE SECCAO 63A 3 POLOS" },
    { corrente: 125, erp: "131179", descricao: "CHAVE SECCIONADORA 3P 125A MANOPLA VW/AM (ACE LB 125 B33)" }
];

const cabos = [
    { bitola: 1, capacidade: 15, erp: "141370", descricao: "CABO PP 5X1MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 2.5, capacidade: 21, erp: "141371", descricao: "CABO PP 5X2,5MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 4, capacidade: 28, erp: "62569", descricao: "CABO PP 5X4MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 6, capacidade: 36, erp: "141373", descricao: "CABO PP 5X6MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 10, capacidade: 50, erp: "108655", descricao: "CABO PP 5X10MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 16, capacidade: 68, erp: "131164", descricao: "CABO PP 5X16MM² 70°C 750V BR/PT/VM/AZ/VD-AM" },
    { bitola: 25, capacidade: 89, erp: "141292", descricao: "CABO PP 5X25MM² 70°C 750V BR/PT/VM/AZ/VD-AM" }
];

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function formatarNumero(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function obterFP() {
    const valor = document.getElementById("fp").value.trim();

    if (valor === "") {
        return {
            fp: 0.92,
            informadoPeloUsuario: false
        };
    }

    const fp = parseFloat(valor.replace(",", "."));

    if (!fp || fp <= 0 || fp > 1) {
        return null;
    }

    return {
        fp: fp,
        informadoPeloUsuario: true
    };
}

function selecionarDisjuntor(corrente, tipoSistema) {
    const lista = tipoSistema === "mono" ? disjuntoresMono : disjuntoresTri;

    for (const item of lista) {
        if (corrente <= item.corrente) {
            return item;
        }
    }

    return null;
}

function selecionarSeccionadora(correnteDisjuntor) {
    for (const item of seccionadorasTri) {
        if (correnteDisjuntor <= item.corrente) {
            return item;
        }
    }

    return null;
}

function selecionarCaboPeloDisjuntor(correnteDisjuntor) {
    for (const item of cabos) {
        if (correnteDisjuntor <= item.capacidade) {
            return item;
        }
    }

    return null;
}

function criarLinha(chave, valor) {
    return `
        <div class="resultado-linha">
            <div class="resultado-chave">${chave}</div>
            <div class="resultado-valor">${valor}</div>
        </div>
    `;
}

function criarBloco(titulo, linhas, classeExtra = "") {
    return `
        <div class="resultado-bloco ${classeExtra}">
            <h3>${titulo}</h3>
            ${linhas.join("")}
        </div>
    `;
}

function statusComponente(item) {
    return item
        ? '<span class="tag-ok">Cadastrado</span>'
        : '<span class="tag-falta">Não cadastrado</span>';
}

function mostrarErro(mensagem) {
    const resultado = document.getElementById("resultado");
    const botaoPdf = document.getElementById("btnPdf");

    resultado.className = "resultado";
    resultado.innerHTML = `<div class="erro">${mensagem}</div>`;
    botaoPdf.style.display = "none";
}

/* =========================
   CÁLCULO PRINCIPAL
========================= */

function calcular() {
    const tipo = document.getElementById("tipoRede").value;
    const resultado = document.getElementById("resultado");
    const botaoPdf = document.getElementById("btnPdf");
    const dadosFP = obterFP();

    if (!tipo) {
        mostrarErro("Selecione primeiro o tipo de alimentação.");
        return;
    }

    if (dadosFP === null) {
        mostrarErro("Informe um fator de potência válido entre 0,01 e 1,00.");
        return;
    }

    const fp = dadosFP.fp;
    const origemFP = dadosFP.informadoPeloUsuario
        ? "Fator de potência informado pelo usuário."
        : "Fator de potência não informado. Foi adotado o valor padrão de 0,92.";

    let tipoDescricao = "";
    let potenciaTotal = 0;
    let maiorCorrente = 0;
    let correntes = [];
    let tipoSistemaParaTabela = "";

    if (tipo === "mono") {
        const potencia = parseFloat(document.getElementById("potMono").value) || 0;

        if (potencia <= 0) {
            mostrarErro("Informe uma potência válida.");
            return;
        }

        const corrente = potencia / (220 * fp);

        tipoDescricao = "Monofásica 220 V";
        potenciaTotal = potencia;
        maiorCorrente = corrente;
        correntes = [
            { nome: "Corrente calculada", valor: corrente }
        ];
        tipoSistemaParaTabela = "mono";
    }

    if (tipo === "tri220") {
        const potRT = parseFloat(document.getElementById("potRT").value) || 0;
        const potSR = parseFloat(document.getElementById("potSR").value) || 0;
        const potTS = parseFloat(document.getElementById("potTS").value) || 0;

        if (potRT <= 0 && potSR <= 0 && potTS <= 0) {
            mostrarErro("Informe pelo menos uma potência válida.");
            return;
        }

        const correnteRT = potRT / (220 * fp);
        const correnteSR = potSR / (220 * fp);
        const correnteTS = potTS / (220 * fp);

        tipoDescricao = "Trifásica 220 V sem neutro";
        potenciaTotal = potRT + potSR + potTS;
        maiorCorrente = Math.max(correnteRT, correnteSR, correnteTS);
        correntes = [
            { nome: "Corrente R-T", valor: correnteRT },
            { nome: "Corrente S-R", valor: correnteSR },
            { nome: "Corrente T-S", valor: correnteTS },
            { nome: "Maior corrente considerada", valor: maiorCorrente }
        ];
        tipoSistemaParaTabela = "tri";
    }

    if (tipo === "tri380") {
        const potRN = parseFloat(document.getElementById("potRN").value) || 0;
        const potSN = parseFloat(document.getElementById("potSN").value) || 0;
        const potTN = parseFloat(document.getElementById("potTN").value) || 0;

        if (potRN <= 0 && potSN <= 0 && potTN <= 0) {
            mostrarErro("Informe pelo menos uma potência válida.");
            return;
        }

        const correnteRN = potRN / (220 * fp);
        const correnteSN = potSN / (220 * fp);
        const correnteTN = potTN / (220 * fp);

        tipoDescricao = "Trifásica 380 V com neutro";
        potenciaTotal = potRN + potSN + potTN;
        maiorCorrente = Math.max(correnteRN, correnteSN, correnteTN);
        correntes = [
            { nome: "Corrente R-N", valor: correnteRN },
            { nome: "Corrente S-N", valor: correnteSN },
            { nome: "Corrente T-N", valor: correnteTN },
            { nome: "Maior corrente considerada", valor: maiorCorrente }
        ];
        tipoSistemaParaTabela = "tri";
    }

    const disjuntor = selecionarDisjuntor(maiorCorrente, tipoSistemaParaTabela);
    const cabo = disjuntor ? selecionarCaboPeloDisjuntor(disjuntor.corrente) : null;
    const seccionador = disjuntor ? selecionarSeccionadora(disjuntor.corrente) : null;

    const observacoes = [];
    observacoes.push(origemFP);
    observacoes.push("A seleção de cabo é um pré-dimensionamento com base na tabela interna cadastrada.");
    observacoes.push("O fechamento final deve considerar método de instalação, agrupamento, temperatura, queda de tensão e demais critérios do projeto.");

    if (!disjuntor) {
        observacoes.push("Não existe disjuntor compatível cadastrado na tabela interna da empresa para essa corrente.");
    }

    if (disjuntor && !cabo) {
        observacoes.push("Não existe cabo compatível cadastrado na tabela interna da empresa para o disjuntor selecionado.");
    }

    if (!seccionador) {
        observacoes.push("Não existe seccionador compatível cadastrado na tabela interna da empresa.");
    }

    const blocoEntrada = criarBloco("Dados de entrada", [
        criarLinha("Tipo de alimentação", tipoDescricao),
        criarLinha("Fator de potência utilizado", formatarNumero(fp)),
        criarLinha("Potência total", `${formatarNumero(potenciaTotal)} W`)
    ]);

    const blocoCorrentes = criarBloco(
        "Correntes",
        correntes.map(item => criarLinha(item.nome, `${formatarNumero(item.valor)} A`))
    );

    const blocoDisjuntor = criarBloco("Disjuntor", [
        criarLinha("Status", statusComponente(disjuntor)),
        criarLinha("Corrente nominal", disjuntor ? `${formatarNumero(disjuntor.corrente)} A` : "-"),
        criarLinha("Código ERP", disjuntor ? disjuntor.erp : "Não cadastrado"),
        criarLinha("Descrição", disjuntor ? disjuntor.descricao : "Não existe componente compatível na tabela interna")
    ]);

    const blocoCabo = criarBloco("Cabo", [
        criarLinha("Status", statusComponente(cabo)),
        criarLinha("Bitola", cabo ? `${formatarNumero(cabo.bitola)} mm²` : "-"),
        criarLinha("Capacidade", cabo ? `${formatarNumero(cabo.capacidade)} A` : "-"),
        criarLinha("Código ERP", cabo ? cabo.erp : "Não cadastrado"),
        criarLinha("Descrição", cabo ? cabo.descricao : "Não existe componente compatível na tabela interna")
    ]);

    const blocoSeccionador = criarBloco("Seccionamento", [
        criarLinha("Status", statusComponente(seccionador)),
        criarLinha("Corrente nominal", seccionador ? `${formatarNumero(seccionador.corrente)} A` : "-"),
        criarLinha("Código ERP", seccionador ? seccionador.erp : "Não cadastrado"),
        criarLinha("Descrição", seccionador ? seccionador.descricao : "Não existe componente compatível na tabela interna")
    ]);

    const blocoObs = `
        <div class="resultado-bloco alerta">
            <h3>Observações</h3>
            <ul class="obs-lista">
                ${observacoes.map(obs => `<li>${obs}</li>`).join("")}
            </ul>
        </div>
    `;

    resultado.className = "resultado";
    resultado.innerHTML = `
        <div class="resultado-grid">
            ${blocoEntrada}
            ${blocoCorrentes}
            ${blocoDisjuntor}
            ${blocoCabo}
            ${blocoSeccionador}
            ${blocoObs}
        </div>
    `;

    botaoPdf.style.display = "inline-block";
}

function gerarPDF() {
    window.print();
}
