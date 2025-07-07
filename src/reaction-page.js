import molecules from './molecules.js';
import reactions from './reactions.js';

function convertText(input) {
    const lines = input.split('\n');

    let html = '';
    const listStack = []; // Stack of {type: 'ul'|'ol', indent: number, openLi: boolean}

    // Close lists with indentation strictly greater than targetIndent
    function closeLists(targetIndent) {
        while (listStack.length > 0 && listStack[listStack.length - 1].indent > targetIndent) {
            const list = listStack.pop();
            // Close the last <li> if still open
            if (list.openLi) {
                html += '</li>';
                list.openLi = false;
            }
            html += list.type === 'ul' ? '</ul>' : '</ol>';
        }
    }

    lines.forEach(line => {
        if (!line.trim()) {
            closeLists(-1); // Close all lists on empty line
            return;
        }

        const indentMatch = line.match(/^(\t*)/);
        const indentLevel = indentMatch ? indentMatch[1].length : 0;

        const content = line.trim();

        const ulMatch = content.match(/^-\s+(.*)/);
        const olMatch = content.match(/^(\d+)\)\s?(.*)/);

        if (ulMatch) {
            const itemText = ulMatch[1];

            // Close lists deeper than current indent
            closeLists(indentLevel);

            // Check if we need to open a new ul
            if (
                listStack.length === 0 ||
                listStack[listStack.length - 1].indent < indentLevel ||
                listStack[listStack.length - 1].type !== 'ul'
            ) {
                // Before opening a new list, close the previous <li> if open at the current level
                if (listStack.length > 0) {
                    const currentList = listStack[listStack.length - 1];
                    if (currentList.openLi) {
                        html += '<ul>';
                        // We don't close the <li> here, because nested list goes inside it
                    } else {
                        html += '<ul>';
                    }
                } else {
                    html += '<ul>';
                }
                listStack.push({ type: 'ul', indent: indentLevel, openLi: false });
            } else {
                // Close previous <li> in the same list if open
                const currentList = listStack[listStack.length - 1];
                if (currentList.openLi) {
                    html += '</li>';
                    currentList.openLi = false;
                }
            }

            // Open new <li>
            html += `<li>${itemText}`;
            listStack[listStack.length - 1].openLi = true;
        }
        else if (olMatch) {
            const itemText = olMatch[2];

            // Close lists deeper than current indent
            closeLists(indentLevel);

            // Check if we need to open a new ol
            if (
                listStack.length === 0 ||
                listStack[listStack.length - 1].indent < indentLevel ||
                listStack[listStack.length - 1].type !== 'ol'
            ) {
                if (listStack.length > 0) {
                    const currentList = listStack[listStack.length - 1];
                    if (currentList.openLi) {
                        html += '<ol>';
                    } else {
                        html += '<ol>';
                    }
                } else {
                    html += '<ol>';
                }
                listStack.push({ type: 'ol', indent: indentLevel, openLi: false });
            } else {
                // Close previous <li> in the same list if open
                const currentList = listStack[listStack.length - 1];
                if (currentList.openLi) {
                    html += '</li>';
                    currentList.openLi = false;
                }
            }

            // Open new <li>
            html += `<li>${itemText}`;
            listStack[listStack.length - 1].openLi = true;
        }
        else {
            // Close all lists on normal text lines
            closeLists(-1);
            html += `<p>${content}</p>`;
        }
    });

    // Close any remaining open lists and <li>
    closeLists(-1);

    return html;
}

function generatePageForReaction(reaction) {
    return `<h1>${reaction.nome}</h1>
        <div id="reaction-details-container">
            <ul>
                <li>Tipo: ${reaction.tipo}</li>
                <li>Reagente(s): ${reaction.reagentes.map(text => `${text} (${molecules[text]})`).join(", ")}</li>
                <li>Produto(s): ${reaction.produtos.map(text => `${text} (${molecules[text]})`).join(", ")}</li>
                <li>Equação balanceada: ${reaction.equacao}</li>
            </ul>
        </div>

        <h2>Demonstração</h2>
        <div class="iframe-wrapper">
            <iframe src="${reaction.youtube_embed}" title="YouTube video player" frameborder="0" allow="encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>

        <h2>Instruções</h2>
        <div id="instructions-container">
            ${convertText(reaction.instrucoes)}
        </div>
        
        <p class="hyperlink-wrapper"><a href="${window.location.pathname}">Voltar para a página principal</a></p>`;
}

export default function openReaction(reaction) {
    document.title = reaction;

    document.getElementById('container').innerHTML = generatePageForReaction(reactions.find(r => r.nome === reaction));
}