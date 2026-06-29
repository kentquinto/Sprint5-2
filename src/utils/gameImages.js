const gameImages = {
  1:  '/images/games/yugioh.jpg',
  2:  '/images/games/pokemon.jpeg',
  3:  '/images/games/magic.jpg',
  4:  '/images/games/onepiece.jpeg',
  5:  '/images/games/riftbound.jpeg',
  6:  '/images/games/disney.jpg',
  7:  '/images/games/dragonball.jpg',
  8:  '/images/games/starwars.webp',
  9:  '/images/games/fftcg.jpg',
  10: '/images/games/flesh&blood.jpg',
  11: '/images/games/digimon.png',
  12: '/images/games/gundam.jpg',
  13: '/images/games/altered.jpg',
}

export function getGameImage(gameId) {
  return gameImages[Number(gameId)] ?? null
}
