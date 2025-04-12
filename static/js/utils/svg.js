export default async function svg(filename) {
    try {
      const response = await fetch(`/static/svg/${filename}.svg`);
      const svgText = await response.text();
  
      const template = document.createElement("template");
      template.innerHTML = svgText.trim();
      const svgElement = template.content.firstChild;
  
      return svgElement;
    } catch (error) {
      console.error(`Failed to load SVG: ${filename}`, error);
      return null;
    }
  }