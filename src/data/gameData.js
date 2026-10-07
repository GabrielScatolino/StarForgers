// Dados estáticos do jogo. Tudo que é "conteúdo" fica aqui, para facilitar o balanceamento.
// Os ícones são nomes do Bootstrap Icons (https://icons.getbootstrap.com), sem o prefixo "bi-".

export const COST_GROWTH = 1.15
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60 // ganho offline máximo: 8 horas
export const PRESTIGE_MIN_RUN = 10_000_000 // mínimo coletado em um universo para poder renascer
export const GAME_VERSION = 2

// Cada planeta usa o mesmo "molde" de frota e melhorias, multiplicado pela escala do seu nível.
// Assim, planetas mais avançados custam mais, mas também rendem proporcionalmente mais.
const TIER_SCALE = 8
const GENERATOR_TEMPLATE = [
  { baseCost: 15, cps: 0.2 },
  { baseCost: 100, cps: 1 },
  { baseCost: 1100, cps: 8 },
]
const CLICK_TEMPLATE = [
  { cost: 100, bonus: 1 },
  { cost: 1000, bonus: 5 },
]
const UNLOCK_COSTS = [0, 2_000, 25_000, 300_000, 4_000_000, 50_000_000]

const PLANET_DEFS = [
  {
    id: 'pedrinha',
    name: 'Pedrinha-7',
    type: 'Asteroide rochoso',
    rarity: 'Comum',
    desc: 'Um asteroide simpático. Todo império começa em algum lugar.',
    glow: '#c8b08a',
    surface:
      'radial-gradient(circle at 62% 60%, rgba(0,0,0,.35) 0 9%, transparent 10%), radial-gradient(circle at 36% 70%, rgba(0,0,0,.3) 0 6%, transparent 7%), radial-gradient(circle at 70% 30%, rgba(0,0,0,.25) 0 5%, transparent 6%), radial-gradient(circle at 30% 28%, #c4b095, #6b5a49 55%, #2e2620)',
    generators: [
      { name: 'Drone Minerador', icon: 'robot', desc: 'Um robozinho que escava a rocha.' },
      { name: 'Perfuratriz Pesada', icon: 'tools', desc: 'Fura o asteroide de ponta a ponta.' },
      { name: 'Refinaria Orbital', icon: 'buildings', desc: 'Transforma pedra bruta em cristal.' },
    ],
    clickUpgrades: [
      { name: 'Broca Reforçada', icon: 'hammer' },
      { name: 'Laser de Plasma', icon: 'lightning-charge' },
    ],
  },
  {
    id: 'verdalia',
    name: 'Verdália',
    type: 'Mundo selvagem',
    rarity: 'Comum',
    desc: 'Planeta coberto de musgo luminoso e florestas gigantes.',
    glow: '#6bd98a',
    surface:
      'radial-gradient(ellipse at 58% 55%, rgba(0,70,30,.45) 0 22%, transparent 23%), radial-gradient(ellipse at 32% 38%, rgba(0,70,30,.35) 0 14%, transparent 15%), radial-gradient(circle at 30% 28%, #8bf09a, #2e8b57 55%, #0d3b26)',
    generators: [
      { name: 'Coletor de Esporos', icon: 'flower1', desc: 'Colhe esporos que brilham no escuro.' },
      { name: 'Estufa Hidropônica', icon: 'tree', desc: 'Cultiva cristais como se fossem plantas.' },
      { name: 'Biorreator', icon: 'virus2', desc: 'Organismos que digerem rocha e cospem cristal.' },
    ],
    clickUpgrades: [
      { name: 'Colhedeira Viva', icon: 'hand-index-thumb' },
      { name: 'Pulso Fotossintético', icon: 'sun' },
    ],
  },
  {
    id: 'glacius',
    name: 'Glacius',
    type: 'Mundo gelado',
    rarity: 'Incomum',
    desc: 'Gelo azul e ventos de 300 km/h.',
    glow: '#8fd3ff',
    surface:
      'linear-gradient(115deg, transparent 38%, rgba(255,255,255,.28) 44%, transparent 52%), radial-gradient(circle at 30% 28%, #e4f7ff, #6fb7e8 55%, #1d4f7a)',
    generators: [
      { name: 'Furadeira Térmica', icon: 'thermometer-snow', desc: 'Derrete o gelo para alcançar os cristais.' },
      { name: 'Cúpula de Cristal', icon: 'snow', desc: 'Estufa de mineração protegida da nevasca.' },
      { name: 'Reator Criogênico', icon: 'gear-wide-connected', desc: 'Energia limpa a 200 graus negativos.' },
    ],
    clickUpgrades: [
      { name: 'Broca de Diamante', icon: 'hammer' },
      { name: 'Laser Criogênico', icon: 'lightning-charge' },
    ],
  },
  {
    id: 'ignis',
    name: 'Ignis Prime',
    type: 'Mundo vulcânico',
    rarity: 'Incomum',
    desc: 'Vulcões ativos em toda a superfície.',
    glow: '#ff7a3d',
    surface:
      'radial-gradient(ellipse at 55% 60%, rgba(40,0,0,.5) 0 18%, transparent 19%), radial-gradient(ellipse at 30% 35%, rgba(255,210,80,.35) 0 10%, transparent 11%), radial-gradient(circle at 30% 28%, #ffb347, #d9411e 55%, #3b0d06)',
    generators: [
      { name: 'Sonda de Magma', icon: 'fire', desc: 'Mergulha nos vulcões e volta cheia de cristal.' },
      { name: 'Forja Geotérmica', icon: 'gear', desc: 'Usa o calor do planeta para refinar.' },
      { name: 'Siderúrgica Solar', icon: 'brightness-high-fill', desc: 'Espelhos gigantes derretem qualquer coisa.' },
    ],
    clickUpgrades: [
      { name: 'Pulso de Magma', icon: 'fire' },
      { name: 'Canhão de Plasma', icon: 'crosshair' },
    ],
  },
  {
    id: 'aquarion',
    name: 'Aquarion',
    type: 'Mundo oceânico',
    rarity: 'Raro',
    desc: 'Um oceano global, com criaturas curiosas.',
    glow: '#4fb3ff',
    surface:
      'radial-gradient(ellipse at 40% 45%, rgba(80,200,120,.55) 0 13%, transparent 14%), radial-gradient(ellipse at 68% 62%, rgba(80,200,120,.45) 0 9%, transparent 10%), radial-gradient(circle at 30% 28%, #86dcff, #1976d2 55%, #0a2a5e)',
    generators: [
      { name: 'Drone Submarino', icon: 'water', desc: 'Explora as fossas abissais.' },
      { name: 'Plataforma Oceânica', icon: 'tsunami', desc: 'Resiste às maiores marés do planeta.' },
      { name: 'Cidade Subaquática', icon: 'buildings-fill', desc: 'Milhares de mineradores sob as ondas.' },
    ],
    clickUpgrades: [
      { name: 'Sonar Ressonante', icon: 'broadcast-pin' },
      { name: 'Arpão de Energia', icon: 'bullseye' },
    ],
  },
  {
    id: 'saturnalia',
    name: 'Saturnália',
    type: 'Gigante anelado',
    rarity: 'Raro',
    ring: true,
    desc: 'Anéis feitos de cristal puro.',
    glow: '#f0c36a',
    surface:
      'repeating-linear-gradient(0deg, rgba(255,255,255,.1) 0 9px, rgba(0,0,0,.1) 9px 18px), radial-gradient(circle at 30% 28%, #f7dd9c, #c98f3f 55%, #5b3a14)',
    generators: [
      { name: 'Coletor de Anéis', icon: 'record-circle', desc: 'Recolhe fragmentos que orbitam o planeta.' },
      { name: 'Estação de Anel', icon: 'diagram-3', desc: 'Uma base construída dentro do anel.' },
      { name: 'Elevador Espacial', icon: 'rocket-takeoff', desc: 'Sobe toneladas de cristal por minuto.' },
    ],
    clickUpgrades: [
      { name: 'Raio Anelar', icon: 'bullseye' },
      { name: 'Pulso Quântico', icon: 'stars' },
    ],
  },
]

// Monta os planetas finais: aplica a escala do nível e cria os ids de frota e melhorias
export const PLANETS = PLANET_DEFS.map((def, tier) => {
  const scale = Math.pow(TIER_SCALE, tier)
  return {
    ...def,
    tier,
    clickBase: scale, // cristais por clique sem melhorias
    unlockCost: UNLOCK_COSTS[tier],
    generators: def.generators.map((g, i) => ({
      ...g,
      id: `${def.id}-g${i + 1}`,
      planetId: def.id,
      baseCost: Math.round(GENERATOR_TEMPLATE[i].baseCost * scale),
      cps: GENERATOR_TEMPLATE[i].cps * scale,
    })),
    clickUpgrades: def.clickUpgrades.map((u, i) => {
      const bonus = CLICK_TEMPLATE[i].bonus * scale
      return {
        ...u,
        id: `${def.id}-c${i + 1}`,
        planetId: def.id,
        cost: CLICK_TEMPLATE[i].cost * scale,
        bonus,
        desc: `+${bonus} cristais por clique neste planeta.`,
      }
    }),
  }
})

export const FIRST_PLANET_ID = PLANETS[0].id
export const GENERATORS = PLANETS.flatMap((p) => p.generators)
export const CLICK_UPGRADES = PLANETS.flatMap((p) => p.clickUpgrades)

export function getPlanet(id) {
  return PLANETS.find((p) => p.id === id) ?? PLANETS[0]
}

export const RARITY_COLORS = {
  Comum: 'secondary',
  Incomum: 'success',
  Raro: 'primary',
  Épico: 'info',
  Lendário: 'warning',
}

// Emblemas escolhíveis no cadastro do jogador (nomes de ícones)
export const EMBLEMS = [
  'rocket-takeoff',
  'robot',
  'stars',
  'moon-stars',
  'globe-americas',
  'lightning-charge',
  'fire',
  'star-fill',
]

export const RANKS = [
  { min: 0, title: 'Cadete' },
  { min: 1000, title: 'Explorador' },
  { min: 100_000, title: 'Capitão' },
  { min: 10_000_000, title: 'Almirante' },
  { min: 1_000_000_000, title: 'Lenda Galáctica' },
]
