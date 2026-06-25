(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  let userId = "";
  let items = [];
  let editingId = "";

  const labels = { today: "Oggi", urgent: "Urgente", later: "Più avanti", done: "Completati" };

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
  }

  function sorted(list) {
    return items
      .filter(item => item.list === list)
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1) || Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.created_at || "").localeCompare(String(b.created_at || "")));
  }

  function renderSummary() {
    const counts = ["today", "urgent", "later", "done"].map(list => `<span class="chip">${labels[list]}: ${items.filter(item => item.list === list).length}</span>`);
    $("summary").innerHTML = counts.join("");
  }

  function itemHtml(item) {
    const due = item.due_date ? ` · scadenza ${safe(item.due_date)}` : "";
    return `<div class="todo ${item.completed ? "done" : ""}" data-item="${safe(item.id)}">
      <div class="todo-title"><input type="checkbox" data-toggle="${safe(item.id)}" ${item.completed ? "checked" : ""}><div><strong>${safe(item.title)}</strong><div class="small">${safe(labels[item.list] || item.list)}${due}</div>${item.note ? `<p class="small">${safe(item.note)}</p>` : ""}</div></div>
      <div class="actions" style="margin-top:10px"><button class="btn" data-edit="${safe(item.id)}">Modifica</button><button class="btn" data-move="${safe(item.id)}:today">Oggi</button><button class="btn" data-move="${safe(item.id)}:urgent">Urgente</button><button class="btn" data-move="${safe(item.id)}:later">Più avanti</button><button class="btn danger" data-delete="${safe(item.id)}">Elimina</button></div>
    </div>`;
  }

  function renderList(list, targetId) {
    const rows = sorted(list);
    $(targetId).innerHTML = rows.length ? rows.map(itemHtml).join("") : `<p class="small">Nessun task.</p>`;
  }

  function render() {
    renderSummary();
    renderList("today", "todayList");
    renderList("urgent", "urgentList");
    renderList("later", "laterList");
    renderList("done", "doneList");
    $("addBtn").textContent = editingId ? "Salva modifica" : "Aggiungi";
  }

  async function loadCloud() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) {
      $("authBox").innerHTML = "Non risulti collegato a Supabase. Apri prima la Life Tracker e fai login da Dati → Cloud Supabase.";
      return;
    }
    userId = session.user.id;
    $("authBox").classList.add("hidden");
    $("app").classList.remove("hidden");
    const result = await client.from("todo_standalone_items").select("*").eq("user_id", userId).order("sort_order", { ascending: true });
    if (result.error) {
      console.error(result.error);
      toast("Errore lettura todo");
      return;
    }
    items = result.data || [];
    render();
    toast("Todo caricati");
  }

  function clearForm() {
    editingId = "";
    $("taskTitle").value = "";
    $("taskList").value = "today";
    $("taskDue").value = "";
    $("taskNote").value = "";
    render();
  }

  async function addOrUpdate() {
    const title = $("taskTitle").value.trim();
    if (!title) {
      toast("Inserisci un titolo");
      return;
    }
    const list = $("taskList").value || "today";
    const row = {
      user_id: userId,
      id: editingId || uid("todo"),
      title,
      list,
      completed: list === "done",
      note: $("taskNote").value || "",
      due_date: $("taskDue").value || null,
      sort_order: editingId ? (items.find(item => item.id === editingId)?.sort_order || 0) : items.filter(item => item.list === list).length + 1,
      updated_at: new Date().toISOString(),
      completed_at: list === "done" ? new Date().toISOString() : null,
    };
    const result = await client.from("todo_standalone_items").upsert(row, { onConflict: "user_id,id" });
    if (result.error) {
      console.error(result.error);
      toast("Errore salvataggio task");
      return;
    }
    clearForm();
    await loadCloud();
    toast("Task salvato");
  }

  function editItem(id) {
    const item = items.find(row => row.id === id);
    if (!item) return;
    editingId = id;
    $("taskTitle").value = item.title || "";
    $("taskList").value = item.list === "done" ? "today" : item.list;
    $("taskDue").value = item.due_date || "";
    $("taskNote").value = item.note || "";
    $("taskTitle").focus();
    render();
  }

  async function moveItem(id, list) {
    const completed = list === "done";
    const result = await client.from("todo_standalone_items").update({ list, completed, completed_at: completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", id);
    if (result.error) {
      console.error(result.error);
      toast("Errore spostamento task");
      return;
    }
    await loadCloud();
  }

  async function toggleItem(id, checked) {
    await moveItem(id, checked ? "done" : "today");
  }

  async function deleteItem(id) {
    const item = items.find(row => row.id === id);
    if (!item || !confirm(`Eliminare “${item.title}”?`)) return;
    const result = await client.from("todo_standalone_items").delete().eq("user_id", userId).eq("id", id);
    if (result.error) {
      console.error(result.error);
      toast("Errore eliminazione task");
      return;
    }
    await loadCloud();
    toast("Task eliminato");
  }

  document.addEventListener("click", event => {
    const edit = event.target.dataset.edit;
    if (edit) editItem(edit);
    const del = event.target.dataset.delete;
    if (del) deleteItem(del);
    const move = event.target.dataset.move;
    if (move) {
      const [id, list] = move.split(":");
      moveItem(id, list);
    }
  });

  document.addEventListener("change", event => {
    const toggle = event.target.dataset.toggle;
    if (toggle) toggleItem(toggle, event.target.checked);
  });

  $("addBtn").addEventListener("click", addOrUpdate);
  $("taskTitle").addEventListener("keydown", event => {
    if (event.key === "Enter") addOrUpdate();
  });
  $("reloadBtn").addEventListener("click", loadCloud);
  loadCloud();
})();
