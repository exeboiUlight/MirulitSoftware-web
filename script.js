let products = [];

function preloadImage(url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
}

function preloadAllImages(products) {
    products.forEach(product => {
        if (product.icon) preloadImage(product.icon);
        if (product.screenshots && Array.isArray(product.screenshots)) {
            product.screenshots.forEach(s => preloadImage(s));
        }
    });
}

function openModal(product) {
    const overlay = document.getElementById('modal-overlay');
    const modal = overlay.querySelector('.modal');

    const screenshotsHTML = product.screenshots && product.screenshots.length > 0
        ? product.screenshots.map(s => `
            <div class="modal-screenshot" data-src="${s}">
                <img src="${s}" alt="Screenshot" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
        `).join('')
        : '<p style="color:#6e7681">Скриншоты отсутствуют</p>';

    modal.innerHTML = `
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <div class="modal-header">
            <div class="modal-icon">
                <img src="${product.icon}" alt="${product.name} icon" onerror="this.parentElement.textContent='${product.name.charAt(0)}'">
            </div>
            <div class="modal-info">
                <h2>${product.name}</h2>
                <span class="product-engine">${product.engine}</span>
                <div class="modal-dev">${product.developer || ''} · v${product.version || '1.0.0'}</div>
            </div>
        </div>
        <div class="modal-description">${product.description}</div>
        <div class="modal-screenshots">${screenshotsHTML}</div>
        <div class="modal-meta">
            <span class="file-size">${product.fileSize || 'N/A'}</span>
            <a href="${product.downloadFile}" class="download-btn" download>Скачать</a>
        </div>
    `;

    modal.querySelectorAll('.modal-screenshot').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation();
            openImageViewer(el.dataset.src);
        });
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openImageViewer(src) {
    const viewer = document.getElementById('image-viewer-overlay');
    viewer.querySelector('.image-viewer-img').src = src;
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
    const viewer = document.getElementById('image-viewer-overlay');
    viewer.classList.remove('active');
    const modal = document.getElementById('modal-overlay');
    if (modal.classList.contains('active')) {
        return;
    }
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = '<div class="modal"></div>';
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });
    document.body.appendChild(modalOverlay);

    const imageViewer = document.createElement('div');
    imageViewer.id = 'image-viewer-overlay';
    imageViewer.className = 'image-viewer-overlay';
    imageViewer.innerHTML = `
        <button class="image-viewer-close" onclick="closeImageViewer()">&times;</button>
        <img class="image-viewer-img" src="" alt="Full size screenshot">
    `;
    imageViewer.addEventListener('click', e => {
        if (e.target === imageViewer) closeImageViewer();
    });
    document.body.appendChild(imageViewer);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (imageViewer.classList.contains('active')) {
                closeImageViewer();
            } else {
                closeModal();
            }
        }
    });

    const container = document.getElementById('products-container');

    async function loadProducts() {
        container.innerHTML = '<div class="loading">Загрузка...</div>';
        try {
            const response = await fetch('products.json');
            products = await response.json();
            preloadAllImages(products);
            renderProducts();
        } catch (error) {
            container.innerHTML = '<div class="empty-store"><h2>Ошибка загрузки</h2><p>Не удалось загрузить список продуктов</p></div>';
        }
    }

    function renderProducts() {
        container.innerHTML = products.map(product => `
            <div class="product-tile" data-id="${product.id}">
                <div class="product-header">
                    <div class="product-icon">
                        <img src="${product.icon}" alt="${product.name} icon" onerror="this.parentElement.textContent='${product.name.charAt(0)}'">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <span class="product-engine">${product.engine}</span>
                    </div>
                </div>
                <div class="product-description">${product.description}</div>
                ${product.screenshots && product.screenshots.length > 0 ? `
                    <div class="screenshots">
                        ${product.screenshots.map(s => `
                            <div class="screenshot" data-src="${s}">
                                <img src="${s}" alt="Screenshot" loading="lazy" onerror="this.parentElement.textContent='IMG'">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="product-meta">
                    <span class="file-size">${product.fileSize || 'N/A'}</span>
                    <a href="${product.downloadFile}" class="download-btn" download onclick="event.stopPropagation()">Скачать</a>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.product-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const id = tile.dataset.id;
                const product = products.find(p => p.id === id);
                if (product) openModal(product);
            });

            tile.querySelectorAll('.screenshot').forEach(el => {
                el.addEventListener('click', e => {
                    e.stopPropagation();
                    openImageViewer(el.dataset.src);
                });
            });
        });
    }

    loadProducts();
});
