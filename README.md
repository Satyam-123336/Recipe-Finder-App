# 🍽️ Recipe Finder App

A web application that helps you discover authentic and irresistible recipes from India and around the world. Search by recipe name or cuisine and explore detailed meal information, ingredients, and cooking instructions.

## Features

- **🔍 Search Functionality**: Search recipes by name or cuisine type
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎯 Detailed Recipe Information**: View ingredients, instructions, and cuisine details
- **💾 Query Caching**: Optimized performance with built-in caching for search results
- **🎨 Dynamic UI**: Generated recipe card images with gradient backgrounds
- **⌨️ Keyboard Support**: Press Enter to search without clicking the button
- **🌍 Rich Dataset**: Access to a comprehensive Indian recipe dataset

## Project Structure

```
Recipe Finder/
├── index.html           # Main HTML file with UI structure
├── script.js            # Frontend JavaScript logic
├── style.css            # Styling and responsive layout
├── api/
│   └── recipes.js       # Backend API for recipe search
└── README.md            # Project documentation
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome 6.7.2
- **API**: Fetches recipes from Indian Food Dataset (CSV format)
- **Backend**: Node.js/Express API endpoint

## Getting Started

### Prerequisites
- Node.js and npm installed
- A modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Recipe\ Finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Search for Recipes**: 
   - Enter a recipe name, ingredient, or cuisine in the search box
   - Click "Search" or press Enter
   
2. **View Details**:
   - Click on any recipe card to view full details
   - See ingredients, cooking instructions, and cuisine information
   
3. **Go Back**:
   - Click "Back to recipes" to return to search results

## API Reference

### Endpoint: `/api/recipes`

**Request:**
```javascript
GET /api/recipes?q=search_term
```

**Response:**
```json
{
  "meals": [
    {
      "id": "recipe-id",
      "title": "Recipe Name",
      "category": "Cuisine Type",
      "image": "svg-data-uri",
      "ingredients": [
        { "ingredient": "flour", "measure": "" }
      ],
      "instructions": "Cooking steps...",
      "sourceUrl": "recipe-source-url"
    }
  ]
}
```

## Features in Detail

### Caching System
- Automatically caches search results to improve performance
- Uses `AbortController` for request cancellation
- Prevents duplicate API calls for the same search term

### Dynamic Image Generation
- Generates SVG-based recipe card images with gradient backgrounds
- Displays recipe name and cuisine category on each card
- No external image dependencies required

### Ingredient Normalization
- Parses and extracts up to 20 ingredients from recipes
- Handles multiple data formats for flexibility
- Cleans and trims whitespace

## Data Source

Recipes are sourced from the [Indian Food Dataset](https://raw.githubusercontent.com/Sachinart/Indian-Recipe-API/master/IndianFoodDataset.csv), which contains a comprehensive collection of traditional Indian recipes.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Add favorites/bookmarks feature
- [ ] Filter results by dietary preferences
- [ ] Sort results by recipe name or cuisine
- [ ] Add recipe difficulty level
- [ ] Implement user ratings and reviews
- [ ] Add recipe sharing functionality
- [ ] Dark mode support

## Contributing

Feel free to fork the project and submit pull requests with improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy cooking! 👨‍🍳👩‍🍳**
