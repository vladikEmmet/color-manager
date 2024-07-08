import {setCurTextColor} from "./functions.js";

const viewBtn = document.querySelector('.quick-view');
const closeModalBtn = document.querySelector('.close-view');
const modal = document.querySelector('.view-modal');
const colors = [];
let curColor = 0;

function getCurrentColors() {
    const columns = document.querySelectorAll('.column');
    columns.forEach((col) => {
        const color = window.getComputedStyle(col).backgroundColor;
        colors.push(color);
    });
}

function resetColors() {
    colors.length = 0;
    curColor = 0;
    modal.querySelector('.selected-colors').remove();
}

function resetColorInfo() {
    const colorInfo = modal.querySelectorAll('.color-info');
    colorInfo.forEach((info) => {
        info.remove();
    });
}

function setCurColorsBackground() {
        document.querySelector('.modal-style').innerHTML =
            `
            .view-color-info:hover {
                background: ${chroma(curColor).luminance() > 0.5 ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"
            };
      `;
}

function fillColorInfo() {
    const color = colors[curColor];
    const hexInfo = modal.querySelector('.view-hex').querySelector('.info');
    const rgbInfo = modal.querySelector('.view-rgb').querySelector('.info');
    const hsbInfo = modal.querySelector('.view-hsb').querySelector('.info');
    const hslInfo = modal.querySelector('.view-hsl').querySelector('.info');
    const nameInfo = modal.querySelector('.view-name').querySelector('.info');

    const hex = document.createElement('p');
    hex.classList.add('color-info');
    hex.textContent = chroma(color).name();
    const rgb = document.createElement('p');
    rgb.classList.add('color-info');
    const [r, g, b] = chroma(color).rgb();
    rgb.textContent = [r, g, b].join(', ');
    const hsb = document.createElement('p');
    hsb.classList.add('color-info');
    const [h, s, v] = chroma(color).hsv();
    hsb.textContent = [Math.round(h), Math.round(s), Math.round(v)].join(', ');
    const hsl = document.createElement('p');
    hsl.classList.add('color-info');
    const [hh, ss, ll] = chroma(color).hsl();
    hsl.textContent = [Math.round(hh), Math.round(ss), Math.round(ll)].join(', ');
    const cmyk = document.createElement('p');
    cmyk.classList.add('color-info');
    cmyk.textContent = chroma(color).cmyk().map(c => Math.round(c)).join(', ');

    setCurTextColor(hex, color);
    setCurTextColor(rgb, color);
    setCurTextColor(hsb, color);
    setCurTextColor(hsl, color);
    setCurTextColor(cmyk, color);

    hexInfo.appendChild(hex);
    rgbInfo.appendChild(rgb);
    hsbInfo.appendChild(hsb);
    hslInfo.appendChild(hsl);
    nameInfo.appendChild(cmyk);

    setCurColorsBackground();
}

function fillModal() {
    modal.querySelector('.modal-body').style.backgroundColor = colors[curColor];
    fillColorInfo();
}

function updateActive(idx) {
    curColor = idx;
    fillModal();
    for(let i = 0; i < colors.length; i++) {
        const div = modal.querySelector('.selected-colors').children[i];
        if(i === idx) {
            div.classList.add('active');
        } else {
            div.classList.remove('active');
        }
    }
    resetColorInfo();
    fillColorInfo();
}

function fillSelectedColors() {
    const selectedColors = document.createElement('div');
    selectedColors.classList.add('selected-colors');
    for(let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const div = document.createElement('div');
        div.classList.add('selected-color');
        if(i === 0) {
            div.classList.add('active');
        }
        div.style.color = chroma(color).luminance() > 0.5 ? "black" : "white";
        div.style.backgroundColor = color;
        div.addEventListener('click', function() {
            updateActive(i);
        });

        div.addEventListener('mouseover', function() {
            this.classList.add('active');
        });

        div.addEventListener('mouseout', function() {
            if(curColor !== i) {
              this.classList.remove('active');
            }
        })
        selectedColors.appendChild(div);
    }
    modal.querySelector('.modal-footer').appendChild(selectedColors);
}

viewBtn.addEventListener('click', function() {
    resetColorInfo();
    resetColors();
    getCurrentColors();
    fillModal();
    fillSelectedColors();
    modal.showModal();
});

closeModalBtn.addEventListener('click', function() {
    modal.close();
});

modal.querySelectorAll('.view-color-info').forEach((info) => {
    info.addEventListener('click', function() {
        const text = this.querySelector('.info').querySelector('.color-info').textContent;
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.querySelector('.copy').textContent = "Copied!";
                })
                .catch((err) => {
                    console.error(err);
                    this.querySelector('.copy').textContent = "Error!";
                })
                .finally(() => {
                    setTimeout(() => {
                        this.querySelector('.copy').textContent = "Copy";
                    }, 1000);
                });
    });
});
