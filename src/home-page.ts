import { convertReactionNameToId, insertTextAtCursor, interpolate, isDigit, Reaction, REACTION_URL_PARAMETER, reactionsTableColumns } from './common';
import { getSomeReactions, getDB, searchReactionByPrefix } from './indexed-db';
import template from '../templates/home-page.html';

const subscripts: { [key: string]: string } = {'X₀': '₀', 'X₁': '₁', 'X₂': '₂', 'X₃': '₃', 'X₄': '₄', 'X₅': '₅', 'X₆': '₆', 'X₇': '₇', 'X₈': '₈', 'X₉': '₉'};

const SUBSCRIPTS_CONTAINER_ID = 'subscripts-container',
      REACTIONS_SEARCH_INPUT_ID = 'search-input',
      SUBSCRIPT_BUTTON_CLASS = 'subscript-button',
      SUBSCRIPT_BUTTON_VISIBLE_CLASS = 'visible',
      REACTIONS_TABLE_ID = 'reactions-table',
      CLICKABLE_ROW_CLASS = 'clickable-row';

const SEARCH_URL_PARAMETER = 'p';

let container: HTMLElement,
    input: HTMLInputElement,
    table: HTMLTableElement;

let lastInputValue: string;

function addSearchInput() {
    const template_data = {
        'titulo': document.title,
        'barra de numeros': SUBSCRIPTS_CONTAINER_ID,
        'pesquisa de reacoes': REACTIONS_SEARCH_INPUT_ID,
        'tabela de reacoes': REACTIONS_TABLE_ID
    };

    container.insertAdjacentHTML('beforeend', 
        interpolate(template, template_data)
    );

    const subscriptsContainer = document.getElementById(SUBSCRIPTS_CONTAINER_ID) as HTMLDivElement;
    for (const subscript of Object.keys(subscripts)) {
        const button = document.createElement('button');
        button.textContent = subscript;
        button.classList.add(SUBSCRIPT_BUTTON_CLASS);
        subscriptsContainer.appendChild(button);
    }

    input = document.getElementById(REACTIONS_SEARCH_INPUT_ID) as HTMLInputElement;

    subscriptsContainer.addEventListener('click', (event) => {
        insertTextAtCursor(input, subscripts[(event.target as HTMLButtonElement).textContent!]);
    });

    input.addEventListener('focus', () => {
        subscriptsContainer.classList.add(SUBSCRIPT_BUTTON_VISIBLE_CLASS);
    });
    input.addEventListener('blur', (event) => {
        if (!event.relatedTarget || !(event.relatedTarget as HTMLElement).classList.contains(SUBSCRIPT_BUTTON_CLASS))
            subscriptsContainer.classList.remove(SUBSCRIPT_BUTTON_VISIBLE_CLASS);

        input.selectionStart = input.selectionEnd = input.value.length;
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            input.blur();
        }
        else if (event.ctrlKey && isDigit(event.key)) {
            const numberToSubscriptMap: { [key: string]: string } = {'0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'};
            
            insertTextAtCursor(input, numberToSubscriptMap[event.key]);
            event.preventDefault();
        }
    });
    
    let typingTimer: number;
    input.addEventListener('input', () => {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(search, 1000);
    });

    document.addEventListener('keydown', (event) => {
        if (
            document.activeElement !== input 
            && !event.altKey 
            && !event.metaKey 
            && (!event.ctrlKey || isDigit(event.key))
            && !['Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)
        ) {
            input.focus();
            if (event.ctrlKey && isDigit(event.key)) {
                input.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: event.key }));
                event.preventDefault();
            }
        }
    });
}

async function generateReactionsTable(data: Reaction[]) {
    const columnsOrder = Object.values(reactionsTableColumns);

    const headers = Object.keys(reactionsTableColumns)
        .map(name => `<th>${name}</th>`)
        .join('');

    const tx = (await getDB()).transaction('molecules');
    async function generateRow(row: Reaction) {
        const cells = await Promise.all(columnsOrder.map(async (key) => {
            if (key === 'reagentes' || key === 'produtos') {
                const parts = await Promise.all(row[key].map(async text => 
                    `${text} (${await tx.store.get(text)})`
                ));
                return `<td>${parts.join(', ')}</td>`;
            }
            return `<td>${row[key]}</td>`;
        }));
        return `<tr class="${CLICKABLE_ROW_CLASS}" data-name="${row.nome}">${cells.join('')}</tr>`;
    }

    const rows = await Promise.all(data.map(generateRow));

    return `
        <tr>${headers}</tr>
        ${rows.join('')}
    `;
}

async function search(query?: string, addToHistory = true) {
    if (query === undefined)
        query = input.value;
    else
        input.value = query;
    
    if (lastInputValue === query)
        return;

    if (addToHistory)
        history.pushState(null, '', query ? `?${SEARCH_URL_PARAMETER}=${encodeURIComponent(query)}` : window.location.pathname);

    lastInputValue = query;

    if (query.length === 0) {
        table.innerHTML = await generateReactionsTable(await getSomeReactions());
        return;
    }
    
    table.innerHTML = await generateReactionsTable(await searchReactionByPrefix(query));
}

function addReactionsTable() {
    table = document.getElementById(REACTIONS_TABLE_ID) as HTMLTableElement;

    table.addEventListener('click', (event) => {
        if (!event.target) return;

        const row = (event.target as HTMLElement).closest('.' + CLICKABLE_ROW_CLASS);
        if (!row) return;

        const name = row.getAttribute('data-name');
        if (!name) return;

        /* TODO: substituir o conteúdo da página sem precisar recarregá-la 
           Tome cuidado com o gerenciamento de memória quando for implementar isso
        */
        const basePath = window.location.href.slice(0, window.location.href.lastIndexOf('/'));
        window.location.assign(`${basePath}/?${REACTION_URL_PARAMETER}=${encodeURIComponent(convertReactionNameToId(name))}`);
    });
}

function onPopstate() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get(SEARCH_URL_PARAMETER);
    search(searchQuery ?? '', false);
}

export default async function openHomepage(localContainer: HTMLElement) {
    container = localContainer;
    
    addSearchInput();
    addReactionsTable();
    
    onPopstate();
    window.addEventListener('popstate', onPopstate);
}