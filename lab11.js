const CONFIG = {
    MS_IN_MINUTE: 60000,
    MS_IN_SECOND: 1000,
    IMAGES_PER_LOAD: 2,
    API_URL: 'https://dog.ceo/api/breeds/image/random'
};

const TimerModule = {
    element: document.getElementById('timer'),
    startTime: Date.now(),
    totalTime: 0,
    interval: null,
    isPageVisible: true,

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            if (this.isPageVisible) {
                this.totalTime = Date.now() - this.startTime;
                const minutes = Math.floor(this.totalTime / CONFIG.MS_IN_MINUTE);
                const seconds = Math.floor((this.totalTime % CONFIG.MS_IN_MINUTE) / CONFIG.MS_IN_SECOND);
                this.element.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            }
        }, 1000);
    },

    handleVisibilityChange() {
        if (document.hidden) {
            this.isPageVisible = false;
        } else {
            this.startTime = Date.now() - this.totalTime;
            this.isPageVisible = true;
        }
    },

    init() {
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('focus', () => this.start());
        this.start();
    }
};

const LocationModule = {
    display: document.getElementById("location"),

    fetchLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    this.display.textContent = `Широта: ${position.coords.latitude.toFixed(4)}, Довгота: ${position.coords.longitude.toFixed(4)}`;
                },
                (error) => {
                    console.error("Помилка геолокації:", error);
                    this.display.textContent = "Не вдалося отримати місцезнаходження.";
                }
            );
        } else {
            this.display.textContent = "Геолокація не підтримується браузером.";
        }
    },

    init() {
        this.fetchLocation();
    }
};

const GalleryModule = {
    container: document.getElementById('gallery'),
    images: JSON.parse(localStorage.getItem('galleryImages')) || [],
    currentIndex: 0,

    modal: document.getElementById('fullscreenModal'),
    modalImg: document.getElementById('fullscreenImg'),

    createImageElement(src, index) {
        const img = document.createElement('img');
        img.src = src;
        img.addEventListener('click', () => this.enterFullscreen(index));
        return img;
    },

    async loadNewImages() {
        for (let i = 0; i < CONFIG.IMAGES_PER_LOAD; i++) {
            try {
                const response = await fetch(CONFIG.API_URL);
                if (!response.ok) throw new Error('Помилка сервера');
                const data = await response.json();

                this.images.push(data.message);
                const img = this.createImageElement(data.message, this.images.length - 1);
                this.container.appendChild(img);

                this.saveToStorage();
            } catch (error) {
                console.error('Помилка завантаження фото:', error);
                alert('Не вдалося завантажити фото. Спробуйте ще раз.');
            }
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem('galleryImages', JSON.stringify(this.images));
        } catch (error) {
            console.error('Помилка збереження:', error);
        }
    },

    clearGallery() {
        this.images = [];
        localStorage.removeItem('galleryImages');
        this.container.innerHTML = '';
    },

    enterFullscreen(index) {
        this.currentIndex = index;
        this.modalImg.src = this.images[this.currentIndex];
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    exitFullscreen() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    navigateImage(direction) {
        this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        this.modalImg.src = this.images[this.currentIndex];
    },

    renderSavedImages() {
        this.images.forEach((src, index) => {
            const img = this.createImageElement(src, index);
            this.container.appendChild(img);
        });
    },

    init() {
        this.renderSavedImages();

        document.getElementById('loadImages').addEventListener('click', () => this.loadNewImages());
        document.getElementById('clearGallery').addEventListener('click', () => this.clearGallery());

        document.getElementById('exitBtn').addEventListener('click', () => this.exitFullscreen());
        document.getElementById('prevBtn').addEventListener('click', () => this.navigateImage(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.navigateImage(1));
    }
};

function initApp() {
    TimerModule.init();
    LocationModule.init();
    GalleryModule.init();
}

window.addEventListener('DOMContentLoaded', initApp);
