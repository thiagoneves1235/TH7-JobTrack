const JobTrackAPI = (() => {
  const storageKey = "th7-jobtrack-applications";
  const seed = [
    { id: 1, company: "Nubank", role: "Frontend Engineer", location: "Remoto", status: "interview", date: "Hoje", color: "#7564ca" },
    { id: 2, company: "iFood", role: "Software Engineer II", location: "São Paulo, SP", status: "pending", date: "02 set", color: "#e95b3e" },
    { id: 3, company: "Stone", role: "Product Designer", location: "Híbrido", status: "pending", date: "30 ago", color: "#18896e" },
    { id: 4, company: "Conta Azul", role: "Frontend Developer", location: "Remoto", status: "offer", date: "28 ago", color: "#238bd0" },
    { id: 5, company: "Mercado Livre", role: "UI Engineer", location: "São Paulo, SP", status: "interview", date: "26 ago", color: "#f3a632" },
    { id: 6, company: "Creditas", role: "Web Developer", location: "Remoto", status: "pending", date: "22 ago", color: "#25a078" }
  ];
  const read = () => JSON.parse(localStorage.getItem(storageKey)) || seed;
  const write = (items) => localStorage.setItem(storageKey, JSON.stringify(items));
  return {
    list: () => read(),
    create: (application) => { const items = read(); const created = { ...application, id: Date.now(), date: "Agora", color: "#1264d6" }; write([created, ...items]); return created; },
    remove: (id) => write(read().filter((item) => item.id !== Number(id))),
    stats: () => { const items = read(); return { total: items.length, interviews: items.filter((item) => item.status === "interview").length, offers: items.filter((item) => item.status === "offer").length, inProcess: items.filter((item) => item.status !== "offer").length }; }
  };
})();
