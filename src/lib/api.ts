import type {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  EvolutionChain,
  AbilityDetail,
  TypeDetail,
  PokemonCardData,
} from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json() as Promise<T>;
}

export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
}

export async function getAllPokemonNames(): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${BASE_URL}/pokemon?limit=10000&offset=0`);
}

export async function getAllTypes(): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${BASE_URL}/type?limit=50`);
}

export async function getAllRegions(): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${BASE_URL}/region?limit=50`);
}

export async function getRegion(nameOrId: string | number): Promise<import('@/types/pokemon').RegionDetail> {
  return fetchJson<import('@/types/pokemon').RegionDetail>(`${BASE_URL}/region/${nameOrId}`);
}

export async function getGeneration(nameOrId: string | number): Promise<import('@/types/pokemon').GenerationDetail> {
  return fetchJson<import('@/types/pokemon').GenerationDetail>(`${BASE_URL}/generation/${nameOrId}`);
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  return fetchJson<Pokemon>(`${BASE_URL}/pokemon/${nameOrId}`);
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  return fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${nameOrId}`);
}

export async function getEvolutionChain(id: number): Promise<EvolutionChain> {
  return fetchJson<EvolutionChain>(`${BASE_URL}/evolution-chain/${id}`);
}

export async function getAbility(nameOrId: string | number): Promise<AbilityDetail> {
  return fetchJson<AbilityDetail>(`${BASE_URL}/ability/${nameOrId}`);
}

export async function getType(nameOrId: string | number): Promise<TypeDetail> {
  return fetchJson<TypeDetail>(`${BASE_URL}/type/${nameOrId}`);
}

export async function getMove(nameOrId: string | number): Promise<import('@/types/pokemon').MoveDetail> {
  return fetchJson<import('@/types/pokemon').MoveDetail>(`${BASE_URL}/move/${nameOrId}`);
}

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

export function getPokemonOfficialArtwork(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getPokemonOfficialArtworkShiny(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

export async function getPokemonCardData(
  limit = 20,
  offset = 0
): Promise<{ cards: PokemonCardData[]; total: number }> {
  const list = await getPokemonList(limit, offset);
  const cards = await Promise.all(
    list.results.map(async (item) => {
      const id = getPokemonIdFromUrl(item.url);
      try {
        const poke = await getPokemon(id);
        return {
          id: poke.id,
          name: poke.name,
          types: poke.types.map((t) => t.type.name),
          sprite:
            poke.sprites.other['official-artwork'].front_default ??
            poke.sprites.front_default,
        } satisfies PokemonCardData;
      } catch {
        return {
          id,
          name: item.name,
          types: [],
          sprite: getPokemonOfficialArtwork(id),
        } satisfies PokemonCardData;
      }
    })
  );
  return { cards, total: list.count };
}

export function formatStatName(stat: string): string {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };
  return map[stat] ?? stat;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

export function getEnglishFlavorText(species: PokemonSpecies): string {
  const entry = species.flavor_text_entries.find((e) => e.language.name === 'en');
  return entry?.flavor_text.replace(/\f|\n/g, ' ') ?? '';
}

export function getEvolutionChainId(species: PokemonSpecies): number {
  const url = species.evolution_chain.url;
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

export function flattenEvolutionChain(
  chain: EvolutionChain
): Array<{ name: string; id: number; minLevel: number | null }> {
  const results: Array<{ name: string; id: number; minLevel: number | null }> = [];
  function traverse(link: EvolutionChain['chain'], minLevel: number | null = null) {
    const url = link.species.url;
    const parts = url.split('/').filter(Boolean);
    const id = parseInt(parts[parts.length - 1], 10);
    results.push({ name: link.species.name, id, minLevel });
    for (const next of link.evolves_to) {
      const level = next.evolution_details[0]?.min_level ?? null;
      traverse(next, level);
    }
  }
  traverse(chain.chain);
  return results;
}

export async function getPokemonWeaknesses(types: string[]): Promise<Record<string, number>> {
  const multipliers: Record<string, number> = {};

  for (const typeName of types) {
    const typeDetail = await getType(typeName);

    for (const d of typeDetail.damage_relations.double_damage_from) {
      multipliers[d.name] = (multipliers[d.name] ?? 1) * 2;
    }
    for (const h of typeDetail.damage_relations.half_damage_from) {
      multipliers[h.name] = (multipliers[h.name] ?? 1) * 0.5;
    }
    for (const n of typeDetail.damage_relations.no_damage_from) {
      multipliers[n.name] = 0;
    }
  }

  const weaknesses: Record<string, number> = {};
  for (const [type, multiplier] of Object.entries(multipliers)) {
    if (multiplier > 1) {
      weaknesses[type] = multiplier;
    }
  }

  return weaknesses;
}

export async function getPokemonTypeEffectiveness(types: string[]): Promise<Record<string, number>> {
  const multipliers: Record<string, number> = {};

  // Initialize all types to 1
  const ALL_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  for (const t of ALL_TYPES) {
    multipliers[t] = 1;
  }

  for (const typeName of types) {
    const typeDetail = await getType(typeName);

    for (const d of typeDetail.damage_relations.double_damage_from) {
      multipliers[d.name] = multipliers[d.name] * 2;
    }
    for (const h of typeDetail.damage_relations.half_damage_from) {
      multipliers[h.name] = multipliers[h.name] * 0.5;
    }
    for (const n of typeDetail.damage_relations.no_damage_from) {
      multipliers[n.name] = 0;
    }
  }

  return multipliers;
}

export async function getPokemonTcgCards(query: string = '', page: number = 1, pageSize: number = 20) {
  let url = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}&orderBy=-set.releaseDate`;
  
  if (query) {
    const formattedQuery = query.replace(/-/g, ' ');
    url = `https://api.pokemontcg.io/v2/cards?q=name:"*${encodeURIComponent(formattedQuery)}*"&page=${page}&pageSize=${pageSize}&orderBy=-set.releaseDate`;
  }
  
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { data: [], totalCount: 0 };
    const data = await res.json();
    return { data: data.data || [], totalCount: data.totalCount || 0 };
  } catch (error) {
    console.error("Failed to fetch TCG cards:", error);
    return { data: [], totalCount: 0 };
  }
}
