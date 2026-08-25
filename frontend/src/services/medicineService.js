const API_URL = "https://medical-inventory-backend-li17.onrender.com/api/medicines";

export async function getMedicines() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch medicines");
  }

  return response.json();
}

export async function addMedicine(medicine) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medicine),
  });

  if (!response.ok) {
    throw new Error("Failed to add medicine");
  }

  return response.json();
}