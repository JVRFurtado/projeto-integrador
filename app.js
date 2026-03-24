// Acessa o LocalStorage para armzenar os dados
const contatosStorage = JSON.parse(localStorage.getItem("contatos")) || [];

document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault();

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

// Limpa campos do formulário
document.getElementById('nome').value = '';
document.getElementById('departamento').value = '';
document.getElementById('ramal').value = '';

// Atualiza a tabela
exibirContatos();
});

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
            <td><button onclick="removerContato(${index})">Remover</button></td>`;
        tabela.appendChild(tr);
    });
}

// Função que remove um contato
function removerContato(index) {
    contatosStorage.splice(index, 1);
    localStorage.setItem("contatos", JSON.stringify(contatosStorage));
    exibirContatos();
}

// Função para filtrar contatos
function filtrarContatos() {
    const termoBusca = document.getElementById('buscar').value.toLowerCase();
    const contatosFiltrados = contatosStorage.filter(contato => {
        return contato.nome.toLowerCase().includes(termoBusca) || contato.departamento.toLowerCase().includes(termoBusca);
    });

// Exibe contatos filtrados
const tabela = document.getElementById('tabelaContatos').getElementsByTagName('tbody')[0];
tabela.innerHTML = '';

contatosFiltrados.forEach((contato, index) => {
    const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contato.nome}</td>
            <td>${contato.departamento}</td>
            <td>${contato.ramal}</td>
            <td><button onclick="removerContato(${index})">Remover</button></td>`;
        tabela.appendChild(tr);
});
}

// Exibe o contatos ao carregar a página
exibirContatos();