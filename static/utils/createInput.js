
export default  function tag(type,textContent, attributes = {}) {
    let element = document.createElement(type)
    element.textContent = textContent
    for (let [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v)
    }
    return element
}