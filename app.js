import {setCurTextColor} from "./functions.js";
// Variables

let columns = document.querySelectorAll(".column");
const settingsBtn = document.querySelector(".settings");
const settingsContainer = document.querySelector(".settings-container");
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
    const buttons = col.querySelectorAll("button");

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
    buttons.forEach((btn) => setTextColor(btn, color));
  });

  setColorsHash(colors);
}

function setGradientColors() {
  const firstColor = chroma.random();
  const firstColumn = columns[0];
  firstColumn.style.backgroundColor = firstColor;
  setTextColor(firstColumn.querySelector("h2"), firstColor);
  firstColumn
    .querySelectorAll("button")
    .forEach((btn) => setTextColor(btn, firstColor));

  const lastColor = chroma.random();
  const lastColumn = columns[columns.length - 1];
  lastColumn.style.backgroundColor = lastColor;
  setTextColor(lastColumn.querySelector("h2"), lastColor);
  lastColumn
    .querySelectorAll("button")
    .forEach((btn) => setTextColor(btn, lastColor));

  const colors = chroma.scale([firstColor, lastColor]).colors(columns.length);
  for (let i = 1; i < columns.length - 1; i++) {
    const col = columns[i];
    if (col.querySelector("i").classList.contains("fa-lock")) continue;
    const text = col.querySelector("h2");
    const buttons = col.querySelectorAll("button");

    col.style.backgroundColor = colors[i];
    setTextColor(text, colors[i]);
    buttons.forEach((btn) => setTextColor(btn, colors[i]));
  }
}

function setTextColor(text, color) {
  if (!invertColor) return;
    setCurTextColor(text, color);
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

function addNewColumn() {
  const newCol = document.createElement("div");
  newCol.classList.add("column");
  const newTitle = document.createElement("h2");
  newTitle.setAttribute("data-type", "copy");
  const lockBtn = document.createElement("button");
  lockBtn.setAttribute("data-type", "lock");
  const lockIcon = document.createElement("i");
  lockIcon.classList.add("fa-solid");
  lockIcon.classList.add("fa-lock-open");
  lockIcon.setAttribute("data-type", "lock");
  lockBtn.append(lockIcon);
  const removeBtn = document.createElement("button");
  const removeIcon = document.createElement("i");
  removeIcon.classList.add("fa-solid");
  removeIcon.classList.add("fa-minus");
  removeIcon.setAttribute("data-type", "remove");
  removeBtn.setAttribute("data-type", "remove");
  removeBtn.append(removeIcon);
  newCol.append(newTitle, lockBtn, removeBtn);
  console.log(newCol);
  document.querySelector('.columns-container').append(newCol);
  const color = chroma.random();
  newCol.style.background = color;
  newTitle.textContent = color;
  columns = document.querySelectorAll(".column");
  setColorsHash([...getColorsHash(), color]);
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
  }
});

settingsContainer.addEventListener("click", function (e) {
  const target = e.target;
  if (
    target.classList.contains("generate-colors-item") ||
    target.closest(".generate-colors-item")
  ) {
    setRandomColors();
    settingsContainer.classList.remove("active");
    return;
  }
  if (
    target.classList.contains("show-gradient-item") ||
    target.closest(".show-gradient-item")
  ) {
    if (isGradients) {
      e.target.querySelector(".gradients-state").textContent = "off";
      setRandomColors();
      isGradients = false;
      return;
    }
    e.target.querySelector(".gradients-state").textContent = "on";
    setGradientColors();
    isGradients = true;
    return;
  }
  if (target.classList.contains("color-inversion-item")) {
    if (invertColor) {
      invertColor = false;
      columns.forEach((col) => {
        col.querySelector("h2").style.color = "black";
        col.querySelectorAll("button").forEach(btn => btn.style.color = "black");
      });

      settingsBtn.style.color = "black";
      target.querySelector("span").textContent = "off";
      return;
    }

    invertColor = true;
    columns.forEach((col, idx) => {
      const color = window.getComputedStyle(col).backgroundColor;
      const text = col.querySelector("h2");
      const buttons = col.querySelectorAll("button");

      setTextColor(text, color);
      buttons.forEach(btn => setTextColor(btn, color));
      target.querySelector("span").textContent = "on";
    });
    return;
  }

  if (target.classList.contains("add-new-column")) {
    addNewColumn();
    this.classList.remove("active");
  }
});

document.addEventListener("keyup", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    if(settingsContainer.classList.contains("active")) {
        settingsContainer.classList.remove("active");
    }
    if (isGradients) {
      setGradientColors();
      return;
    }
    setRandomColors();
  }

  if (e.code === "Escape" && settingsContainer.classList.contains("active")) {
    settingsContainer.classList.remove("active");
  }

  if (e.code === "KeyN" && e.shiftKey) {
    addNewColumn();
  }

  if(e.code === "KeyS") {
    e.preventDefault();
    settingsContainer.classList.add('active');
  }
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

  if (type === "remove") {
    if (columns.length === 1) return;
    e.target.closest(".column").remove();
  }

  if(type === "generate-btn") {
    setRandomColors();
    settingsContainer.classList.remove('active');
  }
});

setRandomColors(true);
