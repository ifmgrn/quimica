import molecules from './molecules.js';
import reactions from './reactions.js';

const SUBSCRIPTS_CONTAINER_ID = 'subscripts-container',
      SEARCH_INPUT_ID = 'search-input',
      SUBSCRIPT_BUTTON_CLASS = 'subscript-button',
      SUBSCRIPT_BUTTON_VISIBLE_CLASS = 'visible',
      TABLE_ID = 'reactions-table',
      CLICKABLE_ROW_CLASS = 'clickable-row';

let container = null,
    input = null,
    table = null;

function isDigit(str) {
    return str.length === 1 && str >= '0' && str <= '9';
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function insertTextAtCursor(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;

    input.value = value.substring(0, start) + text + value.substring(end);

    const newCursorPos = start + text.length;
    input.selectionStart = input.selectionEnd = newCursorPos;

    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function addSearchInput() {
    const subscripts = {'X₀': '₀', 'X₁': '₁', 'X₂': '₂', 'X₃': '₃', 'X₄': '₄', 'X₅': '₅', 'X₆': '₆', 'X₇': '₇', 'X₈': '₈', 'X₉': '₉'};

    container.insertAdjacentHTML('beforeend', 
        `<div id="search-container">
            <div id="${SUBSCRIPTS_CONTAINER_ID}">
                ${Object.keys(subscripts).reduce((accumulator, subscript) => {
                    return accumulator + 
                        `<button class="${SUBSCRIPT_BUTTON_CLASS}">${subscript}</button>`
                }, '')}
            </div>
            <div class="search-input-wrapper">
                <input id="${SEARCH_INPUT_ID}" type="search" placeholder="Filtrar...">
            </div>
        </div>`
    );

    const subscriptsContainer = document.getElementById(SUBSCRIPTS_CONTAINER_ID);
    input = document.getElementById(SEARCH_INPUT_ID);

    subscriptsContainer.addEventListener('click', (event) => {
        insertTextAtCursor(input, subscripts[event.target.textContent]);
    });

    input.addEventListener('focus', () => {
        subscriptsContainer.classList.add(SUBSCRIPT_BUTTON_VISIBLE_CLASS);
    });
    input.addEventListener('blur', (event) => {
        if (!event.relatedTarget || !event.relatedTarget.classList.contains(SUBSCRIPT_BUTTON_CLASS))
            subscriptsContainer.classList.remove(SUBSCRIPT_BUTTON_VISIBLE_CLASS);

        input.selectionStart = input.selectionEnd = input.value.length;
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            input.blur();
        }
        else if (event.altKey && isDigit(event.key)) {
            const numberToSubscriptMap = {'0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'};
            
            insertTextAtCursor(input, numberToSubscriptMap[event.key]);
            event.preventDefault();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (
            document.activeElement !== input 
            && !event.ctrlKey 
            && !event.metaKey 
            && (!event.altKey || isDigit(event.key))
            && !['Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)
        ) {
            input.focus();
            if (event.altKey && isDigit(event.key)) {
                input.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: event.key }));
                event.preventDefault();
            }
        }
    });
}

function generateHtmlTable(data) {
    return `<tr>
            <th>Reação Química</th>
            <th>Tipo</th>
            <th>Reagente(s)</th>
            <th>Produto(s)</th>
            <th>Equação balanceada</th>
        </tr>
        ${data.reduce((accumulator, row) => {
            return accumulator + `
                <tr class="${CLICKABLE_ROW_CLASS}" data-name="${row.nome}">
                    <td>${row.nome}</td>
                    <td>${row.tipo}</td>
                    <td>${row.reagentes.map(text => `${text} (${molecules[text]})`).join(", ")}</td>
                    <td>${row.produtos.map(text => `${text} (${molecules[text]})`).join(", ")}</td>
                    <td>${row.equacao}</td>
                </tr>
            `
        }, "")}`;
}

function search(query) {
    if (query === undefined)
        query = input.value;
    
    query = removeAccents(query).toLowerCase();

    if (query.length === 0) {
        table.innerHTML = generateHtmlTable(reactions);
        return;
    }
    
    const check = (name) => removeAccents(name).toLowerCase().includes(query);
    
    const results = [];
    for (const reaction of reactions) {
        if (
            check(reaction.nome)
            || check(reaction.tipo)

            || reaction.reagentes.some(value => check(value))
            || reaction.reagentes.map(value => molecules[value]).some(value => check(value))

            || reaction.produtos.some(value => check(value))
            || reaction.produtos.map(value => molecules[value]).some(value => check(value))
        )
            results.push(reaction);
    }

    table.innerHTML = generateHtmlTable(results);
}

function addReactionsTable() {
    container.insertAdjacentHTML('beforeend', 
        `<div class="table-wrapper">
            <table id="${TABLE_ID}"></table>
        </div>`
    );
    table = document.getElementById(TABLE_ID);

    let typingTimer = null;
    input.addEventListener('input', () => {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(search, 1000);
    });

    table.addEventListener('click', (event) => {
        let row = event.target.closest('.' + CLICKABLE_ROW_CLASS);
        if (!row) return;

        const name = row.getAttribute('data-name');
        if (!name) return;

        /* TODO: substituir o conteúdo da página sem precisar recarregá-la 
           Tome cuidado com o gerenciamento de memória quando for implementar isso
        */
        const url = new URL(window.location.href);
        url.searchParams.set('reacao', name);
        window.location.assign(url);
    });

    search();
}

export default function openHomepage() {
    container = document.getElementById('container');
    
    container.appendChild(document.createElement('h1')).textContent = document.title;
    addSearchInput();
    addReactionsTable();
}