const statusLabels = { interview: "Entrevista", pending: "Em análise", offer: "Oferta" };
const titles = { dashboard: "Visão geral", applications: "Candidaturas", interviews: "Entrevistas", assistant: "Assistente de carreira", profile: "Meu perfil", settings: "Configurações" };
let activeFilter = "all";
const $ = (selector) => document.querySelector(selector);
const toast = $("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function setAuthMessage(message = "") { $("#auth-message").textContent = message; }

function applyNaturalCopy() {
  const replacements = [
    [".auth-quote>span", "TH7 / SUA BUSCA PROFISSIONAL"],
    [".auth-quote h1", "Organize sua busca. Encontre seu próximo passo."],
    [".auth-quote p", "Tenha candidaturas, entrevistas e planos no mesmo lugar."],
    [".auth-proof strong", "6"],
    [".auth-proof span", "candidaturas no seu radar\nnesta semana"],
    [".auth-visual-footer", "Uma oportunidade de cada vez."],
    [".sidebar-upgrade strong", "Seu ritmo"],
    [".sidebar-upgrade p", "Veja o que merece atenção na sua busca esta semana."],
    [".sidebar-upgrade a", "Ver meu plano  →"],
    [".sidebar-footer", "Dados salvos neste navegador"],
    [".ai-status", "● disponível"],
    [".chat-head strong", "Guia de carreira"],
    [".chat-head span", "Sugestões para sua próxima conversa"],
    ["[data-view=assistant] .eyebrow", "APOIO À DECISÃO"],
    ["[data-view=assistant] .subtitle", "Organize suas ideias para cada oportunidade."],
    ["[data-view=assistant] .ai-context .eyebrow", "SEU MOMENTO"],
    ["[data-view=assistant] .ai-context h2", "Resumo da busca"],
    [".nav-link[data-route=assistant]", "Ajuda de carreira"]
  ];
  replacements.forEach(([selector, text]) => { const element = $(selector); if (element) element.textContent = text; });
  const assistantLink = $(".nav-link[data-route=assistant]");
  if (assistantLink) assistantLink.innerHTML = '<span class="nav-icon">✦</span>Ajuda de carreira <em>NOVO</em>';
  const firstMessage = $("#chat-messages .message.bot");
  if (firstMessage) firstMessage.textContent = "Olá, Marina. Posso ajudar a revisar uma candidatura, preparar uma entrevista ou organizar os próximos passos da sua busca.";
}

function mountDashboardBrief() {
  const welcome = $(".welcome-row");
  if (!welcome || $("#dashboard-brief")) return;
  welcome.insertAdjacentHTML("afterend", '<div class="dashboard-brief" id="dashboard-brief"><div class="brief-main"><span class="brief-marker">◷</span><div><strong>Prioridade de hoje</strong><span>Prepare a conversa técnica da Nubank · terça, 14:30</span></div></div><button class="brief-link" data-route-link="interviews">Abrir preparação →</button></div>');
  $("[data-route-link=interviews]").addEventListener("click", () => { window.location.hash = "#interviews"; });
}

function unlockApp(user) {
  localStorage.setItem("th7-jobtrack-session", JSON.stringify(user));
  $("#auth-shell").hidden = true;
  $(".app-shell").classList.remove("auth-locked");
  document.querySelectorAll(".topbar-name, .workspace-switcher strong").forEach((element) => { element.textContent = user.name; });
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  document.querySelectorAll(".avatar, .workspace-avatar").forEach((element) => { element.textContent = initials; });
  const firstName = user.name.trim().split(" ")[0];
  $(".welcome-row h1").innerHTML = `Olá, ${firstName}<span class="accent">.</span>`;
  setAuthMessage();
}

function initAuth() {
  const session = JSON.parse(localStorage.getItem("th7-jobtrack-session") || "null");
  if (session) unlockApp(session);
  document.querySelectorAll("[data-auth-tab]").forEach((tab) => tab.addEventListener("click", () => {
    const register = tab.dataset.authTab === "register";
    document.querySelectorAll(".auth-tab").forEach((item) => item.classList.toggle("active", item === tab));
    $("#login-form").hidden = register;
    $("#register-form").hidden = !register;
    $("#auth-title").textContent = register ? "Crie seu workspace" : "Acesse seu workspace";
    $("#auth-subtitle").textContent = register ? "Sua próxima oportunidade começa com organização." : "Continue de onde você parou.";
    setAuthMessage();
  }));
  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const users = JSON.parse(localStorage.getItem("th7-jobtrack-users") || "[]");
    const user = users.find((item) => item.email === data.get("email").toLowerCase() && item.password === data.get("password"));
    if (!user) return setAuthMessage("E-mail ou senha incorretos. Confira seus dados e tente novamente.");
    unlockApp(user);
  });
  $("#register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const users = JSON.parse(localStorage.getItem("th7-jobtrack-users") || "[]");
    const email = data.get("email").toLowerCase();
    if (users.some((item) => item.email === email)) return setAuthMessage("Este e-mail já possui um workspace.");
    const user = { name: data.get("name"), email, password: data.get("password") };
    localStorage.setItem("th7-jobtrack-users", JSON.stringify([...users, user]));
    unlockApp(user);
    event.currentTarget.reset();
  });
  $("#forgot-password").addEventListener("click", () => setAuthMessage("Em uma versão conectada, enviaremos um link de recuperação para seu e-mail."));
  $("#guest-access").addEventListener("click", () => unlockApp({ name: "Visitante", email: "guest" }));
}

function downloadData() {
  const payload = { exportedAt: new Date().toISOString(), applications: JobTrackAPI.list() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "th7-jobtrack-export.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Dados exportados com sucesso");
}

function restoreTasks() {
  const completed = JSON.parse(localStorage.getItem("th7-jobtrack-tasks") || "[]");
  document.querySelectorAll(".check-button").forEach((button, index) => {
    if (completed.includes(index)) {
      button.classList.add("done");
      button.closest("li").classList.add("done");
    }
    button.addEventListener("click", () => {
      const current = JSON.parse(localStorage.getItem("th7-jobtrack-tasks") || "[]");
      const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      localStorage.setItem("th7-jobtrack-tasks", JSON.stringify(next));
    });
  });
}

function renderRow(application) {
  return `<tr><td><div class="company"><span class="company-logo" style="background:${application.color}">${application.company.slice(0, 1)}</span><div><strong>${application.company}</strong><span>${application.role}</span></div></div></td><td>${application.location}</td><td><span class="status ${application.status}">${statusLabels[application.status]}</span></td><td>${application.date}</td><td><button class="row-menu" data-remove="${application.id}" aria-label="Remover candidatura">···</button></td></tr>`;
}

function filteredApplications(search = "") {
  const query = search.toLowerCase().trim();
  return JobTrackAPI.list().filter((application) => {
    const matchesFilter = activeFilter === "all" || application.status === activeFilter;
    const matchesSearch = `${application.company} ${application.role} ${application.location}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderApplications(search = "") {
  const items = filteredApplications(search);
  const dashboardList = $("#dashboard-list");
  const applicationsList = $("#applications-list");
  if (dashboardList) dashboardList.innerHTML = items.slice(0, 5).map(renderRow).join("");
  if (applicationsList) {
    applicationsList.innerHTML = items.map(renderRow).join("");
    $("#empty-state").hidden = items.length > 0;
  }
  const stats = JobTrackAPI.stats();
  $("#nav-count").textContent = stats.total;
  $("#process-count").textContent = stats.inProcess;
  $("#interview-count").textContent = stats.interviews;
  $("#response-rate").textContent = `${Math.min(99, 30 + stats.total * 2)}%`;
  $("#all-count").textContent = stats.total;
  $("#pipeline-interviews").textContent = stats.interviews;
  $("#pipeline-offers").textContent = stats.offers;
}

function setRoute() {
  const route = window.location.hash.replace("#", "") || "dashboard";
  const current = titles[route] ? route : "dashboard";
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.dataset.view === current));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === current));
  $("#page-title").textContent = titles[current];
  $("#sidebar").classList.remove("open");
  const session = JSON.parse(localStorage.getItem("th7-jobtrack-session") || "null");
  if (session) {
    const firstName = session.name.trim().split(" ")[0];
    $(".welcome-row h1").innerHTML = `Olá, ${firstName}<span class="accent">.</span>`;
  }
  renderApplications();
}

function openApplicationModal() { $("#application-modal").showModal(); }
document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", openApplicationModal));
$("#application-modal").addEventListener("close", () => {
  if (window.location.hash === "#dashboard" || !window.location.hash) $("#dashboard-search").focus();
});
$("#application-modal .close-button").addEventListener("click", (event) => {
  event.preventDefault();
  $("#application-modal").close();
});

$("#application-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  JobTrackAPI.create({ company: data.get("company"), role: data.get("role"), location: data.get("location"), status: data.get("status") });
  event.currentTarget.reset(); $("#application-modal").close(); renderApplications(); showToast("Candidatura adicionada ao pipeline");
});

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove]");
  if (remove) { JobTrackAPI.remove(remove.dataset.remove); renderApplications(); showToast("Candidatura removida"); }
  const toastButton = event.target.closest("[data-toast]");
  if (toastButton) showToast(toastButton.dataset.toast);
});

document.querySelectorAll(".filter-tab").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.remove("active"));
  button.classList.add("active"); activeFilter = button.dataset.filter; renderApplications($("#dashboard-search").value);
}));
$("#dashboard-search").addEventListener("input", (event) => renderApplications(event.target.value));
$("#applications-search").addEventListener("input", (event) => renderApplications(event.target.value));
$("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#notifications-button").addEventListener("click", () => {
  let panel = $("#notification-popover");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notification-popover";
    panel.className = "notification-popover";
    panel.innerHTML = '<header><strong>Notificações</strong><span>2 novas</span></header><article class="notice-item"><i class="notice-dot"></i><div><strong>Entrevista confirmada</strong><p>Nubank respondeu. Sua conversa é dia 08/09 às 14:30.</p></div></article><article class="notice-item"><i class="notice-dot"></i><div><strong>Meta semanal em andamento</strong><p>Você já completou 7 de 10 candidaturas.</p></div></article><a class="notice-link" href="#interviews">Ver minha agenda →</a>';
    panel.hidden = true;
    $(".topbar-actions").appendChild(panel);
  }
  panel.hidden = !panel.hidden;
});
document.addEventListener("click", (event) => { const panel = $("#notification-popover"); if (panel && !event.target.closest(".topbar-actions")) panel.hidden = true; });
$("#logout-button").addEventListener("click", () => {
  localStorage.removeItem("th7-jobtrack-session");
  $(".app-shell").classList.add("auth-locked");
  $("#auth-shell").hidden = false;
  showToast("Sessão encerrada");
});
$("#save-profile").addEventListener("click", () => {
  const fields = [...document.querySelectorAll(".profile-fields input, .profile-fields textarea")].map((field) => field.value);
  localStorage.setItem("th7-jobtrack-profile", JSON.stringify(fields));
  showToast("Perfil salvo com sucesso");
});
$(".danger-button").addEventListener("click", downloadData);

document.querySelectorAll(".check-button").forEach((button) => button.addEventListener("click", () => { button.classList.toggle("done"); button.closest("li").classList.toggle("done"); }));

document.querySelectorAll("[data-chat]").forEach((button) => button.addEventListener("click", () => sendChat(button.dataset.chat)));
$("#chat-form").addEventListener("submit", (event) => { event.preventDefault(); const input = $("#chat-input"); if (input.value.trim()) { sendChat(input.value.trim()); input.value = ""; } });
function sendChat(text) {
  const messages = $("#chat-messages");
  if (!messages) return;
  messages.insertAdjacentHTML("beforeend", `<div class="message user">${text}</div>`);
  window.setTimeout(() => messages.insertAdjacentHTML("beforeend", `<div class="message bot">Boa escolha. Vou organizar isso em passos práticos: alinhe seu exemplo com resultados mensuráveis, explique suas decisões e finalize com uma pergunta para o time. Quer que eu detalhe o roteiro?</div>`), 350);
  messages.scrollTop = messages.scrollHeight;
}

window.addEventListener("hashchange", setRoute);
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) openApplicationModal();
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) { event.preventDefault(); $("#dashboard-search").focus(); }
});
restoreTasks();
initAuth();
applyNaturalCopy();
mountDashboardBrief();
setRoute();
