import { offset } from "./offset.js";
import div from "./utils/div.js";
import fetchPosts from "./fetchposts.js"
import appendPosts from "./appendPosts.js";
export const selectedCategories = new Set();

export default function setupCategoryFilters() {
    const categoriesList = ["Technology", "Sport", "finance", "Science", "Nature"];

    const filterContainer = div("filter");
    const categories = div("categories");
    filterContainer.appendChild(categories);

    const allDiv = div("category active all", "All");
    allDiv.onclick = async (event) => await filterByCat(event);
    categories.appendChild(allDiv);

    categoriesList.forEach((category) => {
        const categoryDiv = div("category", category);
        categoryDiv.onclick = async (event) => await filterByCat(event);
        categories.appendChild(categoryDiv);
    });

    document.body.appendChild(filterContainer);
}

async function filterByCat(event) {
    const clicked = event.target;
    const category = clicked.innerText;

    const allButton = document.querySelector(".category.all");
    const categoryButtons = document.querySelectorAll(".category:not(.all)");

    if (category === "All") {
        selectedCategories.clear();
        allButton.classList.add("active");
        categoryButtons.forEach(btn => btn.classList.remove("active"));
    } else {
        if (clicked.classList.contains("active")) {
            clicked.classList.remove("active");
            selectedCategories.delete(category);
        } else {
            clicked.classList.add("active");
            selectedCategories.add(category);
        }

        if (selectedCategories.size > 0) {
            allButton.classList.remove("active");
        } else {
            allButton.classList.add("active");
        }
    }
    offset.reset()

    let res = await fetchPosts();
    console.log('kjhlkj');
    
    console.log('ggg',res);
    
    appendPosts(document.querySelector('.postsContainer'), res)
}
