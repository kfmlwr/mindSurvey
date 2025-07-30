import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // BOSS QUADRANT (8 pairs) - Categories 2,3,4,5
  const pairsData = [
    {
      id: 'pair-1',
      adjective_positive: 'convincing',
      adjective_negative: 'unconvincing',
      positive_x: -1.50,
      positive_y: 2.00,
      negative_x: -0.75,
      negative_y: -3.00,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 1,
    },
    {
      id: 'pair-2',
      adjective_positive: 'direct',
      adjective_negative: 'evasive',
      positive_x: -2.00,
      positive_y: 1.50,
      negative_x: 4.00,
      negative_y: -1.00,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 2,
    },
    {
      id: 'pair-3',
      adjective_positive: 'controlling',
      adjective_negative: 'indecisive',
      positive_x: -2.25,
      positive_y: 3.00,
      negative_x: 3.00,
      negative_y: -2.25,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 3,
    },
    {
      id: 'pair-4',
      adjective_positive: 'precise',
      adjective_negative: 'erratic',
      positive_x: -2.00,
      positive_y: -1.50,
      negative_x: 4.00,
      negative_y: 3.00,
      quadrant: 'BOSS' as const,
      authority_focus: false,
      display_order: 4,
    },
    {
      id: 'pair-5',
      adjective_positive: 'straightforward',
      adjective_negative: 'cautious',
      positive_x: -2.00,
      positive_y: 0.50,
      negative_x: -0.50,
      negative_y: -2.00,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 5,
    },
    {
      id: 'pair-6',
      adjective_positive: 'commanding',
      adjective_negative: 'supportive',
      positive_x: -0.75,
      positive_y: 3.00,
      negative_x: 0.50,
      negative_y: -2.00,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 6,
    },
    {
      id: 'pair-7',
      adjective_positive: 'effective',
      adjective_negative: 'ineffective',
      positive_x: -2.00,
      positive_y: 1.50,
      negative_x: 3.00,
      negative_y: 0.75,
      quadrant: 'BOSS' as const,
      authority_focus: false,
      display_order: 7,
    },
    {
      id: 'pair-8',
      adjective_positive: 'goal-oriented',
      adjective_negative: 'following',
      positive_x: -2.25,
      positive_y: 3.00,
      negative_x: 0.75,
      negative_y: -3.00,
      quadrant: 'BOSS' as const,
      authority_focus: true,
      display_order: 8,
    },
  ]

  for (const pairData of pairsData) {
    await prisma.pairs.upsert({
      where: { id: pairData.id },
      update: {},
      create: pairData,
    })
  }

  // Create German translations for all pairs
  const germanTranslations = [
    {
      pairId: 'pair-1',
      language: 'DE' as const,
      adjective_positive: 'überzeugend',
      adjective_negative: 'nicht überzeugend',
    },
    {
      pairId: 'pair-2',
      language: 'DE' as const,
      adjective_positive: 'direkt',
      adjective_negative: 'ausweichend',
    },
    {
      pairId: 'pair-3',
      language: 'DE' as const,
      adjective_positive: 'kontrollierend',
      adjective_negative: 'unentschlossen',
    },
    {
      pairId: 'pair-4',
      language: 'DE' as const,
      adjective_positive: 'präzise',
      adjective_negative: 'unberechenbar',
    },
    {
      pairId: 'pair-5',
      language: 'DE' as const,
      adjective_positive: 'geradlinig',
      adjective_negative: 'vorsichtig',
    },
    {
      pairId: 'pair-6',
      language: 'DE' as const,
      adjective_positive: 'befehlend',
      adjective_negative: 'unterstützend',
    },
    {
      pairId: 'pair-7',
      language: 'DE' as const,
      adjective_positive: 'effektiv',
      adjective_negative: 'ineffektiv',
    },
    {
      pairId: 'pair-8',
      language: 'DE' as const,
      adjective_positive: 'zielorientiert',
      adjective_negative: 'folgend',
    },
  ]

  for (const translation of germanTranslations) {
    await prisma.pairTranslation.upsert({
      where: {
        pairId_language: {
          pairId: translation.pairId,
          language: translation.language,
        },
      },
      update: {},
      create: translation,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })