async function calculate() {

  const status = document.getElementById("status");
  const table = document.getElementById("gearTable");
  const tbody = table.querySelector("tbody");
  const totalsDiv = document.getElementById("totals");
  const characterDiv = document.getElementById("character");

  tbody.innerHTML = "";
  totalsDiv.innerHTML = "";
  characterDiv.innerHTML = "";
  table.style.display = "none";

  status.textContent = "Loading character...";

  try {

    const link = document.getElementById("raiderLink").value.trim();
    const parts = link.split("/");
    const region = parts[4];
    const realm = parts[5];
    const name = parts[6];

    if (!region || !realm || !name) {
      status.textContent = "Invalid Raider.IO link.";
      return;
    }

    const apiUrl =
      `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=gear`;

    const proxyUrl =
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(apiUrl);

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (!data.gear || !data.gear.items) {
      status.textContent = "Gear data not found.";
      return;
    }

    // Show character header
    characterDiv.innerHTML =
      `<h2>${data.name} - ${data.realm}</h2>
       <div>Average Item Level: ${data.gear.item_level_equipped}</div>`;

    const crestRules = {
      Explorer: { maxRank: 8, crestType: "Weathered", crestPerRank: 15 },
      Adventurer: { maxRank: 8, crestType: "Weathered", crestPerRank: 15 },
      Veteran: { maxRank: 8, crestType: "Carved", crestPerRank: 15 },
      Champion: { maxRank: 8, crestType: "Runed", crestPerRank: 15 },
      Hero: { maxRank: 6, crestType: "Gilded", crestPerRank: 15 }
    };

    const totals = {
      Weathered: 0,
      Carved: 0,
      Runed: 0,
      Gilded: 0
    };

    const items = Object.entries(data.gear.items);

    items.forEach(([slot, item]) => {

      let track = "-";
      let rank = "-";
      let crestsNeeded = "-";

      if (item.upgrade) {
        track = item.upgrade.track || "-";
        rank = item.upgrade.current_rank ?? "-";

        const rule = crestRules[track];
        if (rule && rank !== "-") {
          const remaining = rule.maxRank - rank;
          if (remaining > 0) {
            crestsNeeded = remaining * rule.crestPerRank;
            totals[rule.crestType] += crestsNeeded;
          } else {
            crestsNeeded = 0;
          }
        }
      }

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${slot}</td>
        <td>${item.name}</td>
        <td>${item.item_level}</td>
        <td>${track}</td>
        <td>${rank}</td>
        <td>${crestsNeeded}</td>
      `;

      tbody.appendChild(row);

    });

    table.style.display = "table";

    totalsDiv.innerHTML = `
      <h3>Total Crests Needed</h3>
      Weathered: ${totals.Weathered}<br>
      Carved: ${totals.Carved}<br>
      Runed: ${totals.Runed}<br>
      Gilded: ${totals.Gilded}
    `;

    status.textContent = "Done.";

  } catch (err) {
    console.error(err);
    status.textContent = "Error loading character. Press F12 and send me the error.";
  }
}
