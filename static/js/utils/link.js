export default function link(text, destination, onClick) {
    let a = document.createElement("a");
    a.textContent = text;
    a.href = destination;
    a.style.cursor = "pointer";
    a.style.color = "#007bff"; 
    a.style.textDecoration = "underline";
    
    a.onclick = (e) => {
        e.preventDefault();
        if (onClick) onClick();
    };

    return a;
}
