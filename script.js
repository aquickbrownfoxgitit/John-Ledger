/* =========================
   Storage
========================= */

let transactions = JSON.parse(localStorage.getItem("johnLedgerTx")) || [];

let manualBalances = JSON.parse(localStorage.getItem("johnLedgerBalances")) || {
  savings: 0,
  goings: 0
};

/* =========================
   Elements
========================= */

const savingsEl = document.getElementById("savingsBalance");
const goingsEl = document.getElementById("goingsBalance");
const frontedEl = document.getElementById("frontedBalance");

const savingsInput = document.getElementById("manualSavings");
const goingsInput = document.getElementById("manualGoings");

const ledgerEl = document.getElementById("ledger");

/* =========================
   Page Tabs
========================= */

const pageDashboard = document.getElementById("pageDashboard");
const pageLedger = document.getElementById("pageLedger");
const tabDashboard = document.getElementById("tabDashboard");
const tabLedger = document.getElementById("tabLedger");

function switchPage(page) {
  pageDashboard.classList.remove("active");
  pageLedger.classList.remove("active");
  tabDashboard.classList.remove("active");
  tabLedger.classList.remove("active");

  if (page === "dashboard") {
    pageDashboard.classList.add("active");
    tabDashboard.classList.add("active");
  } else {
    pageLedger.classList.add("active");
    tabLedger.classList.add("active");
    renderLedger();
  }
}

tabDashboard.onclick = () => switchPage("dashboard");
tabLedger.onclick = () => switchPage("ledger");

/* =========================
   Balance Logic
========================= */

function recalcBalances() {
  let savings = manualBalances.savings;
  let goings = manualBalances.goings;
  let fronted = 0;

  transactions.forEach(t => {
    const amt = parseFloat(t.amount);

    if (t.to === "Savings / Allocated") savings += amt;
    if (t.from === "Savings / Allocated") savings -= amt;

    if (t.to === "Monthly Goings-On") goings += amt;
    if (t.from === "Monthly Goings-On") goings -= amt;

    if (t.to === "Fronted (from Savings / Allocated)") fronted += amt;
    if (t.from === "Fronted (from Savings / Allocated)") fronted -= amt;
  });

  savingsEl.textContent = `$${savings.toFixed(2)}`;
  goingsEl.textContent = `$${goings.toFixed(2)}`;
  frontedEl.textContent = `$${fronted.toFixed(2)}`;
}

/* =========================
   Manual Balance Setters
========================= */

document.getElementById("setSavings").onclick = () => {
  manualBalances.savings = parseFloat(savingsInput.value) || 0;
  localStorage.setItem("johnLedgerBalances", JSON.stringify(manualBalances));
  recalcBalances();
};

document.getElementById("setGoings").onclick = () => {
  manualBalances.goings = parseFloat(goingsInput.value) || 0;
  localStorage.setItem("johnLedgerBalances", JSON.stringify(manualBalances));
  recalcBalances();
};

/* =========================
   Transactions
========================= */

document.getElementById("txForm").onsubmit = e => {
  e.preventDefault();

  const id = document.getElementById("editId").value || crypto.randomUUID();

  const tx = {
    id,
    date: date.value,
    amount: amount.value,
    from: from.value,
    to: to.value,
    notes: notes.value
  };

  const existingIndex = transactions.findIndex(t => t.id === id);
  if (existingIndex >= 0) {
    transactions[existingIndex] = tx;
  } else {
    transactions.push(tx);
  }

  localStorage.setItem("johnLedgerTx", JSON.stringify(transactions));
  e.target.reset();
  document.getElementById("editId").value = "";
  recalcBalances();
};

/* =========================
   Ledger Rendering
========================= */

function renderLedger() {
  ledgerEl.innerHTML = "";

  const start = document.getElementById("filterStart")?.value;
  const end = document.getElementById("filterEnd")?.value;

  transactions
    .filter(t => {
      if (start && t.date < start) return false;
      if (end && t.date > end) return false;
      return true;
    })
    .slice()
    .reverse()
    .forEach(t => {
      const div = document.createElement("div");
      div.className = "history-item";

      div.innerHTML = `
        <strong>${t.date} — $${parseFloat(t.amount).toFixed(2)}</strong><br>
        ${t.from} → ${t.to}<br>
        ${t.notes || ""}<br>
        <button data-edit="${t.id}">Edit</button>
        <button data-delete="${t.id}">Delete</button>
      `;

      ledgerEl.appendChild(div);
    });

  attachLedgerActions();
}

function attachLedgerActions() {
  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => loadForEdit(btn.dataset.edit);
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteOne(btn.dataset.delete);
  });
}

function loadForEdit(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;

  editId.value = tx.id;
  date.value = tx.date;
  amount.value = tx.amount;
  from.value = tx.from;
  to.value = tx.to;
  notes.value = tx.notes;

  switchPage("dashboard");
}

function deleteOne(id) {
  if (!confirm("Delete this transaction?")) return;
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("johnLedgerTx", JSON.stringify(transactions));
  renderLedger();
  recalcBalances();
}

/* =========================
   Delete Range (Double Confirm)
========================= */

document.getElementById("deleteRange").onclick = () => {
  if (!confirm("Are you sure you want to delete ALL transactions in the selected date range?")) return;

  const typed = prompt("Type DELETE to confirm.");
  if (typed !== "DELETE") return;

  const start = filterStart.value;
  const end = filterEnd.value;

  transactions = transactions.filter(t => {
    if (start && t.date < start) return true;
    if (end && t.date > end) return true;
    return false;
  });

  localStorage.setItem("johnLedgerTx", JSON.stringify(transactions));
  renderLedger();
  recalcBalances();
};

/* =========================
   Export
========================= */

document.getElementById("exportRange").onclick = () => {
  window.print();
};

/* =========================
   Init
========================= */

recalcBalances();
