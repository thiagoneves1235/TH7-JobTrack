const initialApplications = [
  { id: 1, company: "Nubank", role: "Frontend Engineer", location: "Remoto", status: "interview", date: "Hoje", color: "#7d5bce" },
  { id: 2, company: "iFood", role: "Software Engineer II", location: "São Paulo, SP", status: "pending", date: "02 set", color: "#e95b3e" },
  { id: 3, company: "Stone", role: "Product Designer", location: "Híbrido", status: "pending", date: "30 ago", color: "#18896e" },
  { id: 4, company: "Conta Azul", role: "Frontend Developer", location: "Remoto", status: "offer", date: "28 ago", color: "#238bd0" },
  { id: 5, company: "Mercado Livre", role: "UI Engineer", location: "São Paulo, SP", status: "interview", date: "26 ago", color: "#f3a632" },
  { id: 6, company: "Creditas", role: "Web Developer", location: "Remoto", status: "pending", date: "22 ago", color: "#25a078" }
];
const statusLabels = { interview: "Entrevista", pending: "Em análise", offer: "Oferta" };
let applications = JSON.parse(localStorage.getItem("jobtrack-applications")) || initialApplications;
let activeFilter = "all";

const list = document.querySelector("#applications-list");
const emptyState = document.querySelector("#empty-state");
const modal = document.querySelector("#application-modal");
const toast = document.querySelector("#toast");

function renderApplications() {
  const search = document.querySelector("#search-input").value.toLowerCase().trim();
  const filtered = applications.filter((application) => {
    const matchesFilter = activeFilter === "all" || application.status === activeFilter;
    const matchesSearch = `${application.company} ${application.role}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
  list.innerHTML = filtered.map((application) => `
    <tr>
      <td><div class="company"><span class="company-logo" style="background:${application.color}">${application.company.slice(0, 1)}</span><div><strong>${application.company}</strong><span>${application.role}</span></div></div></td>
      <td>${application.location}</td><td><span class="status ${application.status}">${statusLabels[application.status]}</span></td><td>${application.date}</td>
      <td><button class="row-menu" data-remove="${application.id}" aria-label="Remover candidatura">···</button></td>
    </tr>`).join("");
  emptyState.hidden = filtered.length > 0;
  document.querySelector("#nav-count").textContent = applications.length;
  document.querySelector("#process-count").textContent = applications.filter((item) => item.status !== "offer").length;
  document.querySelector("#interview-count").textContent = applications.filter((item) => item.status === "interview").length;
  document.querySelector("#response-rate").textContent = `${Math.min(99, 30 + applications.length * 2)}%`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll(".filter-tab").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderApplications();
}));
document.querySelector("#search-input").addEventListener("input", renderApplications);
document.querySelector("#clear-filter").addEventListener("click", () => { document.querySelector("#search-input").value = ""; activeFilter = "all"; document.querySelector('[data-filter="all"]').click(); });
document.querySelector("#applications-list").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;
  applications = applications.filter((item) => item.id !== Number(removeButton.dataset.remove));
  localStorage.setItem("jobtrack-applications", JSON.stringify(applications));
  renderApplications();
  showToast("Candidatura removida");
});
document.querySelector("#open-modal").addEventListener("click", () => modal.showModal());
document.querySelector("#application-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  applications.unshift({ id: Date.now(), company: data.get("company"), role: data.get("role"), location: data.get("location"), status: data.get("status"), date: "Agora", color: "#397d71" });
  localStorage.setItem("jobtrack-applications", JSON.stringify(applications));
  event.currentTarget.reset(); modal.close(); renderApplications(); showToast("Candidatura adicionada");
});
document.querySelector("#tip-button").addEventListener("click", (event) => { event.currentTarget.textContent = "Salvo na memória ✓"; showToast("Boa busca, Marina"); });
document.querySelector("#focus-button").addEventListener("click", () => showToast("Plano: envie 3 candidaturas até sexta-feira"));
document.querySelectorAll(".check-button").forEach((button) => button.addEventListener("click", () => { button.classList.toggle("done"); button.closest("li").classList.toggle("done"); }));
renderApplications();