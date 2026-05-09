const API_URL = "https://projeto-integrador-back-production.up.railway.app";

/* ================= ELEMENTOS ================= */

const loginForm = document.getElementById("loginForm");
const formCadastro = document.getElementById("formCadastro");

const dashboard = document.getElementById("dashboard");
const loginSection = document.getElementById("loginSection");

const btnUsuarios = document.getElementById("btnUsuarios");
const btnContatos = document.getElementById("btnContatos");

const tabelaContatos = document.getElementById("tabelaContatos");
const tabelaUsuarios = document.getElementById("tabelaUsuarios");

const colAcoes = document.getElementById("colAcoes");

const nome = document.getElementById("nome");
const departamento = document.getElementById("departamento");
const ramal = document.getElementById("ramal");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const userNome = document.getElementById("userNome");
const userUsername = document.getElementById("userUsername");
const userEmail = document.getElementById("userEmail");
const userSenha = document.getElementById("userSenha");
const userTipo = document.getElementById("userTipo");

const abaContatos = document.getElementById("abaContatos");
const abaUsuarios = document.getElementById("abaUsuarios");

const buscar = document.getElementById("buscar");
const buscarUsuarios = document.getElementById("buscarUsuarios");

const tipoFiltro = document.getElementById("tipoFiltro");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const langSwitch = document.getElementById("langSwitch");

const logoutBtn = document.getElementById("logoutBtn");

/* ================= ESTADO ================= */

let token = localStorage.getItem("token");
let role = "";
let currentUser = "";

let listaContatos = [];
let listaUsuarios = [];

let editandoContato = null;

/* ================= ALERT ================= */

function alerta(msg) {
    const lang = localStorage.getItem("lang") || "pt";
    alert(getTranslation(msg, lang));
}

/* ================= LOGIN ================= */

loginForm.onsubmit = async (e) => {

    e.preventDefault();

    try {

        const formData = new URLSearchParams();

        formData.append("username", loginUsername.value.trim());
        formData.append("password", loginPassword.value);

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        if (!res.ok) {

            let err = {};

            try {
                err = await res.json();
            } catch {}

            console.error(err);

            alerta("loginInvalid");
            return;
        }

        const data = await res.json();

        if (!data.access_token) {
            alerta("loginInvalid");
            return;
        }

        token = data.access_token;

        localStorage.setItem("token", token);

        await carregarUsuario();

    } catch (e) {

        console.error(e);

        alerta("serverOffline");
    }
};

/* ================= INIT ================= */

window.onload = async () => {

    aplicarTemaAutomatico();
    aplicarIdiomaAuto();

    logoutBtn.style.display = "none";

    if (token) {

        try {

            await carregarUsuario();

        } catch (e) {

            console.error(e);

            logout();
        }
    }
};

/* ================= API ================= */

async function apiFetch(url, options = {}) {

    try {

        const res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            logout();
            return null;
        }

        if (!res.ok) {

            let err = {};

            try {
                err = await res.json();
            } catch {}

            console.error(err);

            alerta(err.detail || "genericError");

            return null;
        }

        return res;

    } catch (e) {

        console.error(e);

        alerta("connectionError");

        return null;
    }
}

/* ================= USER ================= */

async function carregarUsuario() {

    const res = await apiFetch(`${API_URL}/users/me`);

    if (!res) return;

    const user = await res.json();

    role = user.role || "padrao";
    currentUser = user.nome || "";

    entrarSistema();
}

function entrarSistema() {

    loginSection.style.display = "none";
    dashboard.style.display = "block";

    logoutBtn.style.display = "inline-block";

    if (role !== "admin" && role !== "gestor") {

        btnUsuarios.style.display = "none";

        abaUsuarios.style.display = "none";

    } else {

        btnUsuarios.style.display = "block";

        carregarUsuarios();
    }

    exibirContatos();
}

/* ================= LOGOUT ================= */

function logout() {

    const theme = localStorage.getItem("theme");
    const lang = localStorage.getItem("lang");

    localStorage.clear();

    if (theme) localStorage.setItem("theme", theme);
    if (lang) localStorage.setItem("lang", lang);

    location.reload();
}

/* ================= CONTATOS ================= */

formCadastro.onsubmit = async (e) => {

    e.preventDefault();

    const res = await apiFetch(`${API_URL}/pessoas/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: nome.value.trim(),
            departamento: departamento.value.trim(),
            ramal: ramal.value.trim()
        })
    });

    if (!res) return;

    nome.value = "";
    departamento.value = "";
    ramal.value = "";

    exibirContatos();
};

async function exibirContatos() {

    const res = await apiFetch(`${API_URL}/pessoas/`);

    if (!res) return;

    listaContatos = await res.json();

    renderContatos(listaContatos);
}

function renderContatos(lista) {

    tabelaContatos.innerHTML = "";

    lista.forEach(contato => {

        const editando = editandoContato === contato.id;

        tabelaContatos.innerHTML += `
            <tr>

                <td>
                    ${editando
                        ? `<input id="c-ramal-${contato.id}" value="${contato.ramal || ""}">`
                        : contato.ramal || ""
                    }
                </td>

                <td>
                    ${editando
                        ? `<input id="c-dep-${contato.id}" value="${contato.departamento || ""}">`
                        : contato.departamento || ""
                    }
                </td>

                <td>
                    ${editando
                        ? `<input id="c-nome-${contato.id}" value="${contato.nome || ""}">`
                        : contato.nome || ""
                    }
                </td>

                <td>
                    ${
                        role === "admin" || role === "gestor"
                        ? (
                            editando
                            ? `
                                <button onclick="salvarContato(${contato.id})">💾</button>
                                <button onclick="cancelarEdicao()">❌</button>
                            `
                            : `
                                <button onclick="editarContato(${contato.id})">✏️</button>
                                <button onclick="removerContato(${contato.id})">🗑️</button>
                            `
                        )
                        : "-"
                    }
                </td>

            </tr>
        `;
    });
}

function editarContato(id) {

    editandoContato = id;

    renderContatos(listaContatos);
}

function cancelarEdicao() {

    editandoContato = null;

    renderContatos(listaContatos);
}

async function salvarContato(id) {

    const nomeContato = document.getElementById(`c-nome-${id}`).value;
    const departamentoContato = document.getElementById(`c-dep-${id}`).value;
    const ramalContato = document.getElementById(`c-ramal-${id}`).value;

    const res = await apiFetch(`${API_URL}/pessoas/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: nomeContato,
            departamento: departamentoContato,
            ramal: ramalContato
        })
    });

    if (!res) return;

    editandoContato = null;

    exibirContatos();
}

async function removerContato(id) {

    if (!confirm("Excluir?")) return;

    const res = await apiFetch(`${API_URL}/pessoas/${id}`, {
        method: "DELETE"
    });

    if (!res) return;

    exibirContatos();
}

/* ================= USUÁRIOS ================= */

async function carregarUsuarios() {

    const res = await apiFetch(`${API_URL}/usuarios/`);

    if (!res) return;

    listaUsuarios = await res.json();

    renderUsuarios(listaUsuarios);
}

function renderUsuarios(lista) {

    tabelaUsuarios.innerHTML = "";

    lista.forEach(u => {

        const tipoUsuario =
            u.tipo ||
            u.role ||
            u.aotipousuario ||
            "padrao";

        const nomeUsuario =
            u.nome ||
            u.txnome ||
            "";

        const usernameUsuario =
            u.username ||
            u.txusername ||
            "";

        const emailUsuario =
            u.email ||
            u.txemail ||
            "";

        const adminEditandoOutroAdmin =
            role === "admin" &&
            tipoUsuario === "admin" &&
            nomeUsuario !== currentUser;

        const podeEditarSenha =
            !adminEditandoOutroAdmin;

        const podeExcluir =
            nomeUsuario !== currentUser;

        tabelaUsuarios.innerHTML += `
            <tr>

                <td>${nomeUsuario}</td>

                <td>${usernameUsuario}</td>

                <td>${emailUsuario}</td>

                <td>
                    ${tipoUsuario}
                </td>

                <td style="padding-right: 12px;">

                    ${
                        podeEditarSenha
                        ? `
                            <input
                                type="password"
                                id="senha-${u.id}"
                                placeholder="${getTranslation("newPass")}"
                                style="min-width: 120px;"
                            >
                        `
                        : "🔒"
                    }

                </td>

                <td style="padding-left: 12px; white-space: nowrap;">

                    ${
                        podeEditarSenha
                        ? `
                            <button onclick="salvarUsuario(${u.id})">
                                💾
                            </button>
                        `
                        : ""
                    }

                    ${
                        podeExcluir
                        ? `
                            <button onclick="removerUsuario(${u.id})">
                                🗑️
                            </button>
                        `
                        : "🔐"
                    }

                </td>

            </tr>
        `;
    });
}
async function criarUsuario() {

    if (userSenha.value.length < 6) {
        alerta("minLength");
        return;
    }

    const res = await apiFetch(`${API_URL}/usuarios/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: userNome.value.trim(),
            username: userUsername.value.trim(),
            email: userEmail.value.trim(),
            senha: userSenha.value,
            tipo: userTipo.value
        })
    });

    if (!res) return;

    userNome.value = "";
    userUsername.value = "";
    userEmail.value = "";
    userSenha.value = "";

    carregarUsuarios();
}

async function salvarUsuario(id) {

    const usuario = listaUsuarios.find(u => u.id === id);

    if (!usuario) return;

    const nomeUsuario =
        usuario.nome ||
        usuario.txnome ||
        "";

    const tipoUsuario =
        usuario.tipo ||
        usuario.role ||
        usuario.aotipousuario ||
        "padrao";

    /* ADMIN NÃO PODE ALTERAR SENHA DE OUTRO ADMIN */
    if (
        role === "admin" &&
        tipoUsuario === "admin" &&
        nomeUsuario !== currentUser
    ) {

        alert("Você não pode alterar a senha de outro admin.");

        return;
    }

    const senha = document.getElementById(`senha-${id}`)?.value;

    if (!senha) return;

    const res = await apiFetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            senha
        })
    });

    if (!res) return;

    carregarUsuarios();
}

async function removerUsuario(id) {

    const usuario = listaUsuarios.find(u => u.id === id);

    if (!usuario) return;

    const nomeUsuario =
        usuario.nome ||
        usuario.txnome ||
        "";

    const tipoUsuario =
        usuario.tipo ||
        usuario.role ||
        usuario.aotipousuario ||
        "padrao";

    /* NÃO DEIXA ADMIN EXCLUIR A SI MESMO */
    if (
        nomeUsuario === currentUser &&
        tipoUsuario === "admin"
    ) {

        alert("O administrador não pode excluir a própria conta.");

        return;
    }

    /* ADMIN NÃO PODE EXCLUIR OUTRO ADMIN */
    if (
        role === "admin" &&
        tipoUsuario === "admin"
    ) {

        alert("Admins não podem excluir outros admins.");

        return;
    }

    if (!confirm("Excluir?")) return;

    const res = await apiFetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE"
    });

    if (!res) return;

    carregarUsuarios();
}

/* ================= ABAS ================= */

function mostrarAba(aba) {

    abaContatos.style.display =
        aba === "contatos" ? "block" : "none";

    abaUsuarios.style.display =
        aba === "usuarios" ? "block" : "none";
}

/* ================= DARK MODE ================= */

function aplicarTemaAutomatico() {

    const saved = localStorage.getItem("theme");

    const isDark =
        saved === "dark" ||
        (!saved &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);

    themeToggle.checked = isDark;

    atualizarIconeTema();
}

themeToggle.onchange = () => {

    const isDark = themeToggle.checked;

    document.documentElement.classList.toggle("dark", isDark);

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    atualizarIconeTema();
};

function atualizarIconeTema() {

    themeIcon.innerText =
        themeToggle.checked ? "🌙" : "☀️";
}

/* ================= I18N ================= */

const i18n = {

    pt: {
        title:"Agenda Corporativa",
        login:"Iniciar sessão",
        enter:"Entrar",
        contacts:"Contatos",
        users:"Usuários",
        password:"Senha",
        logout:"Sair",
        save:"Salvar",
        create:"Criar",
        name:"Nome",
        department:"Departamento",
        extension:"Ramal",
        actions:"Ações",
        search:"Buscar...",
        searchUsers:"Buscar usuário...",
        nameUser:"Nome de usuário",
        standard:"Padrão",
        admin:"Admin",
        newPass:"Nova senha",
        type:"Tipo",
        validName:"Adicione um nome válido",
        minLength:"Senha deve ter no mínimo 6 caracteres",
        loginInvalid:"Login inválido",
        serverOffline:"Servidor offline",
        connectionError:"Erro de conexão com servidor",
        genericError:"Erro",
        filter:"Filtrar",
        responsible:"Responsável",
        email:"Email"
    },

    en: {
        title: "Corporate Agenda",
        login: "Log in",
        enter: "Enter",
        contacts: "Contacts",    
        users: "Users",
        password: "Password",
        logout: "Log out",
        save: "Save",
        create: "Create",
        name: "Name",
        department: "Department",
        extension: "Extension",
        actions: "Actions",
        search: "Search...",
        searchUsers: "Search user...",
        nameUser: "Username",
        standard: "Standard",
        admin: "Admin",
        newPass: "New password",
        type: "Type",
        validName: "Please enter a valid name",
        minLength: "Password must be at least 6 characters",
        loginInvalid: "Invalid login",
        serverOffline: "Server offline",
        connectionError: "Server connection error",
        genericError: "Error",
        filter: "Filter",
        responsible: "Responsible",
        email: "Email"
    },

    es: {
        title: "Agenda Corporativa",
        login: "Iniciar sesión",
        enter: "Entrar",
        contacts: "Contactos",
        users: "Usuarios",
        password: "Contraseña",
        logout: "Cerrar sesión",
        save: "Guardar",
        create: "Crear",
        name: "Nombre",
        department: "Departamento",
        extension: "Extensión",
        actions: "Acciones",
        search: "Buscar...",
        searchUsers: "Buscar usuario...",
        nameUser: "Nombre de usuario",
        standard: "Estándar",
        admin: "Administrador",
        newPass: "Nueva contraseña",
        type: "Tipo",
        validName: "Ingrese un nombre válido",
        minLength: "La contraseña debe tener al menos 6 caracteres",
        loginInvalid: "Inicio de sesión inválido",
        serverOffline: "Servidor desconectado",
        connectionError: "Error de conexión con el servidor",
        genericError: "Error",
        filter: "Filtrar",
        responsible: "Responsable",
        email: "Correo electrónico"
    },

    fr: {
        title: "Agenda d'entreprise",
        login: "Se connecter",
        enter: "Entrer",
        contacts: "Contacts",
        users: "Utilisateurs",
        password: "Mot de passe",
        logout: "Se déconnecter",
        save: "Enregistrer",
        create: "Créer",
        name: "Nom",
        department: "Département",
        extension: "Extension",
        actions: "Actions",
        search: "Rechercher...",
        searchUsers: "Rechercher un utilisateur...",
        nameUser: "Nom d'utilisateur",
        standard: "Standard",
        admin: "Admin",
        newPass: "Nouveau mot de passe",
        type: "Type",
        validName: "Veuillez entrer un nom valide",
        minLength: "Le mot de passe doit contenir au moins 6 caractères",
        loginInvalid: "Connexion invalide",
        serverOffline: "Serveur hors ligne",
        connectionError: "Erreur de connexion au serveur",
        genericError: "Erreur",
        filter: "Filtrer",
        responsible: "Responsable",
        email: "Email"
    },

    de: {
        title: "Unternehmensagenda",
        login: "Anmelden",
        enter: "Einloggen",
        contacts: "Kontakte",
        users: "Benutzer",
        password: "Passwort",
        logout: "Abmelden",
        save: "Speichern",
        create: "Erstellen",
        name: "Name",
        department: "Abteilung",
        extension: "Durchwahl",
        actions: "Aktionen",
        search: "Suchen...",
        searchUsers: "Benutzer suchen...",
        nameUser: "Benutzername",
        standard: "Standard",
        admin: "Admin",
        newPass: "Neues Passwort",
        type: "Typ",
        validName: "Bitte geben Sie einen gültigen Namen ein",
        minLength: "Passwort muss mindestens 6 Zeichen haben",
        loginInvalid: "Ungültige Anmeldung",
        serverOffline: "Server offline",
        connectionError: "Serververbindungsfehler",
        genericError: "Fehler",
        filter: "Filtern",
        responsible: "Verantwortlich",
        email: "E-Mail"
    },

    it: {
        title: "Agenda Aziendale",
        login: "Accedi",
        enter: "Entra",
        contacts: "Contatti",
        users: "Utenti",
        password: "Password",
        logout: "Esci",
        save: "Salva",
        create: "Crea",
        name: "Nome",
        department: "Dipartimento",
        extension: "Interno",
        actions: "Azioni",
        search: "Cerca...",
        searchUsers: "Cerca utente...",
        nameUser: "Nome utente",
        standard: "Standard",
        admin: "Admin",
        newPass: "Nuova password",
        type: "Tipo",
        validName: "Inserisci un nome valido",
        minLength: "La password deve avere almeno 6 caratteri",
        loginInvalid: "Accesso non valido",
        serverOffline: "Server offline",
        connectionError: "Errore di connessione al server",
        genericError: "Errore",
        filter: "Filtra",
        responsible: "Responsabile",
        email: "Email"
    }
};

/* ================= IDIOMA ================= */

langSwitch.onchange = () => {

    localStorage.setItem("lang", langSwitch.value);

    aplicarIdioma(langSwitch.value);
};

function getTranslation(key, lang = "pt") {

    return (
        i18n[lang]?.[key] ||
        i18n["pt"]?.[key] ||
        key
    );
}

function aplicarIdioma(lang) {

    document.querySelectorAll("[data-i18n]").forEach(el => {

        const key = el.dataset.i18n;

        const texto = getTranslation(key, lang);

        if (
            el.tagName.toLowerCase() === "input" ||
            el.tagName.toLowerCase() === "textarea"
        ) {

            el.placeholder = texto;

        } else {

            el.innerText = texto;
        }
    });

    localStorage.setItem("lang", lang);
}

function aplicarIdiomaAuto() {

    let lang = localStorage.getItem("lang");

    if (!lang) {
        lang = navigator.language.slice(0, 2);
    }

    if (!i18n[lang]) {
        lang = "pt";
    }

    langSwitch.value = lang;

    aplicarIdioma(lang);
}

/* ================= FILTROS ================= */

function filtrarContatos() {

    const termo =
        buscar.value.toLowerCase().trim();

    const tipo = tipoFiltro.value;

    if (!termo) {

        renderContatos(listaContatos);

        return;
    }

    const filtrados = listaContatos.filter(contato => {

        const valor = String(
            contato[tipo] || ""
        ).toLowerCase();

        return valor.includes(termo);
    });

    renderContatos(filtrados);
}

function filtrarUsuarios() {

    const termo =
        buscarUsuarios.value.toLowerCase();

    const filtrados = listaUsuarios.filter(u => {

        const nome =
            (u.nome || "")
            .toLowerCase();

        const username =
            (u.username || "")
            .toLowerCase();

        return (
            nome.includes(termo) ||
            username.includes(termo)
        );
    });

    renderUsuarios(filtrados);
}
