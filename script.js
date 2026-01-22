const SENHA_CORRETA = "96351645";

function getChave() {
  return document.getElementById("tipo-protocolo").value;
}

function salvarDados() {
  const chave = getChave();
  const protocolos = [];
  document.querySelectorAll(".protocolo").forEach(prot => {
    protocolos.push({
      empresa: prot.querySelector("input[name='empresa']").value,
      ref: prot.querySelector("input[name='ref']").value,
      documentos: prot.querySelector("textarea[name='documentos']").value,
      recebido: prot.querySelector("input[name='recebido']").value,
      data: prot.querySelector("input[name='data']").value
    });
  });

  localStorage.setItem(`protocolos_${chave}`, JSON.stringify(protocolos));
  localStorage.setItem(`competencia_${chave}`, document.getElementById("competencia").value);
  localStorage.setItem(`dataEntrega_${chave}`, document.getElementById("data-entrega").value);
}

// NOVA FUNÇÃO: Atualiza todos os cartões quando muda lá em cima
function atualizarCompetenciaEmMassa() {
    const novaCompetencia = document.getElementById("competencia").value;
    
    // Varre todos os campos de 'Ref' e atualiza
    document.querySelectorAll("input[name='ref']").forEach(inputRef => {
        inputRef.value = novaCompetencia;
    });
    
    // Salva a alteração
    salvarDados();
}

function carregarDados() {
  const chave = getChave();
  const protocolos = JSON.parse(localStorage.getItem(`protocolos_${chave}`) || "[]");
  
  document.getElementById("competencia").value = localStorage.getItem(`competencia_${chave}`) || "";
  document.getElementById("data-entrega").value = localStorage.getItem(`dataEntrega_${chave}`) || "";
  
  const container = document.getElementById("container");
  container.innerHTML = "";

  if (protocolos.length > 0) {
      protocolos.forEach(p => criarProtocolo(p.empresa, p.documentos, p.recebido, p.data, p.ref));
  } else {
      for (let i = 0; i < 4; i++) criarProtocolo();
  }
}

function criarProtocolo(empresa = "", documentos = "", recebido = "", data = "", ref = "") {
  
  // Se for novo (sem ref), pega a do topo
  if (!ref) {
      ref = document.getElementById("competencia").value;
  }

  const div = document.createElement("div");
  div.className = "protocolo";
  
  div.innerHTML = `
    <div class="acoes-card">
        <button class="adicionar-btn" title="Adicionar abaixo"><i class="fa-solid fa-plus"></i></button>
        <button class="remover-btn" title="Excluir"><i class="fa-solid fa-trash"></i></button>
    </div>
    
    <div class="linha-topo">
        <div class="campo-empresa">
            <label>Empresa:</label> 
            <input name="empresa" type="text" value="${empresa}">
        </div>
        <div class="campo-ref">
            <label>Competência:</label> 
            <input name="ref" type="text" value="${ref}" placeholder="MM/AAAA">
        </div>
    </div>
    
    <div class="linha-documentos">
        <label>Documentos:</label> 
        <textarea name="documentos">${documentos}</textarea>
    </div>
    
    <div class="linha-rodape">
        <div class="campo-assinatura">
            <label>Assinatura:</label> 
            <input name="recebido" type="text" value="${recebido}">
        </div>
        <div class="campo-data">
            <label>RECEBIDO em:</label>
            <input name="data" type="text" value="${data}">
        </div>
    </div>
  `;

  div.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", salvarDados);
  });

  div.querySelector(".remover-btn").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja excluir este protocolo?")) {
      div.remove();
      salvarDados();
    }
  });

  div.querySelector(".adicionar-btn").addEventListener("click", () => {
    const novoProtocolo = criarProtocolo();
    div.parentNode.insertBefore(novoProtocolo, div.nextSibling);
    salvarDados();
  });

  document.getElementById("container").appendChild(div);
  return div;
}

function exportarPDF() {
  window.print();
}

function limparDados() {
  const senhaDigitada = prompt("Para limpar os dados, digite a senha:");
  if (senhaDigitada === SENHA_CORRETA) {
    const chave = getChave();
    localStorage.removeItem(`protocolos_${chave}`);
    localStorage.removeItem(`competencia_${chave}`);
    localStorage.removeItem(`dataEntrega_${chave}`);
    carregarDados();
    alert("Dados limpos!");
  } else {
    alert("Senha incorreta.");
  }
}

document.getElementById("exportar-json-btn").addEventListener("click", () => {
  salvarDados();
  const chave = getChave();
  const dados = {
    protocolos: JSON.parse(localStorage.getItem(`protocolos_${chave}`)),
    competencia: localStorage.getItem(`competencia_${chave}`),
    dataEntrega: localStorage.getItem(`dataEntrega_${chave}`)
  };
  const jsonStr = JSON.stringify(dados, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${chave}_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
});

document.getElementById("importar-json-btn").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      const chave = getChave();
      localStorage.setItem(`protocolos_${chave}`, JSON.stringify(dados.protocolos));
      localStorage.setItem(`competencia_${chave}`, dados.competencia);
      localStorage.setItem(`dataEntrega_${chave}`, dados.dataEntrega);
      carregarDados();
      alert("Importado com sucesso!");
    } catch (error) {
      alert("Erro ao importar JSON.");
    }
  };
  reader.readAsText(file);
});

document.getElementById("add-btn").addEventListener("click", () => {
  criarProtocolo();
  salvarDados();
});

// AQUI ESTÁ O TRUQUE: Ao invés de só salvar, ele chama a função que atualiza tudo
document.getElementById("competencia").addEventListener("input", atualizarCompetenciaEmMassa);

document.getElementById("data-entrega").addEventListener("input", salvarDados);
document.getElementById("exportar-pdf-btn").addEventListener("click", exportarPDF);
document.getElementById("limpar-btn").addEventListener("click", limparDados);
document.getElementById("tipo-protocolo").addEventListener("change", carregarDados);

carregarDados();