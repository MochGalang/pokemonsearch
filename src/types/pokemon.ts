export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
      front_shiny: string | null;
    };
    home: {
      front_default: string | null;
    };
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
    };
    version_group: {
      name: string;
    };
  }>;
}

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: {
    name: string;
    url: string;
  };
}

export interface EvolutionChainLink {
  is_baby: boolean;
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
  evolution_details: Array<{
    min_level: number | null;
    trigger: { name: string };
    item: { name: string } | null;
    held_item: { name: string } | null;
  }>;
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  genera: Array<{
    genus: string;
    language: { name: string };
  }>;
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
    url: string;
  };
  is_legendary: boolean;
  is_mythical: boolean;
  color: { name: string };
}

export interface AbilityDetail {
  id: number;
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}

export interface TypeEffectiveness {
  double_damage_from: Array<{ name: string; url: string }>;
  double_damage_to: Array<{ name: string; url: string }>;
  half_damage_from: Array<{ name: string; url: string }>;
  half_damage_to: Array<{ name: string; url: string }>;
  no_damage_from: Array<{ name: string; url: string }>;
  no_damage_to: Array<{ name: string; url: string }>;
}

export interface TypeDetail {
  id: number;
  name: string;
  damage_relations: TypeEffectiveness;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
}

export interface PokemonCardData {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
}

export interface RegionDetail {
  id: number;
  name: string;
  main_generation: {
    name: string;
    url: string;
  } | null;
}

export interface GenerationDetail {
  id: number;
  name: string;
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
}

export interface MoveDetail {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: {
    name: string;
  };
  damage_class: {
    name: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}
