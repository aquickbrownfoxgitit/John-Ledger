let transactions = JSON.parse(localStorage.getItem("johnLedger")) || [];

const savingsEl = document.getElementById("savingsBalance");
const goingsEl = document.getElementById("goingsBalance");
const frontedEl = document.getElementById("frontedBalance");
const ledgerEl = document.getElementById("ledger");

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

function recalc() {
  let savings = 0;
  let goings = 0;
  let fronted = 0;

  transactions.forEach(t => {
    const amt = parseFloat(t.amount);

    if (t.to === "Savings / Allocated") savings += amt;
    if (t.from === "Savings / Allocated") savings -= amt;

    if (t.to === "Monthly Goings-On") goings += amt;
    if (t.from === "Monthly Goings-On") goings -= amt;

    if (t.to === "Fronted (Owed to April)") fronted -= amt;
    if (t.to === "Reimburse April (FAIRWINDS)") fronted += amt;
  });

  if (goings < 0) alert("Monthly Goings-On cannot be negative.");
  if (fronted > 0) fronted = 0;

  savingsEl.textContent = `$${savings.toFixed(2)}`;
  goingsEl.textContent = `$${goings.toFixed(2)}`;
  frontedEl.textContent = `$${fronted.toFixed(2)}`;
}

function render() {
  ledgerEl.innerHTML = "";
  [...transactions].reverse().forEach(t => {
    const div = document.createElement("div");
    div.className = "tx";
    div.innerHTML = `
      <strong>${t.date} — $${parseFloat(t.amount).toFixed(2)}</strong>
      ${t.from} → ${t.to}<br>
      ${t.notes || ""}
      <div class="tx-actions">
        <button onclick="editTx('${t.id}')">Edit</button>
        <button onclick="deleteTx('${t.id}')">Delete</button>
      </div>
    `;
    ledgerEl.appendChild(div);
  });
  recalc();
}

function editTx(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;

  editId.value = t.id;
  date.value = t.date;
  amount.value = t.amount;
  from.value = t.from;
  to.value = t.to;
  notes.value = t.notes || "";
}

function deleteTx(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
}

function save() {
  localStorage.setItem("johnLedger", JSON.stringify(transactions));
  render();
}

document.getElementById("txForm").addEventListener("submit", e => {
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
  save();
});

render();
