
const form = document.getElementById("entry-form");
const tableBody = document.querySelector("#record-table tbody");
const summary = document.getElementById("summary");
const lineCanvas = document.getElementById("lineChart");
const pieCanvas = document.getElementById("pieChart");

let records = JSON.parse(localStorage.getItem("bet-records")) || [];

function saveData() {
  localStorage.setItem("bet-records", JSON.stringify(records));
}

function renderTable() {
  tableBody.innerHTML = "";
  let total = 0;
  let dailyMap = {};
  let projectMap = {};

  records.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = \`
      <td>\${r.date}</td>
      <td>\${r.project}</td>
      <td>\${r.amount}</td>
      <td>\${r.result}</td>
      <td>\${r.tags}</td>
      <td>\${r.notes}</td>
    \`;
    tableBody.appendChild(row);
    let change = r.result === "win" ? r.amount :
                 r.result === "lose" ? -r.amount : 0;
    total += change;

    // Daily sum
    dailyMap[r.date] = (dailyMap[r.date] || 0) + change;

    // Project sum
    projectMap[r.project] = (projectMap[r.project] || 0) + change;
  });

  summary.textContent = "总盈亏：¥" + total;
  updateCharts(dailyMap, projectMap);
}

function updateCharts(dailyMap, projectMap) {
  const dates = Object.keys(dailyMap).sort();
  const dailyData = dates.map(d => dailyMap[d]);

  if (window.lineChartObj) window.lineChartObj.destroy();
  window.lineChartObj = new Chart(lineCanvas, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{ label: "每日盈亏", data: dailyData, borderColor: "#007bff", fill: false }],
    },
  });

  const projectNames = Object.keys(projectMap);
  const projectData = projectNames.map(p => projectMap[p]);

  if (window.pieChartObj) window.pieChartObj.destroy();
  window.pieChartObj = new Chart(pieCanvas, {
    type: "pie",
    data: {
      labels: projectNames,
      datasets: [{ data: projectData, backgroundColor: ["#4caf50", "#f44336", "#2196f3", "#ff9800"] }],
    },
  });
}

form.onsubmit = function(e) {
  e.preventDefault();
  const record = {
    date: document.getElementById("date").value,
    project: document.getElementById("project").value,
    amount: parseFloat(document.getElementById("amount").value),
    result: document.getElementById("result").value,
    tags: document.getElementById("tags").value,
    notes: document.getElementById("notes").value,
  };
  records.push(record);
  saveData();
  renderTable();
  form.reset();
};

renderTable();
