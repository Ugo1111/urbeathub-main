// exchangeRate.js
let cachedRate = null;
const MARGIN = 0.03; // 3% margin

export async function getExchangeRate() {
  if (cachedRate) return cachedRate;

  const applyMargin = (rate) => rate * (1 + MARGIN);

  // First API: open.er-api.com
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data.rates && data.rates.NGN) {
        cachedRate = applyMargin(data.rates.NGN);
        return cachedRate;
      }
    }
    throw new Error("First API failed or returned invalid data");
  } catch (error) {
    console.warn("First exchange rate API failed:", error.message);
  }

  // Second API fallback: exchangerate-api.com
  try {
    const response = await fetch("https://v6.exchangerate-api.com/v6/7bdd36fd981e836f5df070c1/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data.conversion_rates && data.conversion_rates.NGN) {
        cachedRate = applyMargin(data.conversion_rates.NGN);
        return cachedRate;
      }
    }
    throw new Error("Second API failed or returned invalid data");
  } catch (error) {
    console.warn("Second exchange rate API failed:", error.message);
  }

  // If both fail, return null (calling code will use USD)
  cachedRate = null;
  console.warn("Both exchange rate APIs failed. Prices will be displayed in USD.");
  return cachedRate;
}