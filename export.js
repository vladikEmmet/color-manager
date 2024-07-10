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

function generateXML() {
    let xmlDoc = document.implementation.createDocument(null, "palette");
    const paletteElement = xmlDoc.documentElement;
    generateCSSInfo();

    for(const key in colorsInfo) {
        let color = colorsInfo[key];
        let colorElement = xmlDoc.createElement("color");
        colorElement.setAttribute("name", "${key}");
        colorElement.setAttribute("hex", color.hex.slice(1));
        colorElement.setAttribute("r", color.rgba[0]);
        colorElement.setAttribute("g", color.rgba[1]);
        colorElement.setAttribute("b", color.rgba[2]);

        paletteElement.appendChild(colorElement);
    }

    return xmlDoc;
}

function XMLToString(xml) {
    return new XMLSerializer().serializeToString(xml);
}

function XMLStringToBlob(string) {
    return new Blob([string], {type: 'text/xml'});
}

function downloadXMLFile(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'palette.xml';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}

function generateAndDownloadXML() {
    const xml = generateXML();
    const xmlString = XMLToString(xml);
    const blob = XMLStringToBlob(xmlString);
    downloadXMLFile(blob);
}

async function generatePdf() {
    try {
        // const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yCoord = 20;
        const xCoord = 20;
        generateCSSInfo();
        for(const clr in colorsInfo) {
            const color = colorsInfo[clr];
            doc.setFillColor(color.hex);
            doc.rect(xCoord, yCoord, 50, 20, 'F');

            if(chroma(color.hex).luminance() > 0.5) {
                doc.setTextColor(0, 0, 0);
            } else {
                doc.setTextColor(255, 255, 255);
            }
            doc.text(color.hex, xCoord + 25, yCoord + 10);
            yCoord += 30;
        }

        doc.save('palette.pdf');
    } catch (error) {
        console.error('Error loading jsPDF', error);
    }
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
        case "pdf":
            generatePdf();
            break;
        case "xml":
            generateAndDownloadXML();
            break;
        default:
            break;
    }
});

exportBtn.addEventListener('click', () => {
    exportModal.showModal();
});

closeModalBtn.addEventListener('click', () => exportModal.close());

