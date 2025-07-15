import molecules from './molecules';
import reactions from './reactions';
import { insertTextAtCursor, interpolate, isDigit, Reaction, REACTION_URL_PARAMETER, removeAccents, removeParentheses } from './common';
//@ts-ignore
import template from '../templates/home-page.html';

const subscripts: { [key: string]: string } = {'X₀': '₀', 'X₁': '₁', 'X₂': '₂', 'X₃': '₃', 'X₄': '₄', 'X₅': '₅', 'X₆': '₆', 'X₇': '₇', 'X₈': '₈', 'X₉': '₉'};

const reactions_table_columns: { [key: string]: keyof Reaction } = {
    'Reação Química': 'nome',
    'Tipo': 'tipo',
    'Reagente(s)': 'reagentes',
    'Produto(s)': 'produtos',
    'Equação': 'equacao'
};

const SUBSCRIPTS_CONTAINER_ID = 'subscripts-container',
      REACTIONS_SEARCH_INPUT_ID = 'search-input',
      SUBSCRIPT_BUTTON_CLASS = 'subscript-button',
      SUBSCRIPT_BUTTON_VISIBLE_CLASS = 'visible',
      REACTIONS_TABLE_ID = 'reactions-table',
      CLICKABLE_ROW_CLASS = 'clickable-row';

const SEARCH_URL_PARAMETER = 'pesquisa';

let container: HTMLElement,
    input: HTMLInputElement,
    table: HTMLTableElement;

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
        else if (event.altKey && isDigit(event.key)) {
            const numberToSubscriptMap: { [key: string]: string } = {'0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'};
            
            insertTextAtCursor(input, numberToSubscriptMap[event.key]);
            event.preventDefault();
        }
    });
    
    let typingTimer: number;
    input.addEventListener('input', () => {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            history.pushState(null, '', input.value ? `?${SEARCH_URL_PARAMETER}=${encodeURIComponent(input.value)}` : window.location.pathname);
            search();
        }, 1000);
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

function generateReactionsTable(data: Reaction[]) {
    const columns_order = Object.values(reactions_table_columns);
    return `<tr>
            ${Object.keys(reactions_table_columns).reduce((acc2, name) => acc2 + `<th>${name}</th>`, '')}
        </tr>
        ${data.reduce((accumulator, row) => {
            return accumulator + `
                <tr class="${CLICKABLE_ROW_CLASS}" data-name="${row.nome}">
                    ${columns_order.reduce((acc2, key) => {
                        return acc2 + 
                        "<td>" +
                            (key === 'reagentes' || key === 'produtos' 
                            ? row[key].map(text => `${text} (${molecules[text]})`).join(", ")
                            : row[key])
                        + "</td>"
                    }, '')}
                </tr>`
        }, '')}`;
}

function search(query?: string) {
    if (query === undefined)
        query = input.value;
    
    query = removeAccents(query).toLowerCase();

    if (query.length === 0) {
        table.innerHTML = generateReactionsTable(reactions);
        return;
    }
    
    const check = (name: string) => removeAccents(name).toLowerCase().includes(query);
    
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

    table.innerHTML = generateReactionsTable(results);
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
        window.location.assign(`${basePath}/?${REACTION_URL_PARAMETER}=${encodeURIComponent(removeParentheses(name).replaceAll(' ', '-').toLowerCase())}`);
    });
}

function onPopstate() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get(SEARCH_URL_PARAMETER);
    input.value = searchQuery ?? '';

    search();
}

export default function openHomepage(localContainer: HTMLElement) {
    container = localContainer;
    
    addSearchInput();
    addReactionsTable();

    onPopstate();
    window.addEventListener('popstate', onPopstate);
}