let transactions = JSON.parse(localStorage.getItem("johnLedger")) || [];

const savingsEl = document.getElementById("savingsBalance");
const goingsEl = document.getElementById("goingsBalance");
const frontedEl = document.getElementById("frontedBalance");
const ledgerEl = document.getElementById("ledger");

const pageDashboard = document.getElementById("pageDashboard");
const pageLedger = document.getElementById("pageLedger");
const tabDashboard = document.getElementById("tabDashboard");
const tabLedger = document.getElementById("tabLedger");

const rules = {
  "WF Checking (John)": ["Savings / Allocated"],
  "Savings / Allocated": [
    "Monthly Goings-On",
    "Rent / Bills (External)",
    "Reimburse April (FAIRWINDS)"
  ],
  "Monthly Goings-On": ["John Checking (External)"],
  "April Personal (FAIRWINDS)": [
    "John Checking (External)",
    "Fronted (Owed to April)"
  ],
  "Other / External": ["Savings / Allocated"]
};

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

function recalc() {
  let savings = 0, goings = 0, fronted = 0;

  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.to === "Savings / Allocated") savings += amt;
    if (t.from === "Savings / Allocated") savings -= amt;
    if (t.to === "Monthly Goings-On") goings += amt;
    if (t.from === "Monthly Goings-On") goings -= amt;
    if (t.to === "Fronted (Owed to April)") fronted -= amt;
    if (t.to === "Reimburse April (FAIRWINDS)") fronted += amt;
  });

  savingsEl.textContent = `$${savings.toFixed(2)}`;
  goingsEl.textContent = `$${goings.toFixed(2)}`;
  frontedEl.textContent = `$${fronted.toFixed(2)}`;
}

function filteredTx() {
  const start = document.getElementById("filterStart").value;
  const end = document.getElementById("filterEnd").value;

  return transactions.filter(t => {
    if (start && t.date < start) return false;
    if (end && t.date > end) return false;
    return true;
  });
}

function renderLedger() {
  ledgerEl.innerHTML = "";
  filteredTx().slice().reverse().forEach(t => {
    const div = document.createElement("div");
    div.className = "tx";
    div.innerHTML = `
      <strong>${t.date} — $${parseFloat(t.amount).toFixed(2)}</strong>
      ${t.from} → ${t.to}<br>${t.notes || ""}
    `;
    ledgerEl.appendChild(div);
  });
}

document.getElementById("exportRange").onclick = () => {
  window.print();
};

document.getElementById("deleteRange").onclick = () => {
  const start = filterStart.value || "the beginning";
  const end = filterEnd.value || "today";

  if (!confirm(`Are you sure you want to delete all transactions from ${start} to ${end}?`)) return;

  const typed = prompt("Type DELETE to confirm.");
  if (typed !== "DELETE") return;

  transactions = transactions.filter(t => !filteredTx().includes(t));
  localStorage.setItem("johnLedger", JSON.stringify(transactions));
  renderLedger();
  recalc();
};

document.getElementById("txForm").onsubmit = e => {
  e.preventDefault();

  const tx = {
    id: editId.value || crypto.randomUUID(),
    date: date.value,
    amount: amount.value,
    from: from.value,
    to: to.value,
    notes: notes.value
  };

  if (!rules[tx.from] || !rules[tx.from].includes(tx.to)) {
    alert("That From → To combination is not allowed.");
    return;
  }

  transactions = editId.value
    ? transactions.map(t => (t.id === tx.id ? tx : t))
    : [...transactions, tx];

  e.target.reset();
  editId.value = "";
  localStorage.setItem("johnLedger", JSON.stringify(transactions));
  recalc();
};

recalc();
