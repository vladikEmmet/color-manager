export function setCurTextColor(text, color) {
    const lum = chroma(color).luminance();
    text.style.color = lum > 0.5 ? "black" : "white";
}