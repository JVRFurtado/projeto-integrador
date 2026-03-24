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

// Função para exibir os contatos na tabela
function exibirContatos() {
    const tabela = document.getElementById('tabelaContatos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpa a tabela antes de preencher
}

function removerContato(index) {
    
}