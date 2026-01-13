const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const output = document.getElementById('output');
const maxSizeInput = document.getElementById('max-size');
const maxSizeValue = document.getElementById('max-size-value');
const refreshBtn = document.getElementById('refresh-btn');
const copyBtn = document.getElementById('copy-btn');
const tallFixCheckbox = document.getElementById('tall-fix');

let currentImage = null;

const characters = [
    ' ', '.', ':', '-', '=', '+', '*', '#', '%', '@',
    '▒', '▓', '█'  // These are generally well-supported Unicode characters
];
const transparencyChar = '░'; // Unicode character for transparent areas

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
refreshBtn.addEventListener('click', generateAsciiArt);
copyBtn.addEventListener('click', copyToClipboard);
maxSizeInput.addEventListener('input', updateMaxSizeValue);
tallFixCheckbox.addEventListener('change', generateAsciiArt);

function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
}

function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            displayImagePreview(e.target.result);
            generateAsciiArt();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(src) {
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    previewImage.src = src;
    imagePreview.style.display = 'flex';
}

function generateAsciiArt() {
    if (!currentImage) return;

    const maxSize = parseInt(maxSizeInput.value);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    if (currentImage.width > currentImage.height) {
        width = Math.min(maxSize, currentImage.width);
        height = Math.round(width * (currentImage.height / currentImage.width));
    } else {
        height = Math.min(maxSize, currentImage.height);
        width = Math.round(height * (currentImage.width / currentImage.height));
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(currentImage, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let result = '';
    const tallFix = tallFixCheckbox.checked;
    const aspectRatio = tallFix ? 0.5 : 1; // Adjust this value to fine-tune the correction

    for (let y = 0; y < height; y += (tallFix ? 2 : 1)) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 128) {
                // Transparent pixel
                result += transparencyChar;
            } else {
                const avg = (r + g + b) / 3;
                const charIndex = Math.floor(avg / 256 * characters.length);
                result += characters[charIndex];
            }
        }
        result += '\n';
    }

    output.value = result;
    output.style.display = 'block';
}

function copyToClipboard() {
    output.select();
    document.execCommand('copy');
}

function updateMaxSizeValue() {
    maxSizeValue.textContent = maxSizeInput.value;
}

