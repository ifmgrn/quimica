import reactions from './reactions.js';
import molecules from './molecules.js';

const urlParams = new URLSearchParams(window.location.search);
const reaction = urlParams.get('reaction');

let modifyDOM = null;

if (reaction) {
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
        return `
            <h1>${reaction.nome}</h1>
            <div id="reaction-details-container">
                <ul>
                    <li>Tipo: ${reaction.tipo}</li>
                    <li>Reagente(s): ${reaction.reagentes.map(text => `${text} (${molecules[text]})`).join(", ")}</li>
                    <li>Produto(s): ${reaction.produtos.map(text => `${text} (${molecules[text]})`).join(", ")}</li>
                    <li>Equação balanceada: ${reaction.equacao}</li>
                </ul>
            </div>

            <h2>Demonstração</h2>
            <iframe width="560" height="315" src="${reaction.youtube_embed}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

            <h2>Instruções</h2>
            <div id="instructions-container">
                ${convertText(reaction.instrucoes)}
            </div>

            <p class="hyperlink-wrapper"><a href="index.html">Voltar para a página principal</a></p>
        `;
    }

    document.title = reaction;
    document.head.insertAdjacentHTML('beforeend',
        `<link 
            rel="preload" 
            href="resources/fonts/Limelight-Regular.woff2" 
            as="font" 
            type="font/woff2" 
            crossorigin="anonymous"
        >
        <link rel="stylesheet" href="styles/reaction-page.css">`
    );
    
    modifyDOM = () => document.getElementById('container').innerHTML = generatePageForReaction(reactions.find(r => r.nome === reaction));
}
else {
    document.head.insertAdjacentHTML('beforeend', 
        '<link rel="stylesheet" href="styles/index-page.css">'
    );

    function setupSubscripts() {
        document.getElementById('container').insertAdjacentHTML('beforeend', `
            <div id="subscripts-container"></div>
            <div class="search-input-container">
                <input id="search-input" type="search" placeholder="Filtrar...">
            </div>
        `);

        const subscripts = {'0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'};
        const subscripts_container = document.getElementById('subscripts-container');
        const input = document.getElementById('search-input');

        function insertTextAtCursor(input, text) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const value = input.value;

            input.value = value.substring(0, start) + text + value.substring(end);

            const newCursorPos = start + text.length;
            input.selectionStart = input.selectionEnd = newCursorPos;

            input.focus();
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        for (const char in subscripts) {
            const button = document.createElement('button');
            button.classList.add('subscript-button');
            button.textContent = char;
            
            button.addEventListener('click', () => {
                insertTextAtCursor(input, subscripts[char]);
            });
            
            subscripts_container.appendChild(button);
        }
    }

    function setupReactionsTable() {
        function generateHtmlTable(data, includeHead = true) {
            return `${includeHead ? '<table id="reactions-table">' : ''}
                <tr>
                    <th>Reação Química</th>
                    <th>Tipo</th>
                    <th>Reagente(s)</th>
                    <th>Produto(s)</th>
                    <th>Equação balanceada</th>
                </tr>
                ${data.reduce((accumulator, row) => {
                    return accumulator + `
                        <tr class="clickable-row" data-name="${row.nome}">
                            <td>${row.nome}</td>
                            <td>${row.tipo}</td>
                            <td>${row.reagentes.map(text => `${text} (${molecules[text]})`).join(", ")}</td>
                            <td>${row.produtos.map(text => `${text} (${molecules[text]})`).join(", ")}</td>
                            <td>${row.equacao}</td>
                        </tr>
                    `
                }, "")}
            ${includeHead ? '</table>' : ''}`;
        }

        const container = document.getElementById('container');
        container.insertAdjacentHTML('beforeend', generateHtmlTable(reactions));

        function updateTableListener() {
            document.querySelectorAll('.clickable-row').forEach(row => {
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    const name = row.getAttribute('data-name');
                    if (name) {
                        const url = new URL(window.location);
                        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                        url.pathname = basePath + 'index.html';
                        url.searchParams.set('reaction', name);
                        window.location.href = url;
                    }
                });
            });
        }
        updateTableListener();

        const input = document.getElementById('search-input');
        const table = document.getElementById('reactions-table');
        let typingTimer;

        const search = () => {
            const query = input.value.toLowerCase();
            if (query.length === 0) {
                table.innerHTML = generateHtmlTable(reactions, false);
                updateTableListener();
                return;
            }

            const results = [];

            const check = (name) => name.toLowerCase().includes(query);

            for (const reaction of reactions) {
                if (
                    check(reaction.nome)
                    || check(reaction.tipo)

                    || reaction.reagentes.some(value => check(value))
                    || reaction.reagentes.map(value => molecules[value]).some(value => check(value))

                    || reaction.produtos.some(value => check(value))
                    || reaction.produtos.map(value => molecules[value]).some(value => check(value))
                ) {
                    results.push(reaction);
                }
            }

            table.innerHTML = generateHtmlTable(results, false);
            updateTableListener();
        }

        input.addEventListener('input', () => {
            clearTimeout(typingTimer);

            typingTimer = setTimeout(search, 1000);
        });
    }

    modifyDOM = () => {
        setupSubscripts();
        setupReactionsTable();
    }
}

if (modifyDOM) {
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", modifyDOM);
    else 
        modifyDOM();
}