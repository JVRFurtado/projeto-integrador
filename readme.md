# Agenda Corporativa Digital

### Sistema Frontend para Gerenciamento de Contatos e Usuários

---

## 1. Introdução

Este projeto consiste no desenvolvimento de uma aplicação web frontend denominada **Agenda Corporativa Digital**, cujo objetivo é fornecer uma interface para gerenciamento de contatos internos e usuários em um ambiente corporativo.

A aplicação foi concebida como parte do **Projeto Integrador I (UNIVESP – 2026)**, utilizando tecnologias web padrão, com foco em simplicidade, acessibilidade e organização modular da interface.

---

## 2. Objetivos

### 2.1 Objetivo Geral

Desenvolver uma interface web responsiva capaz de consumir uma API REST para gerenciamento de contatos e usuários autenticados.

### 2.2 Objetivos Específicos

* Implementar autenticação baseada em tokens (JWT)
* Permitir operações CRUD para contatos
* Permitir gerenciamento de usuários (restrito a administradores)
* Oferecer suporte à internacionalização (i18n)
* Implementar alternância de tema (claro/escuro)
* Garantir responsividade para diferentes dispositivos

---

## 3. Arquitetura do Sistema

A aplicação segue uma arquitetura frontend desacoplada, baseada em consumo de API REST.

### 3.1 Estrutura de Arquivos

```
📁 projeto/
├── index.html   → Estrutura da interface
├── style.css    → Estilização e responsividade
└── app.js       → Lógica de negócio e integração com API
```

### 3.2 Modelo de Comunicação

A comunicação com o backend ocorre via protocolo HTTP, utilizando a **Fetch API**, com autenticação baseada em tokens.

---

## 4. Tecnologias Utilizadas

* **HTML5** – Estrutura semântica da aplicação
* **CSS3** – Estilização com variáveis e suporte a temas
* **JavaScript (ES6+)** – Lógica da aplicação
* **Fetch API** – Comunicação com backend
* **LocalStorage** – Persistência local de dados

---

## 5. Funcionalidades do Sistema

### 5.1 Autenticação

O sistema realiza autenticação via endpoint `/token`, utilizando credenciais fornecidas pelo usuário.

Após autenticação:

* O `access_token` é utilizado nas requisições
* O `refresh_token` permite renovação automática da sessão

---

### 5.2 Gerenciamento de Contatos

Funcionalidades disponíveis:

* Cadastro de contatos
* Listagem de contatos
* Edição de registros (restrito a administradores)
* Exclusão de registros (restrito a administradores)
* Busca dinâmica por múltiplos campos

Campos manipulados:

* Nome
* Departamento
* Ramal

---

### 5.3 Gerenciamento de Usuários

Acesso restrito a usuários com perfil **administrador**.

Funcionalidades:

* Criação de novos usuários
* Listagem de usuários
* Atualização de senha
* Exclusão de usuários

---

### 5.4 Controle de Permissões

O sistema implementa controle de acesso baseado em papéis (RBAC):

* **Administrador**: acesso total
* **Usuário padrão**: acesso restrito à visualização

---

### 5.5 Internacionalização (i18n)

O sistema oferece suporte multilíngue com os seguintes idiomas:

* Português (padrão)
* Inglês
* Espanhol
* Francês
* Alemão
* Italiano

A implementação baseia-se em:

* Atributos `data-i18n` no HTML
* Objeto de tradução em JavaScript
* Persistência do idioma via `localStorage`

---

### 5.6 Tema Escuro/Claro

A aplicação permite alternância entre temas:

* Tema claro (default)
* Tema escuro

Características:

* Detecção automática de preferência do sistema
* Persistência local da escolha do usuário
* Uso de variáveis CSS para estilização dinâmica

---

### 5.7 Responsividade

A interface foi projetada para adaptação a diferentes tamanhos de tela, utilizando:

* Media queries
* Layout flexível (Flexbox e Grid)
* Ajustes específicos para dispositivos móveis

---

## 6. Integração com API

A aplicação depende de uma API REST externa, configurada pela variável:

```js
const API_URL = "";
```

### Endpoints esperados:

| Método | Endpoint         | Função               |
| ------ | ---------------- | -------------------- |
| POST   | `/token`         | Autenticação         |
| POST   | `/refresh`       | Renovação de token   |
| GET    | `/users/me`      | Dados do usuário     |
| GET    | `/pessoas/`      | Listagem de contatos |
| POST   | `/pessoas/`      | Criação de contato   |
| PUT    | `/pessoas/{id}`  | Atualização          |
| DELETE | `/pessoas/{id}`  | Remoção              |
| GET    | `/usuarios/`     | Listagem de usuários |
| POST   | `/usuarios/`     | Criação              |
| PUT    | `/usuarios/{id}` | Atualização          |
| DELETE | `/usuarios/{id}` | Remoção              |

---

## 7. Gerenciamento de Estado

O estado da aplicação é controlado por variáveis globais:

```js
let token;
let refresh;
let role;
let currentUser;
```

Essas variáveis determinam:

* Autenticação
* Permissões
* Contexto do usuário

---

## 8. Tratamento de Erros

O sistema possui tratamento básico de erros:

* Exibição de alertas ao usuário
* Captura de falhas de conexão
* Tratamento de respostas inválidas da API

Limitações:

* Não utiliza sistema estruturado de logs
* Não possui notificações visuais avançadas

---

## 9. Segurança

### Medidas implementadas:

* Uso de tokens JWT
* Renovação automática de sessão
* Restrição de funcionalidades por perfil

### Limitações identificadas:

* Armazenamento de tokens em `localStorage`
* Ausência de criptografia adicional no frontend

---

## 10. Limitações do Projeto

* Arquitetura monolítica no frontend (arquivo único JS)
* Ausência de framework moderno (React, Vue, etc.)
* Falta de testes automatizados
* Dependência de API externa

---

## 11. Trabalhos Futuros

Sugestões de evolução:

* Modularização do código JavaScript
* Migração para frameworks modernos
* Implementação de testes automatizados
* Adoção de boas práticas de segurança (ex: HttpOnly cookies)
* Implementação de paginação e ordenação
* Melhoria da experiência do usuário (UX/UI)

---

## 12. Conclusão

O projeto demonstra a aplicação prática de conceitos fundamentais de desenvolvimento web, incluindo:

* Consumo de APIs REST
* Gerenciamento de estado no frontend
* Controle de acesso baseado em papéis
* Internacionalização
* Responsividade

Apesar de suas limitações, a aplicação atende aos objetivos propostos e constitui uma base sólida para evoluções futuras.

---

## 13. Referências

* Documentação MDN Web Docs
* Especificação Fetch API
* Conceitos de RESTful APIs
* Materiais didáticos da UNIVESP