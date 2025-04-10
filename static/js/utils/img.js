export default function createImageElement(filename) {
    const imagePath = `/static/svg/${filename}`;
    const imgElement = document.createElement('img');
    imgElement.src = imagePath;
    return imgElement;
}
