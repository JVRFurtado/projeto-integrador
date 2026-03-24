// Acessa o LocalStorage para armzenar os dados
const contatosStorage = JSON.parse(localStorage.getItem("contatos")) || [];

document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o recarregamento da página
});

// Coleta dados do formulário
const nome = document.getElementById('nome').value;
const departamento = document.getElementById('departamento').value;
const ramal = document.getElementById('ramal').value;

// Cria um novo contato
const novoContato = {
    nome,
    departamento,
    ramal,
};

// Adiciona o novo contato ao armazenamento
contatosStorage.push(novoContato);
localStorage.setItem("contatos", JSON.stringify(contatosStorage));

// Função para exibir os contatos na tabela
function exibirContatos() {
    const tabela = document.getElementById('tabelaContatos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpa a tabela antes de preencher
    
    contatosStorage.forEach((contato, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${contato.nome}</td>
        <td>${contato.departamento}</td>
        <td>${contato.ramal}</td>
        <td><button onclicl="removerContato(${index})">Remover</>button</td>`;
        tabela.appendChild(tr);
    });
}

function removerContato(index) {
    
}