async function calculate() {

  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {

    const link = document.getElementById("raiderLink").value.trim();

    const parts = link.split("/");
    const region = parts[4];
    const realm = parts[5];
    const name = parts[6];

    if (!region || !realm || !name) {
      output.textContent = "Invalid Raider.IO link format.";
      return;
    }

    const apiUrl =
      `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=gear`;

    const proxyUrl =
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(apiUrl);

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      output.textContent = "Failed to fetch character data.";
      return;
    }

    const data = await response.json();

    if (!data.gear || !data.gear.items) {
      output.textContent = "Character loaded but no gear found.";
      return;
    }

    // Convert items object to array
    const items = Object.values(data.gear.items);

    let countedItems = 0;

    items.forEach(item => {
      if (item.upgrade) countedItems++;
    });

    output.textContent =
      "Character loaded successfully.\n\n" +
      "Items with upgrade data found: " + countedItems;

  } catch (err) {
    console.error(err);
    output.textContent = "Error loading character. Press F12 → Console and copy the red error.";
  }
}
