const API_URL = "https://projeto-integrador-back-production.up.railway.app";

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

const username = document.getElementById("username");
const password = document.getElementById("password");

const userNome = document.getElementById("userNome");
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

let token = localStorage.getItem("token");
let role = "";
let currentUser = "";

let listaContatos = [];
let listaUsuarios = [];

let editandoContato = null;
let editandoUsuario = null;

/* ================= ALERT ================= */
function alerta(msg) {
    const lang = localStorage.getItem("lang") || "pt";
    const translatedMsg = getTranslation(msg, lang);
    alert(translatedMsg);
}

/* ================= LOGIN ================= */
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
        const formData = new URLSearchParams();
        formData.append(
            "username",
            username.value
        );

        formData.append(
            "password",
            password.value
        );

        const res = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/x-www-form-urlencoded"
                },
                body: formData
            }
        );

        if (!res.ok) {
            alerta("loginInvalid");
            return;
        }

        const data = await res.json();
        token = data.access_token;
        localStorage.setItem(
            "token",
            token
        );
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

    if (token) {
        try {
            await carregarUsuario();
        } catch {
            logout();
        }
    }
};

/* ================= USER ================= */
async function carregarUsuario() {
    const res = await apiFetch(
        `${API_URL}/users/me`
    );
    const user = await res.json();
    role = user.role;
    currentUser = user.nome;
    entrarSistema();
}

function entrarSistema() {
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    if (
        role !== "admin" &&
        role !== "gestor"
    ) {
        btnUsuarios.style.display = "none";
        btnContatos.style.display = "none";
        formCadastro.style.display = "none";
        colAcoes.style.display = "none";
    } else {
        carregarUsuarios();
    }

    exibirContatos();
}

/* ================= API ================= */
async function apiFetch(
    url,
    options = {}
) {

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization:
                `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            logout();
            return;
        }

        if (!res.ok) {
            const err = await res.json()
            .catch(() => ({}));
            console.error(err);
            alerta(
                err.detail || "genericError"
            );
        }
        return res;
    } catch (e) {
        console.error(e);
        alerta("connectionError");
    }
}

/* ================= CONTATOS ================= */
formCadastro.onsubmit = async (e) => {
    e.preventDefault();
    await apiFetch(
        `${API_URL}/pessoas/`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
                nome: nome.value,
                departamento: departamento.value,
                ramal: ramal.value
            })
        }
    );
    nome.value = "";
    departamento.value = "";
    ramal.value = "";
    exibirContatos();
};

async function exibirContatos() {
    const res = await apiFetch(
        `${API_URL}/pessoas/`
    );
    listaContatos = await res.json();
    renderContatos(listaContatos);
}

function renderContatos(lista) {

    tabelaContatos.innerHTML = "";

    lista.forEach(c => {

        if (
            editandoContato === c.id &&
            role === "admin"
        ) {

            tabelaContatos.innerHTML += `
                <tr>
                    <td>
                        <input
                            value="${c.ramal}"
                            id="c-ramal-${c.id}"
                        >
                    </td>

                    <td>
                        <input
                            value="${c.departamento}"
                            id="c-dep-${c.id}"
                        >
                    </td>

                    <td>
                        <input
                            value="${c.nome}"
                            id="c-nome-${c.id}"
                        >
                    </td>

                    <td>
                        <button onclick="salvarContato(${c.id})">
                            💾
                        </button>

                        <button onclick="cancelarEdicao()">
                            ❌
                        </button>
                    </td>
                </tr>
            `;

        } else {

            tabelaContatos.innerHTML += `
                <tr>
                    <td>${c.ramal}</td>
                    <td>${c.departamento}</td>
                    <td>${c.nome}</td>

                    ${role === "admin"
                        ? `
                        <td>
                            <button onclick="editarContato(${c.id})">
                                ✏️
                            </button>

                            <button onclick="removerContato(${c.id})">
                                🗑️
                            </button>
                        </td>
                        `
                        : ""
                    }
                </tr>
            `;
        }
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

    const nome = document.getElementById(
        `c-nome-${id}`
    ).value;

    const departamento = document.getElementById(
        `c-dep-${id}`
    ).value;

    const ramal = document.getElementById(
        `c-ramal-${id}`
    ).value;

    await apiFetch(
        `${API_URL}/pessoas/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome,
                departamento,
                ramal
            })
        }
    );

    editandoContato = null;

    exibirContatos();
}

async function removerContato(id) {
    if (!confirm("Excluir?")) return;
    await apiFetch(`${API_URL}/pessoas/${id}`, { method: "DELETE" });
    exibirContatos();
}

/* ================= USUÁRIOS ================= */
async function carregarUsuarios() {
    const res = await apiFetch(`${API_URL}/usuarios/`);
    listaUsuarios = await res.json();
    renderUsuarios(listaUsuarios);
}

function renderUsuarios(lista) {
    tabelaUsuarios.innerHTML = "";

    lista.forEach(u => {
        const podeEditarSenha =
            u.nome || u.txnome === currentUser || u.aotipousuario !== "admin";

        tabelaUsuarios.innerHTML += `
            <tr>
                <td>${u.nome}</td>
                <td>${u.aotipousuario}</td>
                <td>
                    ${podeEditarSenha
                        ? `<input type="password" id="senha-${u.id}" data-i18n="newPass" placeholder="Nova senha">`
                        : "🔒"}
                </td>
                <td>
                    <button onclick="salvarUsuario(${u.id})">💾</button>
                    <button onclick="removerUsuario(${u.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function criarUsuario() {
    if (userNome.value.length <= 0 || null)
        return alerta("validName");

    if (userSenha.value.length < 6)
        return alerta("minLength");

    await apiFetch(
    `${API_URL}/usuarios/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nome: userNome.value,
            senha: userSenha.value,
            tipo: userTipo.value
        })
    });

    userNome.value = "";
    userSenha.value = "";

    carregarUsuarios();
}

async function salvarUsuario(id) {
    const senha = document.getElementById(`senha-${id}`)?.value;

    await apiFetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            senha: senha || undefined
        })
    });

    carregarUsuarios();
}

async function removerUsuario(id) {
    if (!confirm("Excluir?")) return;
    await apiFetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
    carregarUsuarios();
}

/* ================= UI ================= */
function mostrarAba(aba) {
    abaContatos.style.display = aba === "contatos" ? "block" : "none";
    abaUsuarios.style.display = aba === "usuarios" ? "block" : "none";
}

function logout() {
    const theme = localStorage.getItem("theme");
    const lang = localStorage.getItem("lang");

    localStorage.clear();

    if (theme) localStorage.setItem("theme", theme);
    if (lang) localStorage.setItem("lang", lang);

    location.reload();
}

/* ================= DARK MODE ================= */
function aplicarTemaAutomatico() {
    const saved = localStorage.getItem("theme");

    const isDark =
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
        document.documentElement.classList.add("dark");
        themeToggle.checked = true;
    } else {
        document.documentElement.classList.remove("dark");
        themeToggle.checked = false;
    }

    atualizarIconeTema();
}

themeToggle.onchange = () => {
    const isDark = themeToggle.checked;

    document.documentElement.classList.toggle("dark", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");

    atualizarIconeTema();
};

function atualizarIconeTema() {
    themeIcon.innerText = themeToggle.checked ? "🌙" : "☀️";
}

/* ================= I18N ================= */
const i18n = {
    "pt": { "title":"Agenda Corporativa", "login":"Iniciar sessão", "enter":"Entrar", "contacts":"Contatos", "users":"Usuários", "password":"Senha", "logout":"Sair", "save":"Salvar", "create":"Criar", "name":"Nome", "department":"Departamento", "extension":"Ramal", "actions":"Ações", "search":"Buscar...", "searchUsers":"Buscar usuário...", "nameUser":"Nome de usuário", "standard":"Padrão", "admin":"Admin", "newPass":"Nova senha", "type":"Tipo", "validName":"Adicione um nome de usuário válido", "minLength":"Senha deve ter no mínimo 6 caracteres", "loginInvalid":"Login inválido", "serverOffline":"Servidor offline", "connectionError":"Erro de conexão com servidor", "genericError":"Erro", "filter":"Filtrar","responsible":"Responsável" },
    "en": { "title":"Corporate Directory", "login":"Login", "enter":"Login", "contacts":"Contacts", "users":"Users", "password":"Password", "logout":"Logout", "save":"Save", "create":"Create", "name":"Name", "department":"Department", "extension":"Extension", "actions":"Actions", "search":"Search...", "searchUsers":"Search for users...", "nameUser":"Username", "standard":"Standard", "admin":"Admin", "newPass":"New password", "type":"Role", "validName":"Please provide a valid username", "minLength":"Password must be at least 6 characters", "loginInvalid":"Invalid login", "serverOffline":"Server offline", "connectionError":"Server connection error", "genericError":"Error", "filter":"Filter", "responsible":"Responsible", },
    "es": { "title":"Directorio Corporativo", "login":"Iniciar sesión", "enter":"Entrar", "contacts":"Contactos", "users":"Usuarios", "password":"Contraseña", "logout":"Cerrar sesión", "save":"Guardar", "create":"Crear", "name":"Nombre", "department":"Departamento", "extension":"Extensión", "actions":"Acciones", "search":"Buscar...", "searchUsers":"Buscar usuario...", "nameUser":"Nombre de usuario", "standard":"Estándar", "admin":"Administrador", "newPass":"Nueva contraseña", "type":"Rol", "validName":"Por favor, ingresa un nombre de usuario válido", "minLength":"La contraseña debe tener al menos 6 caracteres", "loginInvalid":"Inicio de sesión inválido", "serverOffline":"Servidor fuera de línea", "connectionError":"Error de conexión con el servidor", "genericError":"Error", "filter":"Filtro","responsible":"Responsable" },
    "fr": { "title":"Annuaire d'entreprise", "login":"Se connecter", "enter":"Entrer", "contacts":"Contacts", "users":"Utilisateurs", "password":"Mot de passe", "logout":"Se déconnecter", "save":"Sauvegarder", "create":"Créer", "name":"Nom", "department":"Département", "extension":"Poste", "actions":"Actions", "search":"Rechercher...", "searchUsers":"Rechercher un utilisateur...", "nameUser":"Nom d'utilisateur", "standard":"Standard", "admin":"Administrateur", "newPass":"Nouveau mot de passe", "type":"Rôle", "validName":"Veuillez fournir un nom d'utilisateur valide", "minLength":"Le mot de passe doit contenir au moins 6 caractères", "loginInvalid":"Connexion invalide", "serverOffline":"Serveur hors ligne", "connectionError":"Erreur de connexion au serveur", "genericError":"Erreur", "filter":"Filtre","responsible":"Responsable" },
    "de": { "title":"Firmenverzeichnis", "login":"Anmelden", "enter":"Einloggen", "contacts":"Kontakte", "users":"Benutzer", "password":"Passwort", "logout":"Abmelden", "save":"Speichern", "create":"Erstellen", "name":"Name", "department":"Abteilung", "extension":"Durchwahl", "actions":"Aktionen", "search":"Suchen...", "searchUsers":"Benutzer suchen...", "nameUser":"Benutzername", "standard":"Standard", "admin":"Administrator", "newPass":"Neues Passwort", "type":"Rolle", "validName":"Bitte geben Sie einen gültigen Benutzernamen ein", "minLength":"Das Passwort muss mindestens 6 Zeichen lang sein", "loginInvalid":"Ungültige Anmeldung", "serverOffline":"Server offline", "connectionError":"Serververbindungsfehler", "genericError":"Fehler", "filter":"Filter","responsible":"Verantwortlich" },
    "it": { "title":"Rubrica Aziendale", "login":"Accedi", "enter":"Entra", "contacts":"Contatti", "users":"Utenti", "password":"Password", "logout":"Esci", "save":"Salva", "create":"Crea", "name":"Nome", "department":"Dipartimento", "extension":"Interno", "actions":"Azioni", "search":"Cerca...", "searchUsers":"Cerca utente...", "nameUser":"Nome utente", "standard":"Standard", "admin":"Amministratore", "newPass":"Nuova password", "type":"Ruolo", "validName":"Inserisci un nome utente valido", "minLength":"La password deve contenere almeno 6 caratteri", "loginInvalid":"Accesso non valido", "serverOffline":"Server offline", "connectionError":"Errore di connessione al server", "genericError":"Errore", "filter":"Filtro","responsible":"Responsabile" }
};

langSwitch.onchange = () => {
    localStorage.setItem("lang", langSwitch.value);
    aplicarIdioma(langSwitch.value);
};

function getTranslation(key, lang = 'pt') {
    return i18n[lang][key] || i18n['pt'][key];
}

function aplicarIdioma(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        if (el.dataset.i18n) {
            if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") {
                el.placeholder = i18n[lang][el.dataset.i18n];
            } else {
                el.innerText = i18n[lang][el.dataset.i18n];
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

    if (!i18n[lang]) lang = "pt";

    langSwitch.value = lang;
    aplicarIdioma(lang);
}

/* ================= FILTRAR ================= */
function filtrarContatos() {
    const termo = buscar.value.toLowerCase().trim();
    const tipo = tipoFiltro.value;

    if (!termo) {
        return renderContatos(listaContatos);
    }

    const filtrados = listaContatos.filter(contato => {
        const valor = contato[tipo]?.toLowerCase() || "";
        return valor.includes(termo);
    });

    renderContatos(filtrados);
}

function filtrarUsuarios() {
    const termo = buscarUsuarios.value.toLowerCase();

    const filtrados = listaUsuarios.filter(u =>
        (u.nome || u.txnome)
        .toLowerCase().includes(termo)
    );

    renderUsuarios(filtrados);
}
