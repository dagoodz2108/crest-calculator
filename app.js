async function calculate() {

  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {

    const link = document.getElementById("raiderLink").value.trim();

    if (!link.includes("raider.io/characters")) {
      output.textContent = "Please paste a full Raider.IO character link.";
      return;
    }

    // Parse link safely
    const parts = link.split("/");
    const region = parts[4];
    const realm = parts[5];
    const name = parts[6];

    if (!region || !realm || !name) {
      output.textContent = "Could not read the link. Make sure it looks like:\nhttps://raider.io/characters/us/realm/name";
      return;
    }

    const apiUrl =
      `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=gear`;

    // CORS proxy so it works locally and on GitHub Pages
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(apiUrl);

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (!data.gear || !data.gear.items) {
      output.textContent = "Character loaded but gear data wasn't found.";
      return;
    }

    const totals = {
      Weathered: 0,
      Carved: 0,
      Runed: 0,
      Gilded: 0
    };

    const crestRules = {
      Explorer: { maxRank: 8, crestType: "Weathered", crestPerRank: 15 },
      Adventurer: { maxRank: 8, crestType: "Weathered", crestPerRank: 15 },
      Veteran: { maxRank: 8, crestType: "Carved", crestPerRank: 15 },
      Champion: { maxRank: 8, crestType: "Runed", crestPerRank: 15 },
      Hero: { maxRank: 6, crestType: "Gilded", crestPerRank: 15 }
    };

    data.gear.items.forEach(item => {

      if (!item.upgrade) return;

      const track = item.upgrade.track;
      const rank = item.upgrade.current_rank;

      const rule = crestRules[track];
      if (!rule) return;

      const remainingRanks = rule.maxRank - rank;
      if (remainingRanks > 0) {
        totals[rule.crestType] += remainingRanks * rule.crestPerRank;
      }

    });

    output.textContent =
      "Crests needed to finish upgrading:\n\n" +
      "Weathered: " + totals.Weathered + "\n" +
      "Carved: " + totals.Carved + "\n" +
      "Runed: " + totals.Runed + "\n" +
      "Gilded: " + totals.Gilded;

  } catch (err) {
    console.error(err);
    output.textContent = "Error loading character. Open F12 → Console and tell me what it says.";
  }
}
