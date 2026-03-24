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

function exibirContatos() {
    const tabela = document.getElementById('tabelaContatos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
}