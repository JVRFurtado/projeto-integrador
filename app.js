const API_URL = "";

let token = localStorage.getItem("token");
let refresh = localStorage.getItem("refresh");
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
        const res = await fetch(`${API_URL}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${username.value}&password=${password.value}`
        });

        if (!res.ok) return alerta("loginInvalid");

        const data = await res.json();

        token = data.access_token;
        refresh = data.refresh_token;

        localStorage.setItem("token", token);
        localStorage.setItem("refresh", refresh);

        await carregarUsuario();

    } catch {
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
    const res = await apiFetch(`${API_URL}/users/me`);
    const user = await res.json();

    role = user.role;
    currentUser = user.nome;

    entrarSistema();
}

function entrarSistema() {
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    if (role !== "admin") {
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
async function apiFetch(url, options = {}) {
    try {
        let res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`
            }
        });

        if (res.status === 401 && refresh) {
            await refreshToken();
            return apiFetch(url, options);
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alerta(err.detail || "genericError");
        }

        return res;

    } catch {
        alerta("connectionError");
        logout();
    }
}

async function refreshToken() {
    const res = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `token=${refresh}`
    });

    if (!res.ok) return logout();

    const data = await res.json();
    token = data.access_token;
    localStorage.setItem("token", token);
}

/* ================= CONTATOS ================= */
formCadastro.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", nome.value);
    formData.append("departamento", departamento.value);
    formData.append("ramal", ramal.value);

    await apiFetch(`${API_URL}/pessoas/`, {
        method: "POST",
        body: formData
    });

    nome.value = "";
    departamento.value = "";
    ramal.value = "";

    exibirContatos();
};

async function exibirContatos() {
    const res = await apiFetch(`${API_URL}/pessoas/`);
    listaContatos = await res.json();
    renderContatos(listaContatos);
}

function renderContatos(lista) {
    tabelaContatos.innerHTML = "";

    lista.forEach(c => {

        if (editandoContato === c.id && role === "admin") {

            tabelaContatos.innerHTML += `
                <tr>
                    <td><input value="${c.nome}" id="c-nome-${c.id}"></td>
                    <td><input value="${c.departamento}" id="c-dep-${c.id}"></td>
                    <td><input value="${c.ramal}" id="c-ramal-${c.id}"></td>
                    <td>
                        <button onclick="salvarContato(${c.id})">💾</button>
                        <button onclick="cancelarEdicao()">❌</button>
                    </td>
                </tr>
            `;

        } else {

            tabelaContatos.innerHTML += `
                <tr>
                    <td>${c.nome}</td>
                    <td>${c.departamento}</td>
                    <td>${c.ramal}</td>

                    ${role === "admin" ? `
                    <td>
                        <button onclick="editarContato(${c.id})">✏️</button>
                        <button onclick="removerContato(${c.id})">🗑️</button>
                    </td>
                    ` : ""}
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

    const nome = document.getElementById(`c-nome-${id}`).value;
    const departamento = document.getElementById(`c-dep-${id}`).value;
    const ramal = document.getElementById(`c-ramal-${id}`).value;

    await apiFetch(`${API_URL}/pessoas/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nome, departamento, ramal })
    });

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
            u.nome === currentUser || u.aotipousuario !== "admin";

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

    await apiFetch(`${API_URL}/usuarios/`, {
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
        themeToggle.checked = true; // 🔥 FIX
    } else {
        document.documentElement.classList.remove("dark");
        themeToggle.checked = false; // 🔥 FIX
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

