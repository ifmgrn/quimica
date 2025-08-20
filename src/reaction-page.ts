import { convertTextToHTMLList, interpolate } from './common';
import { closeDB, getDB } from './indexed-db';
import template from '../templates/reaction-page.html?raw';

export default async function openReaction(container: HTMLElement, name: string) {
    const db = await getDB();

    const reaction = await db.get('reactions', name);

    if (!reaction)
        return window.location.assign('.');
    
    document.title = reaction.nome;

    const tx = db.transaction('molecules');

    async function formatMolecules(molecules: string[]) {
        const output = await Promise.all(molecules.map(async text => 
            `${text} (${await tx.store.get(text)})`
        ));
        return output.join(', ');
    }

    const template_data = {
        ...reaction,
        'reagentes': await formatMolecules(reaction.reagentes),
        'produtos': await formatMolecules(reaction.produtos),
        'instrucoes': convertTextToHTMLList(reaction.instrucoes)
    };

    container.insertAdjacentHTML('beforeend', 
        interpolate(template, template_data)
    );

    closeDB();
}