class BaseCardRenderer {
    constructor(card) {
        this.card = card;
    }

    get title() {
        let out = this.card.label;
        if (this.card.is_unique) {
            out = '[unique] ' + out;
        }
        return out;
    }

    get description() {
        const out = [];
        out.push(this.renderFaction());
        out.push(this.renderStats());
        out.push(this.renderTraits());
        out.push(this.renderText());
        out.push(this.renderFlavorText());
        out.push(this.renderPackAndCardCode());

        return out.filter((line) => {
            return !!line;
        }).join("\n");
    }

    renderFaction() {
        return `[${this.card.faction_code}] ${this.card.faction_name}.`;
    }

    renderStats() {
        let out = `**${this.card.type_name}.**`;
        return out;
    }

    renderTraits() {
        if (this.card.traits) {
            return `***${this.card.traits}***`;
        }
        return "";
    }

    renderText() {
        if (this.card.text) {
            return this.card.text.split("\n\n").map(line => { return "> " + line; }).join("\n> \n");
        }
        return "> ";
    }

    renderFlavorText() {
        if (this.card.flavor) {
            return `_${this.card.flavor}_`;
        }
        return "";
    }

    renderPackAndCardCode() {
        return `${this.card.pack_name} #${this.card.position}.`;
    }
}

class PlayDeckCardRenderer extends BaseCardRenderer {
    renderStats() {
        let out = super.renderStats();
        const cost = (null === this.card.cost) ? "-" : this.card.cost;
        out += ` Cost: ${cost}.`;
        return out;
    }

    renderFaction() {
        let out = super.renderFaction();
        out += this.card.is_loyal ? " Loyal." : " Non-Loyal.";
        return out;
    }

    renderText() {
        let out = super.renderText();
        if (3 !== this.card.deck_limit) {
            out += `\n> \n> Deck Limit: ${this.card.deck_limit}.`;
        }
        return out;
    }
 }

class CharacterRenderer extends PlayDeckCardRenderer {
    renderStats() {
        let out = super.renderStats();
        out += ` STR: ${this.card.strength}.`;
        if (this.card.is_military) {
            out += " [military]";
        }
        if (this.card.is_intrigue) {
            out += " [intrigue]";
        }
        if (this.card.is_power) {
            out += " [power]";
        }
        return out;
    }
 }


class AttachmentRenderer extends PlayDeckCardRenderer { }

class LocationRenderer extends PlayDeckCardRenderer { }

class EventRenderer extends PlayDeckCardRenderer { }

class PlotRenderer extends BaseCardRenderer {
    renderStats() {
        let out = super.renderStats();
        out += ` Income: ${this.card.income}. Initiative: ${this.card.initiative}. Claim: ${this.card.claim}. Reserve: ${this.card.reserve}. Plot deck limit: ${this.card.deck_limit}.`;
        return out;
    }
}

class AgendaRenderer extends BaseCardRenderer { }

class TitleRenderer extends BaseCardRenderer { }

function getRenderer(card) {
    switch (card.type_code) {
        case "character":
            return new CharacterRenderer(card);
        case "attachment":
            return new AttachmentRenderer(card);
        case "location":
            return new LocationRenderer(card);
        case "event":
            return new EventRenderer(card);
        case "plot":
            return new PlotRenderer(card);
        case "agenda":
            return new AgendaRenderer(card);
        case "title":
            return new TitleRenderer(card);
    }
    throw `Unsupported card type ${card.type_code}`;
}

module.exports = getRenderer;
