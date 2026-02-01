let transactions = JSON.parse(localStorage.getItem("bruce_tx")) || [];
let balances = JSON.parse(localStorage.getItem("bruce_bal")) || {
  discretionary: 0,
  held: 0
};

const discEl = document.getElementById("discBalance");
const heldEl = document.getElementById("heldBalance");

function saveState() {
  localStorage.setItem("bruce_tx", JSON.stringify(transactions));
  localStorage.setItem("bruce_bal", JSON.stringify(balances));
}

function renderBalances() {
  discEl.textContent = `$${balances.discretionary.toFixed(2)}`;
  heldEl.textContent = `$${balances.held.toFixed(2)}`;
}

function renderLedger() {
  const body = document.getElementById("ledgerBody");
  body.innerHTML = "";

  [...transactions].reverse().forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>$${Number(t.amount).toFixed(2)}</td>
      <td>${t.from}</td>
      <td>${t.to}</td>
      <td>${t.tag || ""}</td>
      <td>${t.notes || ""}</td>
    `;
    body.appendChild(row);
  });
}

document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();

  const amt = Number(amount.value);
  const from = fromBucket.value;
  const to = toBucket.value;

  if (from === to) {
    alert("From and To cannot be the same.");
    return;
  }

  if (from === "Discretionary") balances.discretionary -= amt;
  if (from === "Held") balances.held -= amt;
  if (to === "Discretionary") balances.discretionary += amt;
  if (to === "Held") balances.held += amt;

  transactions.push({
    date: date.value,
    amount: amt,
    from,
    to,
    tag: tag.value,
    notes: notes.value
  });

  saveState();
  renderBalances();
  renderLedger();
  e.target.reset();
});

document.getElementById("entryViewBtn").onclick = () => {
  entryView.classList.remove("hidden");
  ledgerView.classList.add("hidden");
};

document.getElementById("ledgerViewBtn").onclick = () => {
  ledgerView.classList.remove("hidden");
  entryView.classList.add("hidden");
};

document.getElementById("printBtn").onclick = () => window.print();

renderBalances();
renderLedger();
