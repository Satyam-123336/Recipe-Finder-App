const DATASET_URL =
  "https://raw.githubusercontent.com/Sachinart/Indian-Recipe-API/master/IndianFoodDataset.csv";

let cachedRecipes = null;
let cachePromise = null;
const searchCache = new Map();

function parseCsvRecords(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      row.push(field);
      if (row.some((cell) => `${cell}`.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => `${cell}`.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

async function loadRecipes() {
  if (cachedRecipes) return cachedRecipes;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const response = await fetch(DATASET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status}`);
    }

    const csvText = await response.text();
    const records = parseCsvRecords(csvText);

    if (records.length < 2) {
      cachedRecipes = [];
      return cachedRecipes;
    }

    const headers = records[0].map((header) => `${header}`.trim());
    const rows = records.slice(1).map((cells) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = cells[index] || "";
      });
      item._searchText = `${item.RecipeName || ""} ${item.TranslatedRecipeName || ""} ${
        item.Cuisine || ""
      }`.toLowerCase();
      return item;
    });

    cachedRecipes = rows;
    return cachedRecipes;
  })();

  try {
    return await cachePromise;
  } finally {
    cachePromise = null;
  }
}

module.exports = async (req, res) => {
  try {
    const qRaw = req.query.q;
    const q = typeof qRaw === "string" ? qRaw.trim() : "";

    if (!q) {
      return res.status(400).json({
        error: "Missing query parameter 'q'. Example: /api/recipes?q=tomato",
      });
    }

    const recipes = await loadRecipes();
    const qLower = q.toLowerCase();
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitRaw) ? recipes.length : Math.max(1, Math.min(limitRaw, recipes.length));
    const cacheKey = `${q.toLowerCase()}::${limit}`;

    if (searchCache.has(cacheKey)) {
      return res.status(200).json(searchCache.get(cacheKey));
    }

    const filtered = recipes
      .filter((recipe) => {
        return (recipe._searchText || "").includes(qLower);
      })
      .slice(0, limit)
      .map(({ _searchText, ...recipe }) => recipe);

    if (searchCache.size > 200) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, filtered);

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load recipes from source dataset",
      details: error.message,
    });
  }
};
