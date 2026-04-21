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