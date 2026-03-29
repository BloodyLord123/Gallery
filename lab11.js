const MS_IN_MINUTE = 60000;
const MS_IN_SECOND = 1000;
const IMAGES_PER_LOAD = 2;

const gallery = document.getElementById('gallery');
const loadImagesBtn = document.getElementById('loadImages');
const clearGalleryBtn = document.getElementById('clearGallery');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenImg = document.getElementById('fullscreenImg');

let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
let currentIndex = 0;

let timerElement = document.getElementById('timer');
let startTime = Date.now();
let totalTime = 0;
let timerInterval;
let isPageVisible = true;
const locationDisplay = document.getElementById("location");

document.getElementById('exitBtn').addEventListener('click', exitFullscreen);
document.getElementById('prevBtn').addEventListener('click', () => navigateImage(-1));
document.getElementById('nextBtn').addEventListener('click', () => navigateImage(1));

function startTimer() {
    timerInterval = setInterval(() => {
        if (isPageVisible) {
            totalTime = Date.now() - startTime;
            const minutes = Math.floor(totalTime / MS_IN_MINUTE);
            const seconds = Math.floor((totalTime % MS_IN_MINUTE) / MS_IN_SECOND);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isPageVisible = false;
    } else {
        startTime = Date.now() - totalTime;
        isPageVisible = true;
    }
});
window.addEventListener('focus', () => {
    if (!timerInterval) {
        startTimer();
    }
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                locationDisplay.textContent = `Широта: ${latitude.toFixed(4)}, Довгота: ${longitude.toFixed(4)}`;
            },
            (error) => {
                console.error("Помилка геолокації:", error);
                locationDisplay.textContent = "Не вдалося отримати місцезнаходження.";
            }
        );
    } else {
        locationDisplay.textContent = "Геолокація не підтримується браузером.";
    }
}
window.addEventListener("load", getLocation);

function createImageElement(src, onClick) {
    const img = document.createElement('img');
    img.src = src;
    img.addEventListener('click', onClick);
    return img;
}

async function loadImages() {
    for (let i = 0; i < IMAGES_PER_LOAD; i++) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            if (!response.ok) throw new Error('Помилка сервера');
            const data = await response.json();
            const img = createImageElement(data.message, () => enterFullscreen(images.indexOf(data.message)));
            gallery.appendChild(img);
            images.push(data.message);
            saveGalleryToLocalStorage();
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
            alert('Не вдалося завантажити фото. Спробуйте ще раз.');
        }
    }
}

function saveGalleryToLocalStorage() {
    try {
        localStorage.setItem('galleryImages', JSON.stringify(images));
    } catch (error) {
        console.error('Помилка збереження в локальне сховище:', error);
        alert('Не вдалося зберегти галерею.');
    }
}

loadImagesBtn.addEventListener('click', loadImages);

function enterFullscreen(index) {
    currentIndex = index;
    fullscreenImg.src = images[currentIndex];
    fullscreenModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function exitFullscreen() {
    fullscreenModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function navigateImage(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    fullscreenImg.src = images[currentIndex];
}

clearGalleryBtn.addEventListener('click', () => {
    images = [];
    localStorage.removeItem('galleryImages');
    gallery.innerHTML = '';
});

window.addEventListener('load', () => {
    images.forEach(src => {
        const img = createImageElement(src, () => enterFullscreen(images.indexOf(src)));
        gallery.appendChild(img);
    });
});