(() => {
  "use strict";
  const STORAGE_KEY = "seixaslira-pwa-v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const defaultState = {
    tasks: [
      { id: cryptoId(), title: "Organizar a agenda da família", owner: "Eu", done: false, createdAt: Date.now() },
      { id: cryptoId(), title: "Conferir a lista do mercado", owner: "Nós dois", done: false, createdAt: Date.now() },
      { id: cryptoId(), title: "Planejar a rotina da ZOE", owner: "Eu", done: true, createdAt: Date.now() }
    ],
    market: [],
    zoe: [],
    notes: ""
  };
  let state = loadState();
  let editingTaskId = null;
  let toastTimer;

  function cryptoId() {
    return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...parsed };
    } catch (error) {
      console.warn("Não foi possível ler os dados locais.", error);
      return structuredClone(defaultState);
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      showToast("Não foi possível salvar. Verifique o espaço disponível no navegador.");
      console.error(error);
      return false;
    }
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
  function updateSummary() {
    const done = state.tasks.filter(task => task.done).length;
    $("#completedCount").textContent = `${done}/${state.tasks.length}`;
    $("#progressBar").style.width = `${state.tasks.length ? done / state.tasks.length * 100 : 0}%`;
    const pending = state.market.filter(item => !item.bought).length;
    $("#marketCount").textContent = `${pending} ${pending === 1 ? "item" : "itens"}`;
    $("#marketPendingCount").textContent = pending;
  }
  function taskMarkup(task, collection = "tasks") {
    const done = collection === "market" ? task.bought : task.done;
    const owner = task.owner ? `<span class="task-meta">${escapeHTML(task.owner)}</span>` : "";
    const quantity = task.quantity ? `<span class="task-meta">Quantidade: ${escapeHTML(task.quantity)}</span>` : "";
    return `<article class="task-item ${done ? "done" : ""}">
      <input class="task-check" type="checkbox" aria-label="${done ? "Desmarcar" : "Marcar"} ${escapeHTML(task.title)}"
        data-action="toggle" data-collection="${collection}" data-id="${escapeHTML(task.id)}" ${done ? "checked" : ""}>
      <div class="task-main"><span class="task-title">${escapeHTML(task.title)}</span>${owner}${quantity}</div>
      <button class="icon-button" type="button" aria-label="Editar ${escapeHTML(task.title)}" title="Editar"
        data-action="edit" data-collection="${collection}" data-id="${escapeHTML(task.id)}">✎</button>
      <button class="icon-button" type="button" aria-label="Excluir ${escapeHTML(task.title)}" title="Excluir"
        data-action="delete" data-collection="${collection}" data-id="${escapeHTML(task.id)}">×</button>
    </article>`;
  }
  function renderTasks() {
    const filter = $("#taskFilter").value;
    const owner = $("#ownerFilter").value;
    const visible = state.tasks.filter(task =>
      (filter === "all" || (filter === "pending" && !task.done) || (filter === "done" && task.done)) &&
      (owner === "all" || task.owner === owner)
    );
    $("#allTasks").innerHTML = visible.map(task => taskMarkup(task)).join("");
    $("#tasksEmpty").hidden = visible.length > 0;
    const today = state.tasks.filter(task => !task.done).slice(0, 4);
    $("#todayTasks").innerHTML = today.map(task => taskMarkup(task)).join("");
    $("#todayEmpty").hidden = today.length > 0;
  }
  function renderMarket() {
    $("#marketPending").innerHTML = state.market.filter(item => !item.bought).map(item => taskMarkup(item, "market")).join("");
    $("#marketBought").innerHTML = state.market.filter(item => item.bought).map(item => taskMarkup(item, "market")).join("");
  }
  function renderZoe() {
    $("#zoeTasks").innerHTML = state.zoe.map(task => taskMarkup(task, "zoe")).join("");
  }
  function renderNotes() {
    const notes = $("#familyNotes");
    if (notes.value !== state.notes) notes.value = state.notes;
  }
  function renderAll() {
    updateSummary(); renderTasks(); renderMarket(); renderZoe(); renderNotes();
  }
  function addTask(title, owner, collection = "tasks") {
    const cleaned = title.trim();
    if (!cleaned) return;
    const item = { id: cryptoId(), title: cleaned, owner, done: false, createdAt: Date.now() };
    state[collection].unshift(item);
    saveState(); renderAll(); showToast("Adicionado à lista.");
  }
  function findItem(collection, id) {
    const key = collection === "market" ? "market" : collection === "zoe" ? "zoe" : "tasks";
    return { key, item: state[key].find(item => item.id === id) };
  }
  function editItem(collection, id) {
    const { item } = findItem(collection, id);
    if (!item) return;
    editingTaskId = { collection, id };
    $("#editTitle").value = item.title;
    $("#editOwner").value = item.owner || "Eu";
    $("#editOwner").parentElement.querySelector('label[for="editOwner"]').hidden = collection === "market";
    $("#editOwner").hidden = collection === "market";
    $("#editDialog").showModal();
  }
  function handleAction(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, collection, id } = target.dataset;
    const { key, item } = findItem(collection, id);
    if (!item) return;
    if (action === "toggle") {
      if (collection === "market") item.bought = target.checked;
      else item.done = target.checked;
      saveState(); renderAll();
    } else if (action === "edit") {
      editItem(collection, id);
    } else if (action === "delete") {
      if (!confirm(`Excluir "${item.title}"?`)) return;
      state[key] = state[key].filter(entry => entry.id !== id);
      saveState(); renderAll(); showToast("Item excluído.");
    }
  }
  $$(".nav-tab").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-goto]").forEach(button => button.addEventListener("click", () => setView(button.dataset.goto)));
  function setView(view) {
    $$(".nav-tab").forEach(button => button.classList.toggle("active", button.dataset.view === view || (view === "today" && button.dataset.view === "today")));
    $$(".view").forEach(panel => panel.classList.toggle("active", panel.id === `view-${view}`));
    $("#summaryGrid").hidden = !["today", "tasks", "market"].includes(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#taskForm").addEventListener("submit", event => {
    event.preventDefault();
    addTask($("#taskTitle").value, $("#taskOwner").value);
    $("#taskTitle").value = ""; $("#taskTitle").focus();
  });
  $("#marketForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("#marketTitle").value.trim();
    if (!title) return;
    state.market.unshift({ id: cryptoId(), title, quantity: $("#marketQty").value.trim(), bought: false, createdAt: Date.now() });
    saveState(); renderAll(); $("#marketTitle").value = ""; $("#marketQty").value = ""; $("#marketTitle").focus(); showToast("Produto adicionado.");
  });
  $("#zoeForm").addEventListener("submit", event => {
    event.preventDefault(); addTask($("#zoeTitle").value, "ZOE", "zoe"); $("#zoeTitle").value = "";
  });
  $("#taskFilter").addEventListener("change", renderTasks);
  $("#ownerFilter").addEventListener("change", renderTasks);
  $("#clearBought").addEventListener("click", () => {
    const count = state.market.filter(item => item.bought).length;
    if (!count) { showToast("Ainda não há itens comprados para limpar."); return; }
    if (!confirm(`Remover ${count} ${count === 1 ? "item comprado" : "itens comprados"} da lista?`)) return;
    state.market = state.market.filter(item => !item.bought);
    saveState(); renderAll(); showToast("Itens comprados removidos.");
  });
  $("#editForm").addEventListener("submit", event => {
    if (event.submitter && event.submitter.id !== "saveEdit") return;
    event.preventDefault();
    if (!editingTaskId) return;
    const { key, item } = findItem(editingTaskId.collection, editingTaskId.id);
    if (item) {
      item.title = $("#editTitle").value.trim();
      if (editingTaskId.collection !== "market") item.owner = $("#editOwner").value;
      saveState(); renderAll(); showToast("Alterações salvas.");
    }
    $("#editDialog").close(); editingTaskId = null;
  });
  $("#familyNotes").addEventListener("input", () => {
    state.notes = $("#familyNotes").value;
    saveState();
    $("#noteStatus").textContent = "Salvo neste navegador.";
  });
  const date = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  $("#todayLabel").textContent = date.charAt(0).toUpperCase() + date.slice(1);
  document.addEventListener("click", handleAction);
  renderAll();
})();
