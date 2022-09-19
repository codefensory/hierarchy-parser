import { hierarchyParserOld as hierarchyParser } from '../src'

function generateHighData(length: number) {
  const data = []

  for (let i = 0; i < length; i++) {
    const isParent = Math.random() * 100 < 5 || i === 0

    data.push({
      id: i,
      name: 'aaaaa',
      parentId: isParent ? null : Math.round(Math.random() * (i - 1)),
    })
  }

  return data
}

test('check if data is correctly being parsed', () => {
  const data = [
    {
      id: 1,
      name: 'Home',
      parentId: null,
    },
    {
      id: 2,
      name: 'Tech',
      parentId: null,
    },
    {
      id: 3,
      name: 'Decor',
      parentId: 1,
    },
    {
      id: 4,
      name: 'Bath',
      parentId: 1,
    },
    {
      id: 5,
      name: 'Games',
      parentId: 2,
    },
    {
      id: 6,
      name: 'Frames',
      parentId: 3,
    },
  ]

  const expected = [
    {
      id: 1,
      name: 'Home',
      parentId: null,
      children: [
        {
          id: 3,
          name: 'Decor',
          parentId: 1,
          children: [
            {
              id: 6,
              name: 'Frames',
              parentId: 3,
            },
          ],
        },
        {
          id: 4,
          name: 'Bath',
          parentId: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Tech',
      parentId: null,
      children: [
        {
          id: 5,
          name: 'Games',
          parentId: 2,
        },
      ],
    },
  ]

  const hierarchy = hierarchyParser(data)

  expect(hierarchy).toMatchObject(expected)
})

test('it gets children from an specific parent id', () => {
  const data = [
    {
      id: 1,
      name: 'Exclude',
      parentId: null,
    },
    {
      id: 3,
      name: 'Decor',
      parentId: 1,
    },
    {
      id: 6,
      name: 'Frames',
      parentId: 3,
    },
    {
      id: 8,
      name: 'Exclude',
      parentId: null,
    },
  ]

  const expected = [
    {
      id: 3,
      name: 'Decor',
      parentId: 1,
      children: [
        {
          id: 6,
          name: 'Frames',
          parentId: 3,
        },
      ],
    },
  ]

  const hierarchy = hierarchyParser(data, { initialParentId: 3 })

  expect(hierarchy).toMatchObject(expected)
})

test('it can handle different parentKey and identifier', () => {
  const data = [
    {
      sku: 'KD910',
      name: 'Decor',
      ancestor: null,
    },
    {
      sku: 'M921LJ',
      name: 'Frames',
      ancestor: 'KD910',
    },
  ]

  const expected = [
    {
      sku: 'KD910',
      name: 'Decor',
      ancestor: null,
      children: [
        {
          sku: 'M921LJ',
          name: 'Frames',
          ancestor: 'KD910',
        },
      ],
    },
  ]

  const hierarchy = hierarchyParser(data, {
    identifier: 'sku',
    parentKey: 'ancestor',
  })

  expect(hierarchy).toMatchObject(expected)
})

test('check if hierarchyParser is ephemeral', () => {
  const data = [
    {
      id: 1,
      name: 'Werner Heisenberg',
      parentId: null,
    },
    {
      id: 2,
      name: 'Sommerfeld',
      parentId: 1,
    },
  ]

  const expected = [
    {
      id: 1,
      name: 'Werner Heisenberg',
      parentId: null,
      children: [
        {
          id: 2,
          name: 'Sommerfeld',
          parentId: 1,
        },
      ],
    },
  ]

  const hierarchyOne = hierarchyParser(data)
  const hierarchyTwo = hierarchyParser(data)

  expect(hierarchyOne).toMatchObject(expected)
  expect(hierarchyTwo).toMatchObject(expected)
})

test('check if hierarchyParser does not mutate the input data', () => {
  const f = Object.freeze.bind(null)

  const data = f([
    f({
      id: 1,
      name: 'La Libertad',
      parentId: null,
    }),
    f({
      id: 2,
      name: 'Trujillo',
      parentId: 1,
    }),
    f({
      id: 3,
      name: 'Florencia de Mora',
      parentId: 2,
    }),
    f({
      id: 4,
      name: 'Alfonso Ugarte',
      parentId: 3,
    }),
  ])

  const expected = [
    {
      id: 1,
      name: 'La Libertad',
      parentId: null,
      children: [
        {
          id: 2,
          name: 'Trujillo',
          parentId: 1,
          children: [
            {
              id: 3,
              name: 'Florencia de Mora',
              parentId: 2,
              children: [
                {
                  id: 4,
                  name: 'Alfonso Ugarte',
                  parentId: 3,
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  const hierarchy = hierarchyParser(data)

  expect(hierarchy).toMatchObject(expected)
})

describe.only('test speed', () => {
  test('load 100 data', () => {
    const data = generateHighData(100)

    const hierarchy = hierarchyParser(data)
  })

  test('load 1000 data', () => {
    const data = generateHighData(1000)

    const hierarchy = hierarchyParser(data)
  })

  test('load 10000 data', () => {
    const data = generateHighData(10000)

    const hierarchy = hierarchyParser(data)
  })

  test('load 100000 data', () => {
    const data = generateHighData(100000)

    const hierarchy = hierarchyParser(data)
  })

  test('load 1000000 data', () => {
    const data = generateHighData(1000000)

    const hierarchy = hierarchyParser(data)
  })
})
