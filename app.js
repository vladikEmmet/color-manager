// Variables

const columns = document.querySelectorAll(".column");
const settingsBtn = document.querySelector(".settings");
const settingsContainer = document.querySelector(".settings-container");
const settingsGenerateColorsBtn = settingsContainer.querySelector(
  ".generate-colors-item"
);
const settingsColorInversion = settingsContainer.querySelector(
  ".color-inversion-item"
);
const settingsShowGradients = settingsContainer.querySelector(
  ".show-gradient-item"
);
const copyNotification = document.querySelector(
  ".successful-copy-notification"
);
let invertColor = true;
let isGradients = false;

// Functions

function setRandomColors(isInitial) {
  const colors = isInitial ? getColorsHash() : [];

  columns.forEach((col, idx, arr) => {
    const text = col.querySelector("h2");
    const button = col.querySelector("button");

    if (col.querySelector("i").classList.contains("fa-lock")) {
      colors.push(text.textContent);
      return;
    }

    const color = isInitial
      ? colors[idx]
        ? colors[idx]
        : chroma.random()
      : chroma.random();

    if (!isInitial) {
      colors.push(color);
    }

    col.style.background = color;
    text.textContent = color;

    setTextColor(text, color);
    setTextColor(button, color);
    if (idx === arr.length - 1) {
      setTextColor(settingsBtn, color);
    }
  });

  setColorsHash(colors);
}

function setGradientColors() {
  const firstColor = chroma.random();
  const firstColumn = columns[0];
  firstColumn.style.backgroundColor = firstColor;
  setTextColor(firstColumn.querySelector("h2"), firstColor);
  setTextColor(firstColumn.querySelector("button"), firstColor);

  const lastColor = chroma.random();
  const lastColumn = columns[columns.length - 1];
  lastColumn.style.backgroundColor = lastColor;
  setTextColor(lastColumn.querySelector("h2"), lastColor);
  setTextColor(lastColumn.querySelector("button"), lastColor);
  setTextColor(settingsBtn, lastColor);

  const colors = chroma.scale([firstColor, lastColor]).colors(5);
  for (let i = 1; i < columns.length - 1; i++) {
    const col = columns[i];
    if (col.querySelector("i").classList.contains("fa-lock")) continue;
    const text = col.querySelector("h2");
    const button = col.querySelector("button");

    col.style.backgroundColor = colors[i];
    setTextColor(text, colors[i]);
    setTextColor(button, colors[i]);
  }
}

function setTextColor(text, color) {
  if (!invertColor) return;
  const lum = chroma(color).luminance();
  text.style.color = lum > 0.5 ? "black" : "white";
}

function copyColor(text) {
  navigator.clipboard.writeText(text);
}

function setColorsHash(colors = []) {
  document.location.hash = colors
    .map((color) => color.toString().substring(1))
    .join("-");
}

function getColorsHash() {
  if (document.location.hash.length > 1) {
    return document.location.hash
      .substring(1)
      .split("-")
      .map((color) => "#" + color);
  }
  return [];
}

// Event Listeners

settingsBtn.addEventListener("click", function () {
  settingsContainer.classList.toggle("active");
  if (settingsContainer.classList.contains("active")) {
    settingsContainer.querySelector(".inversion-state").textContent =
      invertColor ? "on" : "off";
    settingsShowGradients.querySelector(".gradients-state").textContent =
      isGradients ? "on" : "off";
    this.style.color = "black";
    return;
  }
  setTextColor(
    this,
    window.getComputedStyle(columns[columns.length - 1]).backgroundColor
  );
});

settingsGenerateColorsBtn.addEventListener("click", function () {
  setRandomColors();
  settingsContainer.classList.remove("active");
});

document.addEventListener("keyup", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    if (isGradients) {
      setGradientColors();
      return;
    }
    setRandomColors();
  }
});

settingsColorInversion.addEventListener("click", function () {
  if (invertColor) {
    invertColor = false;
    columns.forEach((col) => {
      col.querySelector("h2").style.color = "black";
      col.querySelector("button").style.color = "black";
    });

    settingsBtn.style.color = "black";
    this.querySelector("span").textContent = "off";
    return;
  }

  invertColor = true;
  columns.forEach((col, idx) => {
    const color = window.getComputedStyle(col).backgroundColor;
    const text = col.querySelector("h2");
    const button = col.querySelector("button");

    setTextColor(text, color);
    setTextColor(button, color);
    this.querySelector("span").textContent = "on";
  });
});

settingsShowGradients.addEventListener("click", function () {
  if (isGradients) {
    this.querySelector(".gradients-state").textContent = "off";
    setRandomColors();
    isGradients = false;
    return;
  }

  this.querySelector(".gradients-state").textContent = "on";
  setGradientColors();
  isGradients = true;
});

document.addEventListener("click", function (e) {
  const type = e.target.dataset.type;

  if (type === "lock") {
    const node = e.target.tagName === "I" ? e.target : e.target.children[0];
    node.classList.toggle("fa-lock-open");
    node.classList.toggle("fa-lock");
  }

  if (type === "copy") {
    copyColor(e.target.textContent);
    const { top, left } = e.target.getBoundingClientRect();
    copyNotification.style.top = top + e.target.clientHeight + 5 + "px";
    const diff = (e.target.clientWidth - 80) / 2;
    copyNotification.style.left = left + diff + "px";
    copyNotification.style.visibility = "visible";
    copyNotification.style.opacity = "1";
    setTimeout(() => {
      copyNotification.style.visibility = "hidden";
      copyNotification.style.opacity = "0";
    }, 2000);
  }
});

document.querySelector;

setRandomColors(true);
