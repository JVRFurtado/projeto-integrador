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
};

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
