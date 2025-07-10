import { convertText, interpolate, removeAccents, removeParentheses } from './common';
import molecules from './molecules';
import reactions from './reactions';
//@ts-ignore
import template from '../templates/reaction-page.html';

export default function openReaction(container: HTMLDivElement, name: string) {
    name = removeAccents(removeParentheses(name)).replaceAll('-', ' ').toLowerCase();
    
    const reaction = reactions.find(r => removeAccents(removeParentheses(r.nome)).toLowerCase() === name);

    if (!reaction)
        return window.location.assign('.');
    
    document.title = reaction.nome;

    const template_data = {
        ...reaction,
        'reagentes': reaction.reagentes.map(text => `${text} (${molecules[text]})`).join(", "),
        'produtos': reaction.produtos.map(text => `${text} (${molecules[text]})`).join(", "),
        'instrucoes': convertText(reaction.instrucoes)
    };

    container.insertAdjacentHTML('beforeend', 
        interpolate(template, template_data)
    );
}