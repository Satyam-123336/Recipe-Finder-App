// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const SEARCH_URL = "/api/recipes";
const queryCache = new Map();
let activeController = null;

let currentMeals = [];

searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});

function getField(obj, keys, fallback = "") {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && `${obj[key]}`.trim() !== "") {
      return obj[key];
    }
  }
  return fallback;
}

function normalizeIngredients(rawMeal) {
  const rawIngredients = getField(rawMeal, ["TranslatedIngredients", "Ingredients"], "");
  if (!rawIngredients) return [];

  return rawIngredients
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((ingredient) => ({ ingredient, measure: "" }));
}

function toSvgDataUri(title, category) {
  const safeTitle = String(title || "Recipe").slice(0, 42);
  const safeCategory = String(category || "Indian").slice(0, 28);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#6A0572'/>
        <stop offset='100%' stop-color='#C77DFF'/>
      </linearGradient>
    </defs>
    <rect width='600' height='450' fill='url(#g)'/>
    <circle cx='520' cy='80' r='92' fill='rgba(255,255,255,0.12)'/>
    <circle cx='80' cy='370' r='110' fill='rgba(255,255,255,0.08)'/>
    <text x='36' y='218' fill='white' font-size='40' font-family='Segoe UI, Arial, sans-serif' font-weight='700'>${safeTitle.replace(
      /[<>&'\"]/g,
      ""
    )}</text>
    <text x='36' y='262' fill='white' opacity='0.9' font-size='22' font-family='Segoe UI, Arial, sans-serif'>${safeCategory.replace(
      /[<>&'\"]/g,
      ""
    )}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function setSearchingState(isSearching, term = "") {
  searchBtn.disabled = isSearching;
  searchBtn.textContent = isSearching ? "Searching..." : "Search";
  if (isSearching) {
    resultHeading.textContent = `Searching for "${term}"...`;
  }
}

function normalizeMeal(rawMeal, idx) {
  const title = getField(rawMeal, ["TranslatedRecipeName", "RecipeName"], "Untitled recipe");
  const category = getField(rawMeal, ["Cuisine", "Course", "Diet"], "Indian");
  return {
    id:
      getField(rawMeal, ["Srno", "id", "idMeal", "_id"]) ||
      `meal-${idx}-${getField(rawMeal, ["TranslatedRecipeName", "RecipeName"], "item")}`,
    title,
    image: toSvgDataUri(title, category),
    category,
    instructions: getField(rawMeal, ["TranslatedInstructions", "Instructions"], ""),
    sourceUrl: getField(rawMeal, ["URL"], ""),
    ingredients: normalizeIngredients(rawMeal),
  };
}

async function apiSearch(searchTerm, signal) {
  const cacheKey = searchTerm.toLowerCase();
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey);
  }

  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(searchTerm)}`, { signal });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  queryCache.set(cacheKey, payload);
  return payload;
}

async function searchMeals() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    return;
  }

  try {
    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();

    setSearchingState(true, searchTerm);
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");

    const data = await apiSearch(searchTerm, activeController.signal);
    currentMeals = data.map(normalizeMeal);

    if (currentMeals.length === 0) {
      setSearchingState(false);
      resultHeading.textContent = "";
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
      errorContainer.classList.remove("hidden");
      return;
    }

    resultHeading.textContent = `Search results for "${searchTerm}" (${currentMeals.length} recipes):`;
    displayMeals(currentMeals);
    setSearchingState(false);
    searchInput.value = "";
  } catch (error) {
    setSearchingState(false);
    if (error.name === "AbortError") {
      return;
    }
    resultHeading.textContent = "";
    errorContainer.textContent =
      "Could not fetch recipes from the Indian Recipe API source. Please try again in a moment.";
    errorContainer.classList.remove("hidden");
  }
}

function displayMeals(meals) {
  mealsContainer.innerHTML = "";

  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.id}">
        <img src="${meal.image}" alt="${meal.title}" loading="lazy" decoding="async">
        <div class="meal-info">
          <h3 class="meal-title">${meal.title}</h3>
          ${meal.category ? `<div class="meal-category">${meal.category}</div>` : ""}
        </div>
      </div>
    `;
  });
}

async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    const meal = currentMeals.find((item) => `${item.id}` === `${mealId}`);
    if (!meal) return;

    mealDetailsContent.innerHTML = `
      <img src="${meal.image}" alt="${meal.title}" class="meal-details-img" loading="lazy" decoding="async">
      <h2 class="meal-details-title">${meal.title}</h2>
      <div class="meal-details-category">
        <span>${meal.category || "Uncategorized"}</span>
      </div>
      <div class="meal-details-instructions">
        <h3>Instructions</h3>
        <p>${meal.instructions || "Instructions are not available for this recipe."}</p>
      </div>
      <div class="meal-details-ingredients">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
          ${meal.ingredients
            .map((item) => `<li><i class="fas fa-check-circle"></i> ${item.ingredient}</li>`)
            .join("")}
        </ul>
      </div>
      ${
        meal.sourceUrl
          ? `<a href="${meal.sourceUrl}" target="_blank" class="youtube-link"><i class="fas fa-external-link-alt"></i> View Source</a>`
          : ""
      }
    `;

    mealDetails.classList.remove("hidden");
    mealDetails.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    errorContainer.textContent = "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}