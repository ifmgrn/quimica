import { convertText, interpolate } from './common';
import molecules from './molecules';
import reactions from './reactions';
//@ts-ignore
import template from '../templates/reaction-page.html';

export default function openReaction(container: HTMLDivElement, name: string) {
    document.title = name;

    const reaction = reactions.find(r => r.nome === name)!;
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