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

    const linkInput = document.getElementById("raiderLink");
    const link = linkInput.value.trim();

    // Save last search
    localStorage.setItem("lastRaiderLink", link);

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
      Gilded: 0,
      Valorstones: 0
    };

    const items = Object.entries(data.gear.items);

    // Build sortable list
    const processedItems = [];

    items.forEach(([slot, item]) => {

      let track = "-";
      let rank = "-";
      let crestsNeeded = 0;
      let rowClass = "";

      if (item.upgrade) {
        track = item.upgrade.track || "-";
        rank = item.upgrade.current_rank ?? "-";

        const rule = crestRules[track];

        if (rule && rank !== "-") {
          const remaining = rule.maxRank - rank;

          if (remaining > 0) {
            crestsNeeded = remaining * rule.crestPerRank;
            totals[rule.crestType] += crestsNeeded;

            // rough valorstone estimate
            totals.Valorstones += remaining * 10;
          }
        }

        rowClass = track.toLowerCase();
      }

      processedItems.push({
        slot,
        name: item.name,
        ilvl: item.item_level,
        track,
        rank,
        crestsNeeded,
        rowClass
      });

    });

    // Sort by crests needed descending
    processedItems.sort((a, b) => b.crestsNeeded - a.crestsNeeded);

    processedItems.forEach(item => {

      const row = document.createElement("tr");
      if (item.rowClass) row.className = item.rowClass;

      row.innerHTML = `
        <td>${item.slot}</td>
        <td>${item.name}</td>
        <td>${item.ilvl}</td>
        <td>${item.track}</td>
        <td>${item.rank}</td>
        <td>${item.crestsNeeded || "-"}</td>
      `;

      tbody.appendChild(row);
    });

    table.style.display = "table";

    totalsDiv.innerHTML = `
      <h3>Total Needed</h3>
      Weathered: ${totals.Weathered}<br>
      Carved: ${totals.Carved}<br>
      Runed: ${totals.Runed}<br>
      Gilded: ${totals.Gilded}<br>
      <br>
      Estimated Valorstones: ${totals.Valorstones}
    `;

    status.textContent = "Done.";

  } catch (err) {
    console.error(err);
    status.textContent = "Error loading character. Press F12 and send me the error.";
  }
}

// Auto-load last searched character
window.onload = function () {
  const last = localStorage.getItem("lastRaiderLink");
  if (last) {
    document.getElementById("raiderLink").value = last;
  }
};
