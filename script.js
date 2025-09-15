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
      documentos: prot.querySelector("textarea[name='documentos']").value,
      recebido: prot.querySelector("input[name='recebido']").value
    });
  });

  localStorage.setItem(`protocolos_${chave}`, JSON.stringify(protocolos));
  localStorage.setItem(`competencia_${chave}`, document.getElementById("competencia").value);
  localStorage.setItem(`dataEntrega_${chave}`, document.getElementById("data-entrega").value);
}

function carregarDados() {
  const chave = getChave();
  const protocolos = JSON.parse(localStorage.getItem(`protocolos_${chave}`) || "[]");
  document.getElementById("competencia").value = localStorage.getItem(`competencia_${chave}`) || "";
  document.getElementById("data-entrega").value = localStorage.getItem(`dataEntrega_${chave}`) || "";
  document.getElementById("container").innerHTML = "";

  if (protocolos.length > 0) {
      protocolos.forEach(p => criarProtocolo(p.empresa, p.documentos, p.recebido));
  } else {
      for (let i = 0; i < 8; i++) criarProtocolo();
  }
}

function criarProtocolo(empresa = "", documentos = "", recebido = "") {
  const div = document.createElement("div");
  div.className = "protocolo";
  div.innerHTML = `
    <button class="remover-btn" title="Excluir protocolo">🗑️</button>
    <button class="adicionar-btn" title="Adicionar novo protocolo">➕</button>
    <div class="linha"><label>Empresa:</label> <input name="empresa" type="text" value="${empresa}"></div>
    <div class="linha"><label>Documentos:</label> <textarea name="documentos">${documentos}</textarea></div>
    <div class="linha assinatura"><label>Assinatura:</label> <input name="recebido" type="text" value="${recebido}"><label>RECEBIDO em:</label><input name="data" type="text"></div>
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

function exportarHTML() {
  const tipo = getChave();
  const htmlContent = document.documentElement.outerHTML;
  const blob = new Blob([htmlContent], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${tipo}.html`;
  link.click();
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
    alert("Dados limpos com sucesso!");
  } else {
    alert("Senha incorreta. Os dados não foram limpos.");
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
      alert("Dados importados com sucesso!");
    } catch (error) {
      alert("Ocorreu um erro ao importar o arquivo. Certifique-se de que é um arquivo JSON válido.");
      console.error(error);
    }
  };
  reader.readAsText(file);
});

document.getElementById("add-btn").addEventListener("click", () => {
  criarProtocolo();
  salvarDados();
});

document.getElementById("competencia").addEventListener("input", salvarDados);
document.getElementById("data-entrega").addEventListener("input", salvarDados);
document.getElementById("exportar-btn").addEventListener("click", exportarHTML);
document.getElementById("exportar-pdf-btn").addEventListener("click", exportarPDF);
document.getElementById("limpar-btn").addEventListener("click", limparDados);
document.getElementById("tipo-protocolo").addEventListener("change", carregarDados);

carregarDados();