import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import './css/styles.css';
import "simplelightbox/dist/simple-lightbox.min.css";

const URL = 'https://pixabay.com/api/';
const API_KEY = '36459618-9e1c2438b9bedc23fad0a5c73';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more')

const perPage = 40; // Accepted values: 3 - 200, Default: 20
let page = 1 // Default: 1
let formData = '';

async function fetchImages() {
    try {
        const {data} = await axios.get('https://pixabay.com/api/', {
            params: {
            key: API_KEY,
            q: formData,
            safeSearch: true, // Default "false"
            orientation: 'horizontal', // Accepted values: "all", "horizontal", "vertical"
            imageType: 'photo', // Accepted values: "all", "photo", "illustration", "vector"
            perPage: perPage,
            page: page,
            }
        })
        return data;
    } catch (error) {
        console.log(error);
    }
}

function buildGallery(images) {
    const img = images
    .map((img) => {
        return `<div class="photo-card">
            <a class="gallery__link" href="${img.largeImageURL}"><img class="card-image" src="${img.webformatURL}" alt="${img.tags}" loading="lazy"></a>
            <div class="info">
                <p class="info-item">
                    Likes: <b>${img.likes}</b>
                </p>
                <p class="info-item">
                    Views: <b>${img.views}</b>
                </p>
                <p class="info-item">
                    Comments: <b>${img.comments}</b>
                </p>
                <p class="info-item">
                    Downloads: <b>${img.downloads}</b>
                </p>
            </div>
        </div>`;
    })
    .join("");
    gallery.innerHTML = img;
}

function showGallery() {
    var lightbox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
    });
}

async function searchImage() {
    try {
        const result = await fetchImages();  
        buildGallery(result.hits);
        showGallery();
        if(result.total === 0) {
            loadMoreBtn.classList.remove('is-active');
            return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');  
        }
        loadMoreBtn.classList.add('is-active');
        if(result.totalHits - page * perPage < 0) {
            loadMoreBtn.classList.remove('is-active');
            return Notiflix.Notify.failure('We\'re sorry, but you\'ve reached the end of search results.');
        }
    } catch (error) {
        console.log(error);
    } 
}

function inputSubmit(event) {
    event.preventDefault();
    page = 1;
    formData = searchInput.value.trim();  
    searchImage();
}

function loadImages() {
    page += 1;
    searchImage();
}

loadMoreBtn.addEventListener('click', loadImages);
form.addEventListener('submit', inputSubmit);
