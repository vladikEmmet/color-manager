const exportModal = document.querySelector('.export-modal');
const closeModalBtn = exportModal.querySelector('.close-export');
const exportBtn = document.querySelector('.export-btn');
const copyNotification = document.querySelector(".successful-copy-notification");
const colorsInfo = {};
async function copyLink() {
    navigator.clipboard.writeText(document.location.href);
}

function generateCSSInfo() {
    document.querySelectorAll('.column').forEach((col, idx) => {
        const color = window.getComputedStyle(col).backgroundColor;
        // colorsInfo[`color${idx + 1}`] = {};
        const colorInfo = {};
        colorInfo.hex = chroma(color).name();
        colorInfo.rgba = chroma(color).rgba();
        colorInfo.hsla = chroma(color).hsl();

        colorsInfo[idx + 1] = colorInfo;
    });
}

function generateCSSString() {
    let res =
        `
    /* CSS HEX */`;

    for(const key in colorsInfo) {
        res += `
        --color${key}: ${colorsInfo[key].hex};`;
    }

    res += `
    /* CSS RGB */`;

    for(const key in colorsInfo) {
        res += `
        --color${key}: ${colorsInfo[key].rgba};`;
    }

    res += `
    /* CSS HSL */`;

    for(const key in colorsInfo) {
        res += `
        --color${key}: ${colorsInfo[key].hsla};`;
    }

    return res;
}

function generateSCSSString() {
    let res =
        `
    /* SCSS HEX */`;

    for(const key in colorsInfo) {
        res += `
        $color${key}: ${colorsInfo[key].hex};`;
    }

    res += `
    /* SCSS RGB */`;

    for(const key in colorsInfo) {
        res += `
        $color${key}: ${colorsInfo[key].rgba};`;
    }

    res += `
    /* SCSS HSL */`;

    for(const key in colorsInfo) {
        res += `
        $color${key}: ${colorsInfo[key].hsla};`;
    }


    return res;
}

function generateSCSSFile() {
    generateCSSInfo();
    let cssString = generateCSSString();
    let scssString = generateSCSSString();

    const res = cssString + scssString;
    return new Blob([res], {type: 'text/x-scss'});
}

function downloadSCSSFile() {
    const file = generateSCSSFile();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'palette.scss';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyLinkWithNotification() {
    copyLink()
        .catch(err => {
            console.log(err);
            copyNotification.textContent = "Failed to copy link";
        })
        .finally(() => {
            // Устанавливаем фиксированное позиционирование
            copyNotification.style.position = 'fixed';
            copyNotification.style.top = '50%';
            copyNotification.style.left = '50%';
            copyNotification.style.transform = 'translate(-50%, -50%)';

            // Показываем уведомление
            copyNotification.style.visibility = "visible";
            copyNotification.style.opacity = "1";

            // Скрываем уведомление через 1 секунду
            setTimeout(() => {
                copyNotification.style.visibility = "hidden";
                copyNotification.style.transform = 'none';
                copyNotification.style.opacity = "0";
            }, 1500);

            exportModal.close();
        });
}

exportModal.querySelector('.modal-body').addEventListener('click', (e) => {
    const type = e.target.dataset.type;
    switch(type) {
        case "link":
            copyLinkWithNotification();
            break;
        case "css":
            downloadSCSSFile();
            break;
    }
});

exportBtn.addEventListener('click', () => {
    exportModal.showModal();
});

closeModalBtn.addEventListener('click', () => exportModal.close());

