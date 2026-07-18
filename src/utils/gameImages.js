// Banner images keyed by game name (as returned by the API) rather than
// database id — ids depend on seeding order and would silently mismatch
// if the backend were reseeded.
const gameImages = {
  'yu-gi-oh!':                   '/images/games/yugioh.jpg',
  'pokémon':                     '/images/games/pokemon.jpeg',
  'magic: the gathering':        '/images/games/magic.jpg',
  'one piece':                   '/images/games/onepiece.jpeg',
  'league of legends riftbound': '/images/games/riftbound.jpeg',
  'disney lorcana':              '/images/games/disney.jpg',
  'dragon ball super card game': '/images/games/dragonball.jpg',
  'star wars: unlimited':        '/images/games/starwars.webp',
  'final fantasy tcg':           '/images/games/fftcg.jpg',
  'flesh and blood':             '/images/games/flesh&blood.jpg',
  'digimon card game':           '/images/games/digimon.png',
  'gundam card game':            '/images/games/gundam.jpg',
  'altered':                     '/images/games/altered.jpg',
}

export function getGameImage(gameName) {
  return gameImages[gameName?.trim().toLowerCase()] ?? null
}
