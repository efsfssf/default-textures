export enum BlockId {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Sand = 4,
  Water = 5,
  Log = 6,
  Leaves = 7,
  CoalOre = 8,
  IronOre = 9,
}

export function isOpaque(block: BlockId): boolean {
  return !(block === BlockId.Air || block === BlockId.Leaves || block === BlockId.Water);
}

export function isSolid(block: BlockId): boolean {
  return block !== BlockId.Air && block !== BlockId.Water && block !== BlockId.Leaves; // leaves non-solid for movement
}

export function isTransparent(block: BlockId): boolean {
  return block === BlockId.Air || block === BlockId.Water || block === BlockId.Leaves;
}