const apiKey = 'f630f8cfbac5a8b0bd37ac39074ba2b6';
let currentPage = 1;
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
let ratings = JSON.parse(localStorage.getItem('ratings')) || {}; // Store ratings

document.addEventListener('DOMContentLoaded', displayFavorites);

async function searchMovies() {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        alert('Please enter a movie name');
        return;
    }
    currentPage = 1; // Reset to the first page for a new search
    fetchMovies(apiKey, query, currentPage);
}

async function fetchMovies(apiKey, query, page) {
    const baseUrl = 'https://api.themoviedb.org/3';
    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`);
        const data = await response.json();
        displayMovies(data.results);
        displayPagination(data.page, data.total_pages, query);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovies(movies) {
    const moviesContainer = document.getElementById('moviesContainer');
    moviesContainer.innerHTML = '';

    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p>No movies found</p>';
        return;
    }

    movies.forEach(movie => {
        const averageRating = ratings[movie.id] ? ratings[movie.id].average : 'No rating yet';
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Genre: ${movie.genre_ids.join(', ')}</p>
                <p>Rating: ${movie.vote_average} (Avg: ${averageRating})</p>
                <p>${movie.release_date}</p>
                <p>${movie.overview.substring(0, 100)}...</p>
                <button class="favorite-button" onclick="toggleFavorite(${movie.id}, '${movie.title}', '${movie.poster_path}')">
                    ${favorites[movie.id] ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button class="review-button" onclick="toggleReviewForm(${movie.id})">Review</button>
                <div id="review-form-${movie.id}" class="review-form">
                    <input type="text" id="review-${movie.id}" placeholder="Write your review" />
                    <button onclick="submitReview(${movie.id})">Submit</button>
                </div>
                <div class="rating">
                    <label for="rating-${movie.id}">Rate:</label>
                    <select id="rating-${movie.id}">
                        <option value="0">Select Rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                    <button onclick="submitRating(${movie.id})">Submit Rating</button>
                </div>
            </div>
        `;
        moviesContainer.appendChild(movieElement);
    });
}

function toggleFavorite(id, title, poster) {
    if (favorites[id]) {
        delete favorites[id];
    } else {
        favorites[id] = { title, poster };
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    searchMovies(); // Refresh search results to update favorite buttons
}

function displayFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '';

    Object.keys(favorites).forEach(id => {
        const { title, poster } = favorites[id];
        const favoriteElement = document.createElement('div');
        favoriteElement.classList.add('movie');
        favoriteElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${poster}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <button class="favorite-button" onclick="toggleFavorite(${id}, '${title}', '${poster}')">Remove from Favorites</button>
            </div>
        `;
        favoritesContainer.appendChild(favoriteElement);
    });
}

function toggleReviewForm(id) {
    const reviewForm = document.getElementById(`review-form-${id}`);
    reviewForm.style.display = reviewForm.style.display === 'block' ? 'none' : 'block';
}

function submitReview(id) {
    const reviewInput = document.getElementById(`review-${id}`);
    const review = reviewInput.value.trim();
    if (!review) {
        alert('Please enter a review');
        return;
    }
    const reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    reviews[id] = review;
    localStorage.setItem('reviews', JSON.stringify(reviews));
    alert('Review submitted!');
    reviewInput.value = '';
    toggleReviewForm(id);
}

function submitRating(id) {
    const ratingSelect = document.getElementById(`rating-${id}`);
    const rating = parseInt(ratingSelect.value);
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }

    if (!ratings[id]) {
        ratings[id] = { total: 0, count: 0, average: 0 };
    }

    // Update the total and count
    ratings[id].total += rating;
    ratings[id].count += 1;
    ratings[id].average = (ratings[id].total / ratings[id].count).toFixed(1);
    
    localStorage.setItem('ratings', JSON.stringify(ratings));
    alert('Rating submitted! Average rating: ' + ratings[id].average);
    ratingSelect.value = '0'; // Reset the select
}

function displayPagination(page, totalPages, query) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = page === 1;
    prevButton.onclick = () => {
        if (page > 1) {
            fetchMovies(apiKey, query, page - 1);
        }
    };
    pagination.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = page === totalPages;
    nextButton.onclick = () => {
        if (page < totalPages) {
            fetchMovies(apiKey, query, page + 1);
        }
    };
    pagination.appendChild(nextButton);
}