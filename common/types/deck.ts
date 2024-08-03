import { CARDS } from "../cards";
import { LocalCardInstance, WithoutFunctions } from "./server-requests";

export type DeckIcon = {
  type: "energy" | "hermit" | "effect";
  icon: string;
  name?: string;
};

export type PlayerDeckT = {
  name: string;
  icon: string;
  secondaryIcon: string | null;
  cards: Array<LocalCardInstance>;
};

export type SavedDeckT = {
  name: string;
  icon: string;
  secondaryIcon: string | null;
  // This type is used to ensure saving and loading compatibility with older versions of hc-tcg
  cards: Array<{
    cardId: string;
    cardInstance: string;
  }>;
};

export function deckToSavedDeck(deck: PlayerDeckT): SavedDeckT {
  let name = deck.name;
  let icon = deck.icon;
  let secondaryIcon = deck.secondaryIcon;

  let cards = deck.cards.map((card) => {
    return { cardId: card.props.id, cardInstance: card.entity };
  });

  return {
    name,
    icon,
    secondaryIcon,
    cards,
  };
}

export function loadSavedDeck(deck: SavedDeckT | null): PlayerDeckT | null {
  if (!deck) return null;

  let name = deck.name;
  let icon = deck.icon;
  let secondaryIcon = deck.secondaryIcon;

  let cards = deck.cards
    .map((card) => {
      let cardInfo = CARDS[card.cardId];
      if (!cardInfo) return null;
      return {
        props: WithoutFunctions(cardInfo.props),
        entity: card.cardInstance,
      };
    })
    .filter((card) => card !== null) as Array<LocalCardInstance>;

  return {
    name,
    icon,
    secondaryIcon,
    cards,
  };
}
