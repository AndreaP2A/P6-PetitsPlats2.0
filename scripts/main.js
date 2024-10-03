import recipes from "./recipes.js";

const searchInput = document.querySelector(".hero__searchbar input");
const recipeContainer = document.querySelector(".recipe__container");
const sortTitle = document.querySelector(".sort__title");
const activeTagContainer = document.querySelector(".active__tags"); // Reference to .active__tags div

const ingredientDropdown = document.querySelector(".dropdown__ingredients");
const applianceDropdown = document.querySelector(".dropdown__appliances");
const ustensilDropdown = document.querySelector(".dropdown__ustensils");

let selectedIngredients = [];
let selectedAppliance = [];
let selectedUstensils = [];

/**
 * Creates a recipe card article.
 *
 * @param {Object} recipe - The recipe object.
 * @returns {HTMLElement} The recipe card element.
 */
function createRecipeCard(recipe) {
  const article = document.createElement("article");
  article.classList.add("recipe__card");

  article.innerHTML = `
        <div class="recipe__card__img">
            <img src="/assets/img/recipes/${recipe.image}" alt="${recipe.name}">
        </div> 
        <div class="recipe__content">
            <h2>${recipe.name}</h2>
            <div class="recipe__info">
                <h3>RECETTE</h3> 
                <p class="recipe__description">${recipe.description}</p> 
            </div>
            <div class="recipe__ingredients">
                <h3 class="recipe__ingredients__title">INGREDIENTS</h3>
                <div class="recipe__ingredients__list">
                    ${recipe.ingredients
                      .map(
                        (ingredient) => `
                        <div>
                            <p class="ingredient__name">${
                              ingredient.ingredient
                            }</p>
                            <p class="ingredient__quantity">${
                              ingredient.quantity || ""
                            } ${ingredient.unit || ""}</p> 
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

  return article;
}

/**
 * Displays a list of recipes in the recipe container.
 *
 * @param {Array} recipesToDisplay - The array of recipe objects to be displayed.
 */
function displayRecipes(recipesToDisplay = []) {
  recipeContainer.innerHTML = "";

  if (recipesToDisplay.length === 0) {
    recipeContainer.innerHTML = `<p>Aucune recette trouvée</p>`;
  }

  recipesToDisplay.forEach((recipe) => {
    const recipeCard = createRecipeCard(recipe);
    recipeContainer.appendChild(recipeCard);
  });

  // Update the sort__title with the current number of displayed recipes
  sortTitle.innerHTML = `${recipesToDisplay.length} RECETTES`;
}

/**
 * Extract unique values from recipes for ingredients, appliance, and ustensils.
 */
function getUniqueItemsFromRecipes(recipes) {
  const ingredients = new Set();
  const appliance = new Set();
  const ustensils = new Set();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((item) =>
      ingredients.add(item.ingredient.toLowerCase())
    );
    appliance.add(recipe.appliance.toLowerCase());
    recipe.ustensils.forEach((item) => ustensils.add(item.toLowerCase()));
  });

  return {
    ingredients: Array.from(ingredients),
    appliance: Array.from(appliance),
    ustensils: Array.from(ustensils),
  };
}

/**
 * Populates the dropdown menu for ingredients, appliance, or ustensils.
 *
 * @param {HTMLElement} dropdown - The dropdown menu container element.
 * @param {Array} items - The array of items to populate the dropdown with.
 */
function populateDropdown(dropdown, items) {
  dropdown.innerHTML = ""; // Clear previous items

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a class="dropdown-item" href="#">${item}</a>`;
    dropdown.appendChild(listItem);

    // Event listener to handle filtering by selected item
    listItem.addEventListener("click", () => {
      handleDropdownSelection(dropdown, item);
    });
  });
}

/**
 * Filter recipes based on selected items from dropdowns and search query.
 */
function filterRecipes() {
  let filteredRecipes = recipes;

  // Apply search bar filter if query exists
  const searchQuery = searchInput.value.toLowerCase();
  if (searchQuery) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      const nameMatch = recipe.name.toLowerCase().includes(searchQuery);
      const ingredientMatch = recipe.ingredients.some((ingredient) =>
        ingredient.ingredient.toLowerCase().includes(searchQuery)
      );
      return nameMatch || ingredientMatch;
    });
  }

  // Apply dropdown filters
  if (selectedIngredients.length) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      selectedIngredients.every((selected) =>
        recipe.ingredients.some(
          (ingredient) => ingredient.ingredient.toLowerCase() === selected
        )
      )
    );
  }

  if (selectedAppliance.length) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      selectedAppliance.includes(recipe.appliance.toLowerCase())
    );
  }

  if (selectedUstensils.length) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      selectedUstensils.every((selected) => recipe.ustensils.includes(selected))
    );
  }

  // Display filtered recipes
  displayRecipes(filteredRecipes);

  // Update dropdowns based on filtered recipes
  updateDropdowns(filteredRecipes);

  // Update the active tags
  updateActiveTags();
}

/**
 * Update dropdown lists dynamically based on the displayed recipes.
 */
function updateDropdowns(filteredRecipes) {
  const { ingredients, appliance, ustensils } =
    getUniqueItemsFromRecipes(filteredRecipes);

  populateDropdown(ingredientDropdown, ingredients);
  populateDropdown(applianceDropdown, appliance);
  populateDropdown(ustensilDropdown, ustensils);
}

/**
 * Update the active tags in the .active__tags container.
 */
function updateActiveTags() {
  activeTagContainer.innerHTML = ""; // Clear the current active tags

  const allActiveTags = [
    ...selectedIngredients,
    ...selectedAppliance,
    ...selectedUstensils,
  ];

  allActiveTags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.classList.add("active__tag__item");
    tagElement.innerHTML = `${tag} <button class="remove-tag">&times;</button>`;

    // Remove tag when clicked and update the filters
    tagElement.querySelector(".remove-tag").addEventListener("click", () => {
      removeTag(tag);
    });

    activeTagContainer.appendChild(tagElement);
  });
}

/**
 * Remove a tag and update the corresponding filters.
 */
function removeTag(tag) {
  selectedIngredients = selectedIngredients.filter((item) => item !== tag);
  selectedAppliance = selectedAppliance.filter((item) => item !== tag);
  selectedUstensils = selectedUstensils.filter((item) => item !== tag);

  filterRecipes(); // Reapply the filtering
}

/**
 * Handle selection from dropdown menus.
 */
function handleDropdownSelection(dropdown, item) {
  // Add or remove the selected item from the corresponding array
  if (dropdown === ingredientDropdown) {
    selectedIngredients = toggleSelection(selectedIngredients, item);
  } else if (dropdown === applianceDropdown) {
    selectedAppliance = toggleSelection(selectedAppliance, item);
  } else if (dropdown === ustensilDropdown) {
    selectedUstensils = toggleSelection(selectedUstensils, item);
  }

  // Filter recipes after selection
  filterRecipes();
}

/**
 * Toggle selection in the filter arrays (add or remove the selected item).
 */
function toggleSelection(array, item) {
  const index = array.indexOf(item.toLowerCase());
  if (index === -1) {
    array.push(item.toLowerCase()); // Add if not already selected
  } else {
    array.splice(index, 1); // Remove if already selected
  }
  return array;
}

/**
 * Event listener for search input.
 */
searchInput.addEventListener("input", () => {
  filterRecipes(); // Filter recipes when the search query changes
});

/**
 * Function to handle the toggling of dropdowns and arrow rotation.
 */
function handleDropdownToggle() {
  const dropdowns = document.querySelectorAll(".sort__dropdown");

  dropdowns.forEach((dropdown) => {
    const toggleButton = dropdown.querySelector(".sort__btn");
    const arrow = dropdown.querySelector(".arrow");
    const dropdownMenu = dropdown.querySelector(".sort__dropdown__menu");

    toggleButton.addEventListener("click", function () {
      // Toggle dropdown visibility
      dropdown.classList.toggle("active");
      // Toggle arrow rotation
      arrow.classList.toggle("rotate");
      // Toggle dropdown menu visibility with max-height transition
      if (dropdownMenu.style.maxHeight) {
        dropdownMenu.style.maxHeight = null; // Collapse
      } else {
        dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + "px"; // Expand
      }
    });
  });
}

/**
 * Initial population of dropdowns and display of all recipes.
 */
function init() {
  displayRecipes(recipes);
  updateDropdowns(recipes);
  handleDropdownToggle(); // Initialize dropdown toggle functionality
}

document.addEventListener("DOMContentLoaded", init);
