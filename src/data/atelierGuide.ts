/**
 * Educational pairing guide for the Atelier.
 * Each recommendation includes a concrete “why” so users learn how finishes relate.
 */
import {
  floorOptions,
  metalOptions,
  moodOptions,
  upholsteryOptions,
  wallOptions,
  type FloorFinish,
  type LightingMood,
  type MetalFinish,
  type RoomFinishes,
  type Upholstery,
  type WallFinish,
} from './configurator'

export type FinishCategory = 'floor' | 'wall' | 'upholstery' | 'metal' | 'mood'

export interface PairRef<T extends string = string> {
  id: T
  why: string
}

export interface FinishLesson {
  lesson: string
  pairs: Partial<{
    floor: PairRef<FloorFinish>[]
    wall: PairRef<WallFinish>[]
    upholstery: PairRef<Upholstery>[]
    metal: PairRef<MetalFinish>[]
    mood: PairRef<LightingMood>[]
  }>
  caution?: string
}

export interface PairSuggestion {
  category: FinishCategory
  categoryLabel: string
  id: string
  label: string
  reason: string
  swatch?: string
  /** Already present in the current palette */
  active: boolean
}

export interface PaletteGuidance {
  focus: FinishCategory
  title: string
  lesson: string
  suggestions: PairSuggestion[]
  tension?: string
  reading: string
}

const p = <T extends string>(id: T, why: string): PairRef<T> => ({ id, why })

const floorLessons: Record<FloorFinish, FinishLesson> = {
  calacatta: {
    lesson: 'A pale stone floor reflects light and asks the room to stay quiet above it — let timber or soft plaster carry the warmth.',
    pairs: {
      wall: [
        p('walnut-slats', 'Fluted walnut adds warmth and rhythm against cool marble without competing for brightness.'),
        p('limewash', 'Mineral plaster keeps the whole envelope soft so the veining can stay the quiet detail.'),
      ],
      upholstery: [
        p('boucle', 'Ivory bouclé echoes the floor’s lightness and softens hard stone edges.'),
        p('cognac', 'Cognac leather introduces a single warm accent so the marble doesn’t feel clinical.'),
      ],
      metal: [
        p('brass', 'Brushed brass returns warmth that pale stone removes.'),
        p('nickel', 'Nickel stays honest with marble under daylight — cooler and precise.'),
      ],
      mood: [
        p('daylight', 'High sun shows the veining clearly and proves the palette isn’t muddy.'),
        p('evening', 'Low sun warms the marble so it feels lived-in rather than gallery-like.'),
      ],
    },
  },
  travertine: {
    lesson: 'Travertine is warm and porous in character. Pair it with timber or soft textiles so the floor doesn’t feel alone in its sand tone.',
    pairs: {
      wall: [
        p('oak-slats', 'Oak slats continue the warm mineral story with vertical grain instead of more stone.'),
        p('limewash', 'Limewash keeps the walls as quiet sand so travertine isn’t fighting another strong texture.'),
      ],
      upholstery: [
        p('linen', 'Sand linen sits in the same family — relaxed, matte, no shine competition.'),
        p('moss', 'Moss velvet adds a cool green counterpoint so the sand tones don’t flatten.'),
      ],
      metal: [
        p('bronze', 'Bronze deepens the sand palette without the brightness of polished brass.'),
        p('brass', 'Brass lifts the warmth if the room starts to feel too earthy.'),
      ],
      mood: [p('evening', 'Golden evening flatters travertine’s pores and makes the floor feel softer.')],
    },
  },
  limestone: {
    lesson: 'Limestone is quieter than marble — a mineral ground that lets upholstery and metal become the accent.',
    pairs: {
      wall: [
        p('walnut-slats', 'Dark fluting against pale limestone gives clear figure–ground contrast.'),
        p('plaster', 'Warm plaster keeps the envelope calm so seating and metal can speak.'),
      ],
      upholstery: [
        p('charcoal', 'Charcoal wool reads crisp on limestone — modern without going cold.'),
        p('linen', 'Linen keeps the whole room soft and coastal rather than stark.'),
      ],
      metal: [
        p('nickel', 'Cool nickel matches limestone’s quiet mineral character.'),
        p('steel', 'Blackened steel sharpens a pale floor without adding warmth you may not want.'),
      ],
      mood: [p('daylight', 'Daylight is when limestone looks most honest — no orange cast needed.')],
    },
  },
  nero: {
    lesson: 'Black marble is a strong ground. Balance it with a lighter wall or a warm textile so the room doesn’t sink.',
    pairs: {
      wall: [
        p('plaster', 'Light plaster stops the black floor from swallowing the volume.'),
        p('limewash', 'A pale mineral wall keeps depth while the floor stays the dark plane.'),
      ],
      upholstery: [
        p('boucle', 'Ivory seating floats above Nero and gives the eye a resting place.'),
        p('cognac', 'Cognac leather warms the black stone so it feels luxurious, not severe.'),
      ],
      metal: [
        p('brass', 'Brass against Nero is a classic high-contrast pairing — warmth on darkness.'),
        p('copper', 'Copper softens black marble with a quieter glow than bright brass.'),
      ],
      mood: [
        p('evening', 'Evening light turns Nero atmospheric instead of absolute.'),
        p('night', 'Lamp light pools on black stone and makes the room feel intimate.'),
      ],
    },
    caution: 'Nero underfoot plus a dark wall and dark upholstery usually feels closed — keep at least one plane light.',
  },
  oak: {
    lesson: 'Natural oak is forgiving. It likes mineral walls and fabrics that are either cream or mossy green — not competing mid-browns.',
    pairs: {
      wall: [
        p('limewash', 'Limewash lets oak be the warmest surface without another timber fighting it.'),
        p('travertine', 'Stone beside oak is a classic indoor–outdoor pairing — grain against mineral.'),
      ],
      upholstery: [
        p('boucle', 'Cream bouclé keeps oak looking fresh rather than cabin-like.'),
        p('moss', 'Moss velvet adds colour that oak can support without clashing.'),
      ],
      metal: [
        p('brass', 'Brass and oak are a natural warm family.'),
        p('bronze', 'Bronze sits slightly darker — good if oak already feels light.'),
      ],
      mood: [p('daylight', 'Daylight shows oak grain honestly; evening works too if metals stay warm.')],
    },
  },
  'smoked-oak': {
    lesson: 'Smoked oak is cooler and deeper than natural oak. Warm metals and soft plaster keep it from reading as grey.',
    pairs: {
      wall: [
        p('plaster', 'Warm plaster counters the cool cast of smoked timber.'),
        p('limewash', 'Soft mineral walls keep smoked oak from feeling heavy.'),
      ],
      upholstery: [
        p('linen', 'Sand linen bridges cool timber and warm skin tones in the room.'),
        p('cognac', 'Cognac leather reintroduces heat that smoking removes from the wood.'),
      ],
      metal: [
        p('brass', 'Brass pulls smoked oak back toward warmth.'),
        p('copper', 'Copper’s colour sits well against fumed grain.'),
      ],
      mood: [p('evening', 'Evening light is kinder to smoked oak than hard white daylight.')],
    },
  },
  walnut: {
    lesson: 'Walnut floors are rich; let walls stay pale or fluted in a lighter timber, and choose upholstery that either echoes the warmth or clearly contrasts.',
    pairs: {
      wall: [
        p('limewash', 'Pale limewash stops walnut from turning the whole room brown.'),
        p('oak-slats', 'Lighter oak slats echo timber without matching walnut’s depth.'),
      ],
      upholstery: [
        p('boucle', 'Ivory seating lifts a walnut floor and keeps the lounge airy.'),
        p('ink', 'Ink velvet contrasts walnut’s warmth with a cool deep tone.'),
      ],
      metal: [
        p('brass', 'Brass flatters walnut’s red-brown undertone.'),
        p('bronze', 'Bronze is quieter — use it when walnut is already loud enough.'),
      ],
      mood: [p('evening', 'Evening light deepens walnut without making it muddy.')],
    },
  },
}

const wallLessons: Record<WallFinish, FinishLesson> = {
  'walnut-slats': {
    lesson: 'Fluted walnut adds rhythm and absorbs sound. It wants a quieter floor — stone or pale timber — so the wall can be the statement.',
    pairs: {
      floor: [
        p('calacatta', 'Pale marble lets the fluting read as the main texture.'),
        p('limestone', 'Quiet stone keeps value contrast clear against dark slats.'),
      ],
      upholstery: [
        p('boucle', 'Soft ivory seating balances the graphic rhythm of the wall.'),
        p('charcoal', 'Charcoal wool echoes the wall’s seriousness without matching the grain.'),
      ],
      metal: [
        p('brass', 'Brass catches in the flutes and warms the timber.'),
        p('bronze', 'Bronze stays closer to walnut’s depth for a quieter hardware language.'),
      ],
      mood: [p('evening', 'Raking evening light makes the flutes visible and dimensional.')],
    },
  },
  'oak-slats': {
    lesson: 'Oak slats are lighter than walnut. They pair cleanly with warm stone floors and either cream or moss textiles.',
    pairs: {
      floor: [
        p('travertine', 'Warm stone and oak slats share a sand family without looking identical.'),
        p('walnut', 'A darker walnut floor grounds lighter oak walls — reverse of the usual hierarchy.'),
      ],
      upholstery: [
        p('linen', 'Linen keeps the oak wall feeling relaxed and residential.'),
        p('moss', 'Moss velvet adds a colour that oak can host without clashing.'),
      ],
      metal: [
        p('brass', 'Brass and oak are a natural pairing.'),
        p('nickel', 'Nickel cools oak slightly for a more contemporary read.'),
      ],
      mood: [p('daylight', 'Daylight keeps oak slats from reading too yellow.')],
    },
  },
  travertine: {
    lesson: 'A full travertine wall is geological and strong. Soften it with timber underfoot or deep upholstery so the room isn’t all mineral.',
    pairs: {
      floor: [
        p('oak', 'Timber underfoot softens a stone wall and adds grain variety.'),
        p('walnut', 'Walnut deepens the base so the travertine wall can stay the light plane.'),
      ],
      upholstery: [
        p('cognac', 'Leather brings sheen and heat against matte stone.'),
        p('charcoal', 'Charcoal wool grounds a large travertine field.'),
      ],
      metal: [
        p('bronze', 'Bronze sits in the same warm-mineral family as travertine.'),
        p('steel', 'Steel cuts the sand tones if the wall starts to feel soft.'),
      ],
      mood: [p('evening', 'Evening light softens travertine’s pores and reduces glare.')],
    },
  },
  limewash: {
    lesson: 'Limewash is absorbent and calm. Almost every timber and stone can sit beside it — use metal and textile for character.',
    pairs: {
      floor: [
        p('oak', 'Oak on limewash is a classic calm residential pairing.'),
        p('calacatta', 'Marble and limewash stay mineral but vary polish and pattern.'),
      ],
      upholstery: [
        p('linen', 'Linen and limewash share a matte, soft character.'),
        p('moss', 'Moss velvet is the easiest colour accent against limewash.'),
      ],
      metal: [
        p('brass', 'Brass is the default warm accent on limewash.'),
        p('copper', 'Copper is a softer, more coloured alternative to brass.'),
      ],
      mood: [p('daylight', 'Daylight shows limewash’s trowel variation honestly.')],
    },
  },
  plaster: {
    lesson: 'Warm plaster is a neutral canvas. Choose one hero — a dark floor, a bold textile, or a warm metal — not all three at once.',
    pairs: {
      floor: [
        p('nero', 'Black stone against plaster is a clear, architectural contrast.'),
        p('walnut', 'Walnut floors warm plaster without needing more texture on the wall.'),
      ],
      upholstery: [
        p('ink', 'Ink velvet becomes the colour statement on a quiet plaster field.'),
        p('cognac', 'Cognac leather adds heat while plaster stays neutral.'),
      ],
      metal: [
        p('brass', 'Brass accents read cleanly on plaster.'),
        p('steel', 'Steel keeps a plaster room more contemporary than brass would.'),
      ],
      mood: [p('evening', 'Evening lamps make plaster feel intimate rather than blank.')],
    },
  },
  nero: {
    lesson: 'A black stone wall is dramatic. Keep the floor lighter and the seating tactile so the darkness has somewhere soft to land.',
    pairs: {
      floor: [
        p('calacatta', 'Pale marble floor against Nero wall creates strong vertical contrast.'),
        p('oak', 'Oak softens a black wall and stops the room from feeling like a gallery.'),
      ],
      upholstery: [
        p('boucle', 'Ivory seating is the safest soft landing against a Nero wall.'),
        p('cognac', 'Cognac leather warms black stone without needing another pale plane.'),
      ],
      metal: [
        p('brass', 'Brass on Nero is high contrast and intentional.'),
        p('nickel', 'Nickel is quieter — use it if brass feels too decorative.'),
      ],
      mood: [p('night', 'Night lighting lets Nero read as depth rather than void.')],
    },
    caution: 'Nero wall with Nero floor tends to flatten depth — vary value between planes.',
  },
}

const upholsteryLessons: Record<Upholstery, FinishLesson> = {
  boucle: {
    lesson: 'Ivory bouclé softens hard architecture. It is the easiest companion for dark stone and fluted timber.',
    pairs: {
      floor: [
        p('nero', 'Bouclé floats above black marble — classic light-on-dark seating.'),
        p('walnut', 'Cream textile lifts a rich walnut floor.'),
      ],
      wall: [
        p('walnut-slats', 'Soft seating against fluted timber balances graphic with tactile.'),
        p('nero', 'Ivory bouclé is what makes a Nero wall livable.'),
      ],
      metal: [
        p('brass', 'Brass legs or lamps warm cream bouclé without darkening it.'),
        p('nickel', 'Nickel keeps bouclé feeling contemporary rather than traditional.'),
      ],
      mood: [p('daylight', 'Daylight shows bouclé’s loop texture; evening still works.')],
    },
  },
  linen: {
    lesson: 'Sand linen is relaxed and matte. It loves mineral floors and doesn’t fight warm metals.',
    pairs: {
      floor: [
        p('travertine', 'Linen and travertine share a soft sand family.'),
        p('limestone', 'Quiet stone under linen keeps the room calm.'),
      ],
      wall: [
        p('limewash', 'Two matte mineral/textile surfaces — very forgiving.'),
        p('oak-slats', 'Oak rhythm beside linen feels residential and warm.'),
      ],
      metal: [
        p('brass', 'Brass is the natural accent for sand linen.'),
        p('bronze', 'Bronze deepens linen without glare.'),
      ],
      mood: [p('evening', 'Evening light makes linen look warmer and less flat.')],
    },
  },
  cognac: {
    lesson: 'Cognac leather brings heat and sheen. Pair it with cooler grounds — limestone, smoked oak, plaster — so it doesn’t muddy.',
    pairs: {
      floor: [
        p('limestone', 'Cool mineral floor stops cognac from looking brown-on-brown.'),
        p('smoked-oak', 'Smoked oak’s cooler cast lets cognac be the warm accent.'),
      ],
      wall: [
        p('plaster', 'Neutral plaster lets leather be the colour.'),
        p('limewash', 'Soft walls keep cognac from feeling heavy.'),
      ],
      metal: [
        p('brass', 'Brass and cognac are a warm pair — intentional, not accidental.'),
        p('copper', 'Copper echoes leather’s orange undertone more softly than brass.'),
      ],
      mood: [p('evening', 'Evening light loves leather’s sheen and depth.')],
    },
  },
  moss: {
    lesson: 'Moss velvet is a quiet colour note. It settles especially well against oak and limewash, under warmer evening light.',
    pairs: {
      floor: [
        p('oak', 'Oak and moss are a natural indoor–garden pairing.'),
        p('travertine', 'Sand stone lets green velvet feel grounded, not decorative.'),
      ],
      wall: [
        p('limewash', 'Pale limewash makes moss read as colour, not camouflage.'),
        p('oak-slats', 'Timber rhythm beside moss velvet feels layered and calm.'),
      ],
      metal: [
        p('brass', 'Brass warms green velvet.'),
        p('bronze', 'Bronze is quieter and keeps moss from looking costume-like.'),
      ],
      mood: [p('evening', 'Evening light deepens moss without greying it out.')],
    },
  },
  charcoal: {
    lesson: 'Charcoal wool is modern and absorbent. Give it a pale floor or wall so the silhouette of the seating stays clear.',
    pairs: {
      floor: [
        p('calacatta', 'Pale marble outlines charcoal seating clearly.'),
        p('limestone', 'Quiet stone keeps charcoal modern, not gloomy.'),
      ],
      wall: [
        p('plaster', 'Light plaster is the safest backdrop for charcoal.'),
        p('limewash', 'Soft mineral walls prevent a dark sofa from floating in void.'),
      ],
      metal: [
        p('nickel', 'Cool nickel matches charcoal’s contemporary mood.'),
        p('steel', 'Blackened steel and charcoal wool share a precise, quiet language.'),
      ],
      mood: [p('daylight', 'Daylight keeps charcoal from reading as a black hole.')],
    },
  },
  ink: {
    lesson: 'Ink velvet deepens the room. It needs a warm metal or timber somewhere nearby, or night lighting, to avoid feeling cold.',
    pairs: {
      floor: [
        p('oak', 'Warm oak under ink velvet stops the seating from feeling cold.'),
        p('calacatta', 'Pale stone contrasts ink and keeps volume readable.'),
      ],
      wall: [
        p('walnut-slats', 'Timber warmth beside ink velvet balances cool textile with grain.'),
        p('plaster', 'Quiet plaster lets ink be the depth without another dark plane.'),
      ],
      metal: [
        p('brass', 'Brass is the antidote to ink’s coolness.'),
        p('copper', 'Copper adds colour that ink can host.'),
      ],
      mood: [p('night', 'Night lamps make ink velvet feel intentional and intimate.')],
    },
  },
}

const metalLessons: Record<MetalFinish, FinishLesson> = {
  brass: {
    lesson: 'Brass is the warmest accent — it flatters timber, marble, and almost every textile in this study set.',
    pairs: {
      floor: [p('calacatta', 'Brass returns warmth that pale marble removes.'), p('walnut', 'Brass and walnut share warm undertones.')],
      wall: [p('walnut-slats', 'Brass catches in fluting and warms timber.'), p('limewash', 'Brass accents read cleanly on soft plaster.')],
      upholstery: [p('boucle', 'Brass + ivory is light and hospitable.'), p('cognac', 'Brass deepens cognac leather’s heat.')],
      mood: [p('evening', 'Evening light makes brass glow without glare.')],
    },
  },
  bronze: {
    lesson: 'Bronze is quieter than brass and slightly darker. It suits travertine, walnut, and cognac leather.',
    pairs: {
      floor: [p('travertine', 'Bronze sits in travertine’s warm-mineral family.'), p('walnut', 'Bronze deepens walnut without sparkle.')],
      wall: [p('travertine', 'Matched mineral warmth — stone wall, bronze detail.'), p('walnut-slats', 'Bronze hardware on walnut slats stays quiet.')],
      upholstery: [p('cognac', 'Bronze and cognac are a low-shine warm pair.'), p('linen', 'Bronze grounds sand linen.')],
      mood: [p('evening', 'Bronze looks richest when the sun is low.')],
    },
  },
  copper: {
    lesson: 'Copper is the most colourful metal here. Use it sparingly against plaster or smoked oak so it reads as intentional.',
    pairs: {
      floor: [p('smoked-oak', 'Copper warms fumed timber that can otherwise read grey.'), p('limestone', 'Quiet stone lets copper be the accent.')],
      wall: [p('plaster', 'Neutral plaster is the safest field for copper.'), p('limewash', 'Soft walls keep copper from looking decorative.')],
      upholstery: [p('linen', 'Sand linen hosts copper calmly.'), p('ink', 'Copper’s warmth counters ink velvet’s coolness.')],
      mood: [p('evening', 'Evening light flatters copper’s colour shift.')],
    },
  },
  nickel: {
    lesson: 'Nickel cools the palette. It works when stone is pale and textiles are either cream or charcoal — less so with heavy walnut.',
    pairs: {
      floor: [p('calacatta', 'Nickel and pale marble share a cool, precise character.'), p('limestone', 'Quiet stone + nickel feels contemporary.')],
      wall: [p('plaster', 'Nickel on plaster stays architectural.'), p('limewash', 'Soft walls prevent nickel from feeling clinical.')],
      upholstery: [p('boucle', 'Cream bouclé softens cool nickel.'), p('charcoal', 'Charcoal + nickel is a clear modern pair.')],
      mood: [p('daylight', 'Daylight keeps nickel looking satin, not cold fluorescent.')],
    },
  },
  steel: {
    lesson: 'Blackened steel sharpens edges. Pair it with soft textiles and one warm plane so the room doesn’t feel industrial.',
    pairs: {
      floor: [p('oak', 'Warm oak prevents steel from tipping industrial.'), p('limestone', 'Pale stone + steel is crisp and calm.')],
      wall: [p('plaster', 'Plaster softens steel’s severity.'), p('limewash', 'Mineral softness against hard metal.')],
      upholstery: [p('boucle', 'Soft seating is required when metals go dark.'), p('linen', 'Linen keeps steel residential.')],
      mood: [p('daylight', 'Daylight shows steel honestly; night works if lamps are warm.')],
    },
  },
}

const moodLessons: Record<LightingMood, FinishLesson> = {
  daylight: {
    lesson: 'Daylight reveals true colour and texture. Cool metals and pale stones look most honest under it; deep velvets can go flat.',
    pairs: {
      floor: [p('calacatta', 'Marble veining reads clearly in high sun.'), p('limestone', 'Limestone’s quiet grain is most legible by day.')],
      wall: [p('limewash', 'Trowel marks show best in daylight.'), p('oak-slats', 'Oak colour stays honest without evening orange.')],
      upholstery: [p('boucle', 'Loop texture needs light to read.'), p('charcoal', 'Daylight keeps charcoal from collapsing to black.')],
      metal: [p('nickel', 'Nickel looks intentional in daylight.'), p('brass', 'Brass still works by day if the rest of the room is warm.')],
    },
  },
  evening: {
    lesson: 'Golden evening is forgiving. Warm metals, timber, and cognac leather gain depth; black stone becomes atmospheric rather than severe.',
    pairs: {
      floor: [p('walnut', 'Evening deepens walnut beautifully.'), p('nero', 'Black stone becomes mood, not void.')],
      wall: [p('walnut-slats', 'Raking light reveals the flutes.'), p('travertine', 'Warm stone glows at low sun.')],
      upholstery: [p('cognac', 'Leather sheen loves evening.'), p('moss', 'Green velvet deepens without greying.')],
      metal: [p('brass', 'Brass glows in golden hour.'), p('bronze', 'Bronze looks richest now.')],
    },
  },
  night: {
    lesson: 'Night light is lamp-led. Deep textiles and dark metals settle; pale stone floors help the room keep a sense of volume.',
    pairs: {
      floor: [p('calacatta', 'Pale floors keep night rooms from disappearing.'), p('oak', 'Warm timber holds volume under lamps.')],
      wall: [p('walnut-slats', 'Timber walls feel intimate at night.'), p('nero', 'Dark walls work when lamps define pools of light.')],
      upholstery: [p('ink', 'Ink velvet feels intentional under lamps.'), p('cognac', 'Leather reflects lamp light softly.')],
      metal: [p('brass', 'Brass catches lamp light as small highlights.'), p('steel', 'Steel stays quiet — good if lamps are already warm.')],
    },
  },
}

const labelMaps = {
  floor: Object.fromEntries(floorOptions.map((o) => [o.id, o.label])) as Record<FloorFinish, string>,
  wall: Object.fromEntries(wallOptions.map((o) => [o.id, o.label])) as Record<WallFinish, string>,
  upholstery: Object.fromEntries(upholsteryOptions.map((o) => [o.id, o.label])) as Record<Upholstery, string>,
  metal: Object.fromEntries(metalOptions.map((o) => [o.id, o.label])) as Record<MetalFinish, string>,
  mood: Object.fromEntries(moodOptions.map((o) => [o.id, o.label])) as Record<LightingMood, string>,
}

const swatchMaps = {
  floor: Object.fromEntries(floorOptions.map((o) => [o.id, o.swatch])) as Record<string, string>,
  wall: Object.fromEntries(wallOptions.map((o) => [o.id, o.swatch])) as Record<string, string>,
  upholstery: Object.fromEntries(upholsteryOptions.map((o) => [o.id, o.swatch])) as Record<string, string>,
  metal: Object.fromEntries(metalOptions.map((o) => [o.id, o.swatch])) as Record<string, string>,
  mood: {} as Record<string, string>,
}

export const categoryLabel: Record<FinishCategory, string> = {
  floor: 'Floor',
  wall: 'Feature wall',
  upholstery: 'Upholstery',
  metal: 'Metalwork',
  mood: 'Light',
}

function lessonFor(category: FinishCategory, finishes: RoomFinishes, mood: LightingMood): FinishLesson {
  switch (category) {
    case 'floor':
      return floorLessons[finishes.floor]
    case 'wall':
      return wallLessons[finishes.wall]
    case 'upholstery':
      return upholsteryLessons[finishes.upholstery]
    case 'metal':
      return metalLessons[finishes.metal]
    case 'mood':
      return moodLessons[mood]
  }
}

function focusId(category: FinishCategory, finishes: RoomFinishes, mood: LightingMood) {
  if (category === 'mood') return mood
  return finishes[category]
}

function isActive(category: FinishCategory, id: string, finishes: RoomFinishes, mood: LightingMood) {
  if (category === 'mood') return mood === id
  return finishes[category] === id
}

/** Build educational guidance for the active focus finish — one clear pick per category with a why. */
export function getPaletteGuidance(finishes: RoomFinishes, mood: LightingMood, focus: FinishCategory = 'floor'): PaletteGuidance {
  const lesson = lessonFor(focus, finishes, mood)
  const currentId = focusId(focus, finishes, mood)
  const title = `${categoryLabel[focus]} · ${labelMaps[focus][currentId as never]}`

  const order: FinishCategory[] = ['floor', 'wall', 'upholstery', 'metal', 'mood']
  const suggestions: PairSuggestion[] = []

  for (const cat of order) {
    if (cat === focus) continue
    const refs = lesson.pairs[cat]
    if (!refs?.length) continue
    // Prefer a non-active suggestion; fall back to showing the active pair as “already in palette”
    const preferred = refs.find((r) => !isActive(cat, r.id, finishes, mood)) ?? refs[0]
    suggestions.push({
      category: cat,
      categoryLabel: categoryLabel[cat],
      id: preferred.id,
      label: labelMaps[cat][preferred.id as never],
      reason: preferred.why,
      swatch: swatchMaps[cat][preferred.id],
      active: isActive(cat, preferred.id, finishes, mood),
    })
  }

  return {
    focus,
    title,
    lesson: lesson.lesson,
    suggestions,
    tension: detectTension(finishes, mood) ?? lesson.caution,
    reading: readPalette(finishes, mood),
  }
}

/** Ids recommended for a category given the current focus lesson. */
export function recommendedIds(finishes: RoomFinishes, mood: LightingMood, focus: FinishCategory, category: FinishCategory): Set<string> {
  const lesson = lessonFor(focus, finishes, mood)
  return new Set((lesson.pairs[category] ?? []).map((r) => r.id))
}

function detectTension(finishes: RoomFinishes, mood: LightingMood): string | undefined {
  const darkFloor = finishes.floor === 'nero' || finishes.floor === 'walnut' || finishes.floor === 'smoked-oak'
  const darkWall = finishes.wall === 'nero' || finishes.wall === 'walnut-slats'
  const darkSeat = finishes.upholstery === 'charcoal' || finishes.upholstery === 'ink'
  if (darkFloor && darkWall && darkSeat) {
    return 'Three dark planes at once usually flatten the room. Lighten the floor, the wall, or the seating so one surface can breathe.'
  }
  if (finishes.floor === 'nero' && finishes.wall === 'nero') {
    return 'Matching Nero on floor and wall removes contrast. Try a plaster or limewash wall, or a lighter floor.'
  }
  if (finishes.floor === 'walnut' && finishes.wall === 'walnut-slats' && finishes.upholstery === 'cognac') {
    return 'Walnut + walnut + cognac stacks warm browns. Introduce a pale textile or cooler metal to separate the layers.'
  }
  if (mood === 'daylight' && finishes.metal === 'copper' && finishes.upholstery === 'ink') {
    return 'Copper and ink can feel theatrical in hard daylight. Evening light usually makes that pairing more intentional.'
  }
  return undefined
}

function readPalette(finishes: RoomFinishes, mood: LightingMood): string {
  const warmMetal = finishes.metal === 'brass' || finishes.metal === 'bronze' || finishes.metal === 'copper'
  const paleFloor = finishes.floor === 'calacatta' || finishes.floor === 'limestone' || finishes.floor === 'travertine' || finishes.floor === 'oak'
  const softSeat = finishes.upholstery === 'boucle' || finishes.upholstery === 'linen'

  if (paleFloor && softSeat && warmMetal) {
    return `This palette reads as light and hospitable — a pale ground, soft seating, and ${labelMaps.metal[finishes.metal]} for warmth. Under ${labelMaps.mood[mood].toLowerCase()}, materials stay legible without competing.`
  }
  if (finishes.floor === 'nero' || finishes.wall === 'nero') {
    return `Dark stone is doing the heavy lifting. The rest of the palette should either contrast it clearly or echo it once — not twice. ${labelMaps.mood[mood]} will change how severe that stone feels.`
  }
  if (finishes.wall === 'walnut-slats' || finishes.wall === 'oak-slats') {
    return `Timber rhythm on the wall is the main character. Keep the floor and seating quieter so the fluting can be heard — especially as light moves from day to evening.`
  }
  return `Read the room as planes of value: floor, wall, seating, metal. If two planes share a similar darkness or warmth, let the third provide contrast. ${labelMaps.mood[mood]} is part of that reading.`
}
