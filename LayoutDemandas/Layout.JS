document.addEventListener("DOMContentLoaded", function () {
    const demandasContainer = document.getElementById("demandas");

    function criarDemanda(id, titulo, data) {
        const demanda = document.createElement("div");
        demanda.classList.add("demanda");
        demanda.id = id;
        demanda.innerHTML = `
            <h3>${titulo}</h3>
            <p>📅 ${data}</p>
            <button class="arquivar" data-id="${id}">📂 Arquivar</button>
            <button class="excluir" data-id="${id}">🗑️ Excluir</button>
        `;
        demandasContainer.appendChild(demanda);
    }

    function arquivarDemanda(id) {
        const demanda = document.getElementById(id);
        if (demanda) {
            demanda.remove();
            alert("Demanda arquivada com sucesso!");
        }
    }

    function excluirDemanda(id) {
        const demanda = document.getElementById(id);
        if (demanda) {
            demanda.remove();
            alert("Demanda excluída com sucesso!");
        }
    }

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("arquivar")) {
            arquivarDemanda(event.target.dataset.id);
        }
        if (event.target.classList.contains("excluir")) {
            excluirDemanda(event.target.dataset.id);
        }
    });

    // Simulando algumas demandas iniciais
    criarDemanda("demanda1", "Atualizar sistema", "2025-02-12");
    criarDemanda("demanda2", "Corrigir erro na API", "2025-02-11");
    criarDemanda("demanda3", "Implementar novo design", "2025-02-10");

    // Adicionar nova demanda dinamicamente
    document.getElementById("addDemanda").addEventListener("click", function () {
        const titulo = prompt("Digite o título da nova demanda:");
        const data = prompt("Digite a data da demanda (YYYY-MM-DD):");
        if (titulo && data) {
            const id = "demanda" + Math.floor(Math.random() * 1000);
            criarDemanda(id, titulo, data);
        }
    });
});
