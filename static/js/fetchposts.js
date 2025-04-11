import { offset } from "./offset.js";
import { selectedCategories } from "./filters.js"; 

export default async function fetchPosts() {
  const currentOffset = offset.get();
  const categories = Array.from(selectedCategories);

  const params = new URLSearchParams();
  params.set("offset", currentOffset);
  categories.forEach(cat => params.append("categories", cat));

  const res = await fetch(`/api/GetPosts?${params.toString()}`);
  const json = await res.json();
  
  offset.increase(json.length);
  return json;
}