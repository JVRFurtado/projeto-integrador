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
const tipoFiltroUsuarios = document.getElementById("tipoFiltroUsuarios");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const langSwitch = document.getElementById("langSwitch");

const logoutBtn = document.getElementById("logoutBtn");

const formUsuarios = document.getElementById("formUsuarios");

const liveRegion = document.getElementById("liveRegion");

function announce(message) {

    if (!liveRegion) return;

    liveRegion.textContent = "";

    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

/* ================= ESTADO ================= */

let token = localStorage.getItem("token");
let role = "";
let currentUser = "";

let listaContatos = [];
let listaUsuarios = [];

let editandoContato = null;

let buscaUsuarios = "";
let filtroUsuarios = "nome";
let editandoUsuarios = {};

function currentLang() {

    return localStorage.getItem("lang") || "pt";
}

function escapeHtml(str = "") {

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
                                             
/* ================= ALERT ================= */

function alerta(msg) {

    const lang = localStorage.getItem("lang") || "pt";

    const texto = getTranslation(msg, lang);

    announce(texto);

    alert(texto);
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

        token = String(data.access_token || "");

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
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {})
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

    /* ================= USUÁRIO PADRÃO ================= */

    if (role === "gestor") {

        const adminOption =
            document.querySelector(
                '#userTipo option[value="admin"]'
            );

        if (adminOption) {
            adminOption.remove();
        }
    }

    if (role !== "admin" && role !== "gestor") {

        btnUsuarios.style.display = "none";

        /* ESCONDE BOTÃO CONTATOS */
        btnContatos.style.display = "none";

        /* ESCONDE FORM DE CADASTRO */
        formCadastro.style.display = "none";

        /* ESCONDE COLUNA AÇÕES */
        colAcoes.style.display = "none";

        abaUsuarios.style.display = "none";

    } else {

        /* ADMIN */

        carregarUsuarios();

        /* COMEÇA NA ABA CONTATOS */
        mostrarAba("contatos");
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

    window.location.href = "/";
}

/* ================= CONTATOS ================= */

formCadastro.onsubmit = async (e) => {

    e.preventDefault();

    const body = {
        nome: nome.value.trim(),
        departamento: departamento.value.trim(),
        ramal: ramal.value.trim()
    };

    const res = await apiFetch(
        `${API_URL}/pessoas/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!res) return;

    nome.value = "";
    departamento.value = "";
    ramal.value = "";

    /* ATUALIZA AS DUAS */
    await exibirContatos();
    await carregarUsuarios();
}

async function exibirContatos() {

    const res = await apiFetch(`${API_URL}/pessoas/`);

    if (!res) return;

    listaContatos = await res.json();

    renderContatos(listaContatos);
}

function renderContatos(lista) {

    tabelaContatos.innerHTML = "";

    const isAdmin =
        role === "admin" ||
        role === "gestor"

    if (!Array.isArray(lista)) {
        lista = [];
    }

    lista.forEach(contato => {

        if (!contato || contato.id == null) {
            return;
        }

        const contatoId = Number(contato.id);

        const editando =
            editandoContato === contatoId;

        const nomeContato =
            escapeHtml(contato.nome || "");

        const departamentoContato =
            escapeHtml(contato.departamento || "");

        const ramalContato =
            escapeHtml(contato.ramal || "");

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                ${
                    editando
                    ? `
                        <input
                            id="c-ramal-${contatoId}"
                            value="${escapeHtml(ramalContato)}"
                        >
                    `
                    : ramalContato
                }
            </td>

            <td>
                ${
                    editando
                    ? `
                        <input
                            id="c-dep-${contatoId}"
                            value="${escapeHtml(departamentoContato)}"
                        >
                    `
                    : departamentoContato
                }
            </td>

            <td>
            ${
                editando
                ? `
                    <input
                        id="c-nome-${contatoId}"
                        value="${escapeHtml(nomeContato)}"
                    >
                    `
                    : nomeContato
                }
            </td>
    
            ${
                isAdmin
                ? `
                    <td>

                        ${
                            editando
                            ? `
                                <button
                                    type="button"
                                    onclick="salvarContato(${contatoId})"
                                >
                                    💾
                                </button>

                                <button
                                    type="button"
                                    onclick="cancelarEdicao()"
                                >
                                    ❌
                                </button>
                            `
                            : `
                                <button
                                    onclick="editarContato(${contatoId})"
                                    type="button"
                                    title="${getTranslation("editContact", currentLang())}"
                                >
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    onclick="removerContato(${contatoId})"
                                    aria-label="${getTranslation("deleteContact", currentLang())}"
                                >
                                    🗑️
                                </button>
                            `
                        }

                    </td>
                `
                : ""
            }
        `;

        tabelaContatos.appendChild(tr);
    });
}

function editarContato(id) {

    editandoContato = id;

    renderContatos(listaContatos);
}

function cancelarEdicao() {

    editandoContato = null;

    renderContatos(listaContatos || []);
}

async function salvarContato(id) {

    const nomeContato =
        document.getElementById(`c-nome-${id}`)?.value || "";

    const departamentoContato =
        document.getElementById(`c-dep-${id}`)?.value || "";

    const ramalContato =
        document.getElementById(`c-ramal-${id}`)?.value || "";

    const body = {
        nome: nomeContato.trim(),
        departamento: departamentoContato,
        ramal: ramalContato
    };

    const res = await apiFetch(
        `${API_URL}/pessoas/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!res) return;

    editandoContato = null;

    /* ATUALIZA AS DUAS */
    await exibirContatos();
    await carregarUsuarios();
}

async function removerContato(id) {

    if (!confirm(getTranslation("deleteConfirm", currentLang()))) {
        return;
    }

    editandoContato = null;

    const res = await apiFetch(
        `${API_URL}/pessoas/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!res) return;

    /* ATUALIZA AS DUAS */
    await exibirContatos();
    await carregarUsuarios();
}

/* ================= USUÁRIOS ================= */

formUsuarios.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!formUsuarios.checkValidity()) {

        formUsuarios.reportValidity();

        return;
    }

    await criarUsuario();
});
        
async function carregarUsuarios() {

    const res = await apiFetch(`${API_URL}/usuarios/`);

    if (!res) return;

    listaUsuarios = await res.json();

    /* LIMPA CACHE */
    editandoUsuarios = {};

    renderUsuarios(listaUsuarios);
}

function renderUsuarios(lista) {

    tabelaUsuarios.innerHTML = "";

    lista.forEach(u => {

        const id = Number(u.id ?? u.idpessoa);

        const nome = escapeHtml(u.nome || u.txnome || "");
        const username = escapeHtml(u.username || u.txusername || "");
        const email = escapeHtml(u.email || u.txemail || "");
        const tipo = u.tipo || u.aotipousuario || "padrao";

       if (!editandoUsuarios[id]) {

            editandoUsuarios[id] = {
                nome,
                username,
                email,
                tipo,
                senha: ""
            };
        }

        const editando = editandoUsuarios[id];

        const bloqueado =
            (
                role === "gestor" &&
                (
                    tipo === "admin" ||
                    tipo === "gestor"
                )
            ) ||
            (
                role === "admin" &&
                tipo === "admin" &&
                nome !== currentUser
            );

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <input
                    id="u-nome-${id}"
                    value="${escapeHtml(editando.nome)}"
                >
            </td>

            <td>
                <input
                    id="u-username-${id}"
                    value="${escapeHtml(editando.username)}"
                >
            </td>

            <td>
                <input
                    id="u-email-${id}"
                    value="${escapeHtml(editando.email)}"
                >
            </td>

            <td>
                ${
                    bloqueado
                    ? `
                        <span class="badge-admin">
                            ${getTranslation(tipo, currentLang())}
                        </span>
                    `
                    : `
                       <select id="u-tipo-${id}">
                            <option value="padrao" data-i18n="standard"
                                ${editando.tipo === "padrao" ? "selected" : ""}>
                                ${getTranslation("standard", currentLang())}
                            </option>

                            <option value="gestor" data-i18n="manager"
                                ${editando.tipo === "gestor" ? "selected" : ""}>
                                ${getTranslation("manager", currentLang())}
                            </option>

                            ${
                                role === "admin"
                                ? `
                                    <option value="admin" data-i18n="admin"
                                        ${editando.tipo === "admin" ? "selected" : ""}>
                                        ${getTranslation("admin", currentLang())}
                                    </option>
                                `
                                : ""
                            }
                        </select>
                    `
                }
            </td>

            <td class="user-password">
                ${
                    bloqueado
                    ? "🔒"
                    : `
                        <input
                            id="u-senha-${id}"
                            type="password"
                            data-i18n="newPass"
                            placeholder="${getTranslation("newPass", currentLang())}"
                            aria-label="${getTranslation("newPass", currentLang())}"
                        >
                    `
                }
            </td>

            <td>
                <div class="user-actions">

                    ${
                        bloqueado
                        ? "🔒"
                        : `
                            <button
                                type="button"
                                onclick="salvarUsuario(${id})"
                                aria-label="${getTranslation("save", currentLang())}"
                            >
                                <span aria-hidden="true">💾</span>
                            </button>
                        `
                    }

                   ${
                        (
                            nome === currentUser
                            ||
                            (
                                role === "gestor" &&
                                (
                                    tipo === "admin" ||
                                    tipo === "gestor"
                                )
                            )
                        )
                        ? `
                            <span
                                class="lock-icon"
                                title="${getTranslation("protectedUser", currentLang())}"
                            >
                                 <span aria-hidden="true">🔒</span>
                            </span>
                        `
                        : `
                            <button
                                type="button"
                                onclick="removerUsuario(${id})"
                                aria-label="${getTranslation("deleteUser", currentLang())}"
                            >
                                <span aria-hidden="true">🗑️</span>
                            </button>
                        `
                    }

                </div>
            </td>
        `;

        tabelaUsuarios.appendChild(tr);
    });
}

async function criarUsuario() {

    if (!formUsuarios.checkValidity()) {

        formUsuarios.reportValidity();

        return;
    }

    const nomeValue = userNome.value.trim();
    const usernameValue = userUsername.value.trim();
    const emailValue = userEmail.value.trim();
    const senhaValue = userSenha.value;

    userEmail.setCustomValidity("");

    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    if (!emailValido) {

        userEmail.setCustomValidity("E-mail inválido");

        userEmail.reportValidity();

        return;
    }

    if (senhaValue.length < 6) {

        userSenha.setCustomValidity(
            "A senha deve ter no mínimo 6 caracteres"
        );

        userSenha.reportValidity();

        return;
    }

    userSenha.setCustomValidity("");

    /* GESTOR NÃO CRIA ADMIN */
    if (
        role === "gestor" &&
        userTipo.value === "admin"
    ) {
        return;
    }

    const res = await apiFetch(
        `${API_URL}/usuarios/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nomeValue,
                username: usernameValue,
                email: emailValue,
                senha: senhaValue,
                tipo: userTipo.value
            })
        }
    );

    if (!res) return;

    userNome.value = "";
    userUsername.value = "";
    userEmail.value = "";
    userSenha.value = "";

    await carregarUsuarios();
    await exibirContatos();

    mostrarAba("usuarios");
}

async function salvarUsuario(id) {

    const nome =
        document.getElementById(`u-nome-${id}`)?.value.trim() || "";

    const username =
        document.getElementById(`u-username-${id}`)?.value.trim() || "";

    const email =
        document.getElementById(`u-email-${id}`)?.value.trim() || "";

    const tipoEl =
        document.getElementById(`u-tipo-${id}`);

    const senhaEl =
        document.getElementById(`u-senha-${id}`);

    const tipo = tipoEl ? tipoEl.value : "padrao";
    const senha = senhaEl ? senhaEl.value : "";

    if (senha && senha.length < 6) {
        alerta("minLength");
        return;
    }

    const body = {
        nome,
        username,
        email,
        tipo
    };

    if (senha) {
        body.senha = senha;
    }

    const res = await apiFetch(
        `${API_URL}/usuarios/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!res) return;

    await carregarUsuarios();
    await exibirContatos();
}

async function removerUsuario(id) {

    const usuario = listaUsuarios.find(u => {
        return (u.id ?? u.idpessoa) === id;
    });

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

    /* NÃO PODE EXCLUIR A SI MESMO */
    if (
        nomeUsuario === currentUser
    ) {
        return;
    }

    /* GESTOR NÃO REMOVE GESTOR/ADMIN */
    if (
        role === "gestor" &&
        (
            tipoUsuario === "admin" ||
            tipoUsuario === "gestor"
        )
    ) {
        return;
    }

    const res = await apiFetch(
        `${API_URL}/usuarios/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!res) return;

    await carregarUsuarios();
    await exibirContatos();
}

/* ================= ENTER NAVEGAÇÃO ================= */

const camposUsuarios = [
    userNome,
    userUsername,
    userEmail,
    userSenha,
    userTipo
];

userEmail.addEventListener("input", () => {
    userEmail.setCustomValidity("");
});

userSenha.addEventListener("input", () => {
    userSenha.setCustomValidity("");
});

camposUsuarios.forEach((campo, index) => {

    campo.addEventListener("keydown", (e) => {

        if (e.key !== "Enter") return;

        if (campo.tagName === "SELECT") {
            return;
        }

        const ultimoCampo =
            index === camposUsuarios.length - 1;

        if (!ultimoCampo) {

            e.preventDefault();

            camposUsuarios[index + 1].focus();

        }
    });
});

/* ================= ABAS ================= */

function mostrarAba(aba) {

    const isAdmin =
        role === "admin" ||
        role === "gestor"

    /* USUÁRIO PADRÃO */
    if (!isAdmin) {

        abaContatos.style.display = "block";
        abaUsuarios.style.display = "none";

        return;
    }

    /* ADMIN */

    if (aba === "contatos") {

        abaContatos.style.display = "block";
        abaUsuarios.style.display = "none";

        btnContatos.style.display = "none";
        btnUsuarios.style.display = "block";

    } else {

        abaContatos.style.display = "none";
        abaUsuarios.style.display = "block";

        btnContatos.style.display = "block";
        btnUsuarios.style.display = "none";
    }
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

    themeIcon.textContent =
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
        email:"Email",
        manager:"Gestor",
        loginPlaceholder:"Nome de usuário ou email",
        deleteContact:"Excluir contato",
        deleteUser:"Excluir usuário",
        editContact:"Editar contato",
        protectedUser:"Usuário protegido",
        deleteConfirm:"Tem certeza?"
    },

    en: {
        title: "Corporate Agenda",
        login: "Login",
        enter: "Enter",
        contacts: "Contacts",    
        users: "Users",
        password: "Password",
        logout: "Logout",
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
        email: "Email",
        manager:"Manager",
        loginPlaceholder:"Username or email",
        deleteContact:"Delete contact",
        deleteUser:"Delete user",
        editContact:"Edit contact",
        deleteConfirm:"Are you sure?",
        protectedUser:"Protected user"
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
        email: "Correo electrónico",
        manager:"Gestor",
        loginPlaceholder:"Nombre de usuario o correo electrónico",
        deleteConfirm:"¿Estás seguro?",
        deleteContact:"Eliminar contacto",
        deleteUser:"Eliminar usuario",
        editContact:"Editar contacto",
        protectedUser:"Usuario protegido"
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
        email: "Email",
        manager:"Gestionnaire",
        deleteConfirm:"Êtes-vous sûr ?",
        loginPlaceholder:"Nom d'utilisateur ou e-mail",
        deleteContact:"Supprimer le contact",
        deleteUser:"Supprimer l’utilisateur",
        editContact:"Modifier le contact",
        protectedUser:"Utilisateur protégé"
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
        email: "E-Mail",
        manager:"Manager",
        loginPlaceholder:"Benutzername oder E‑Mail",
        deleteConfirm:"Bist du sicher?",
        deleteContact:"Kontakt löschen",
        deleteUser:"Benutzer löschen",
        editContact:"Kontakt bearbeiten",
        protectedUser:"Geschützter Benutzer"
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
        email: "Email",
        manager:"Gestore",
        loginPlaceholder:"Nome utente o email",
        deleteContact:"Elimina contatto",
        deleteUser:"Elimina utente",
        editContact:"Modifica contatto",
        protectedUser:"Utente protetto",
        deleteConfirm:"Sei sicuro?"
    }
};

/* ================= IDIOMA ================= */

langSwitch.onchange = () => {

    const lang = langSwitch.value;

    localStorage.setItem("lang", lang);

    aplicarIdioma(lang);

    renderContatos(listaContatos);
    renderUsuarios(listaUsuarios);
};

function getTranslation(key, lang = "pt") {

    return (
        i18n[lang]?.[key] ||
        i18n["pt"]?.[key] ||
        key
    );
}

function aplicarIdioma(lang) {

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {

        const key = el.dataset.i18n;

        const texto = getTranslation(key, lang);

        const tag = el.tagName.toLowerCase();

        if (
            tag === "input" ||
            tag === "textarea"
        ) {

            el.placeholder = texto;
            el.setAttribute("aria-label", texto);

        } else if (tag === "select") {

            el.setAttribute("aria-label", texto);

        } else if (tag === "option") {

            el.textContent = texto;

        } else {

            if (el.children.length === 0) {
                el.textContent = texto;
            }
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

    const termo = buscarUsuarios.value
        .toLowerCase()
        .trim();

    const tipo = tipoFiltroUsuarios.value;

    if (!termo) {
        return renderUsuarios(listaUsuarios);
    }

    const filtrados = listaUsuarios.filter(u => {

        let valor = "";

        if (tipo === "nome") {
            valor = (u.nome || "").toLowerCase();
        }

        if (tipo === "username") {
            valor = (u.username || u.txusername || "").toLowerCase();
        }

        if (tipo === "email") {
            valor = (u.email || u.txemail || "").toLowerCase();
        }

        return valor.includes(termo);
    });

    renderUsuarios(filtrados);
}
