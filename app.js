const statusLabels = { interview: "Entrevista", pending: "Em análise", offer: "Oferta" };
const titles = { dashboard: "Visão geral", applications: "Candidaturas", interviews: "Entrevistas", assistant: "Assistente IA", profile: "Meu perfil", settings: "Configurações" };
let activeFilter = "all";
const $ = (selector) => document.querySelector(selector);
const toast = $("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
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
  renderApplications();
}

function openApplicationModal() { $("#application-modal").showModal(); }
document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", openApplicationModal));

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
$("#notifications-button").addEventListener("click", () => showToast("Você não tem novas notificações"));
$("#save-profile").addEventListener("click", () => showToast("Perfil salvo com sucesso"));

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
setRoute();
