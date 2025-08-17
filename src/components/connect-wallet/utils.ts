export function getPP(address?: string): string {
    if (!address) {
      const randomId = Math.floor(Math.random() * 151) + 1
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${randomId}.png`
    }
    let hash = 0
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i-1)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const pokemonId = Math.abs(hash % 151)
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
  }