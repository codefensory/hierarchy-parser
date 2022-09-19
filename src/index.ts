export interface HierarchyParserOptions {
  identifier?: string
  parentKey?: string
  initialParentId?: string | number | null
}

export type HierarchyItem<T> = { [K in keyof T]: T[K] } & { children?: HierarchyItem<T>[] }

const defaultOptions: HierarchyParserOptions = {
  parentKey: 'parentId',
  identifier: 'id',
  initialParentId: null,
}

const NS_PER_SEC = 1e9
const MS_PER_NS = 1e-6

// Solo debe pasar una vez por el array ---
export default function hierarchyParser<InputItem extends { [k: string]: unknown }>(
  dataSource: Readonly<InputItem[]>,
  options: Readonly<HierarchyParserOptions> = {}
) {
  const startTime = process.hrtime()

  const { parentKey, identifier, initialParentId } = {
    ...defaultOptions,
    ...options,
  } as Required<HierarchyParserOptions>

  const pendingChildren: { [key: string]: HierarchyItem<InputItem>[] } = {}

  const itemsIndex: { [key: string]: HierarchyItem<InputItem> } = {}

  const result = []

  for (let i = 0; i < dataSource.length; i++) {
    const currFolder: HierarchyItem<InputItem> = { ...dataSource[i] }

    const currId = currFolder[identifier]

    if (typeof currId !== 'string' && typeof currId !== 'number') {
      throw new Error('item identifier must be string or number')
    }

    const currParentId = currFolder[parentKey]

    if (pendingChildren[currId]) {
      currFolder.children = pendingChildren[currId]

      delete pendingChildren[currId]
    }

    if ((initialParentId && currId === initialParentId) || (!initialParentId && currParentId === null)) {
      result.push(currFolder)

      itemsIndex[currId] = currFolder

      continue
    } else if (!currParentId) {
      continue
    }

    itemsIndex[currId] = currFolder

    if (typeof currParentId !== 'string' && typeof currParentId !== 'number') {
      throw new Error('item identifier must be string or number')
    }

    if (itemsIndex[currParentId]) {
      const parentFolder = itemsIndex[currParentId]

      if (!parentFolder.children) {
        parentFolder.children = []
      }

      parentFolder.children.push(currFolder)
    } else {
      if (!pendingChildren[currParentId]) {
        pendingChildren[currParentId] = []
      }

      pendingChildren[currParentId].push(currFolder)
    }
  }

  const diff = process.hrtime(startTime)

  console.log(`Benchmark took ${(diff[0] * NS_PER_SEC + diff[1]) * MS_PER_NS} milliseconds`)

  return result
}

export function hierarchyParserOld<InputItem extends { [k: string]: unknown }>(
  dataSource: Readonly<InputItem[]>,
  options: Readonly<HierarchyParserOptions> = {}
) {
  const startTime = process.hrtime()

  const { parentKey, identifier, initialParentId } = {
    ...defaultOptions,
    ...options,
  } as Required<HierarchyParserOptions>

  let initialParents: InputItem[]

  if (!initialParentId) {
    initialParents = dataSource.filter(item => item[parentKey] === null)
  } else {
    initialParents = dataSource.filter(item => item[identifier] === initialParentId)
  }

  function getChildren(parent: InputItem) {
    return dataSource.filter(item => item[parentKey] === parent[identifier])
  }

  function toHierarchyItem(parent: InputItem): HierarchyItem<InputItem> {
    const children = getChildren(parent)

    if (children.length === 0) {
      return parent
    }

    return {
      ...parent,
      children: children.map(toHierarchyItem),
    }
  }


  const result = initialParents.map(toHierarchyItem)

  const diff = process.hrtime(startTime)

  console.log(`Benchmark took ${(diff[0] * NS_PER_SEC + diff[1]) * MS_PER_NS} milliseconds`)

  return result
}
