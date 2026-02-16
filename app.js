async function calculate() {

  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {

    const link = document.getElementById("raiderLink").value.trim();

    if (!link.includes("raider.io")) {
      output.textContent = "Please paste a valid Raider.IO link.";
      return;
    }

    // Parse link
    const parts = link.split("/");
    const region = parts[4];
    const realm = parts[5];
    const name = parts[6];

    const apiUrl =
      `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=gear`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.gear || !data.gear.items) {
      output.textContent = "Unable to read gear data.";
      return;
    }

    const totals = {
      Weathered: 0,
      Carved: 0,
      Runed: 0,
      Gilded: 0
    };

    // Basic upgrade rules (adjust if season changes)
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
    output.textContent = "Error loading character.";
  }
}
