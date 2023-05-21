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

let perPage = 40;
let page = 1 // Default: 1
let formData = '';

const lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
});

async function fetchImages() {
    try {
        const {data} = await axios.get('https://pixabay.com/api/', {
            params: {
            key: API_KEY,
            q: formData,
            safeSearch: true, // Default "false"
            orientation: 'horizontal', // Accepted values: "all", "horizontal", "vertical"
            imageType: 'photo', // Accepted values: "all", "photo", "illustration", "vector"
            per_page: perPage,
            page: page,
            }
        })
        return data;
    } catch (error) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
}

function buildGallery(images) {
    return images
    .map((images) => {
        return `<div class="photo-card">
            <a class="gallery__link" href="${images.largeImageURL}"><img class="card-image" src="${images.webformatURL}" alt="${images.tags}" loading="lazy"></a>
            <div class="info">
                <p class="info-item">
                    Likes: <b>${images.likes}</b>
                </p>
                <p class="info-item">
                    Views: <b>${images.views}</b>
                </p>
                <p class="info-item">
                    Comments: <b>${images.comments}</b>
                </p>
                <p class="info-item">
                    Downloads: <b>${images.downloads}</b>
                </p>
            </div>
        </div>`;
    })
    .join("");
    gallery.innerHTML = images;
}

async function searchImage() {
    try {
        const result = await fetchImages();  
        if(result.total === 0) {
            loadMoreBtn.classList.remove('is-active');
            return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');  
        }
        loadMoreBtn.classList.add('is-active');
        if(result.totalHits - perPage * page < 0) {
            loadMoreBtn.classList.remove('is-active');
            return Notiflix.Notify.failure('We\'re sorry, but you\'ve reached the end of search results.');
        }
        if(page === 1) {
            lightbox.refresh();
        }
        const addingImages = buildGallery(result.hits);
        gallery.insertAdjacentHTML('beforeend', addingImages); 
        lightbox.refresh();   
    } catch (error) {
        console.log(error);
    } 
}

function inputSubmit(event) {
    event.preventDefault();
    page = 1;
    gallery.innerHTML = '';
    formData = searchInput.value.trim();  
    if(formData === '' || formData === ' ') {
        return Notiflix.Notify.failure('Type something, please.');
    }
    searchImage();
}

async function loadImages() {
    page += 1;
    await searchImage();
}

loadMoreBtn.addEventListener('click', loadImages);
form.addEventListener('submit', inputSubmit);
