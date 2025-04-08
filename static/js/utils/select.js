export function option(valueText) {
    let opt = document.createElement("option")
    opt.value = valueText.toLowerCase()
    opt.textContent = valueText
    return opt
}

export default function select(name, optionsArray) {
    let select = document.createElement("select")
    select.name = name
    optionsArray.forEach(opt => select.append(option(opt)))
    return select
}