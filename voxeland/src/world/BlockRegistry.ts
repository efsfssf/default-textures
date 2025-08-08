import { BlockId } from './BlockId';

export type Face = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';

export interface BlockDef {
  id: BlockId;
  name: string;
  transparent: boolean;
  solid: boolean;
  textures: Record<Face, number>;
}

// Texture atlas will be generated procedurally with tiles arranged in a grid.
// We reference tiles by index.

const TILES = {
  grassTop: 0,
  grassSide: 1,
  dirt: 2,
  stone: 3,
  sand: 4,
  water: 5,
  logSide: 6,
  logTop: 7,
  leaves: 8,
  coalOre: 9,
  ironOre: 10,
};

export const BLOCKS: Record<number, BlockDef> = {
  [BlockId.Air]: {
    id: BlockId.Air,
    name: 'Air',
    transparent: true,
    solid: false,
    textures: { px: 0, nx: 0, py: 0, ny: 0, pz: 0, nz: 0 },
  },
  [BlockId.Grass]: {
    id: BlockId.Grass,
    name: 'Grass',
    transparent: false,
    solid: true,
    textures: { px: TILES.grassSide, nx: TILES.grassSide, py: TILES.grassTop, ny: TILES.dirt, pz: TILES.grassSide, nz: TILES.grassSide },
  },
  [BlockId.Dirt]: {
    id: BlockId.Dirt,
    name: 'Dirt',
    transparent: false,
    solid: true,
    textures: { px: TILES.dirt, nx: TILES.dirt, py: TILES.dirt, ny: TILES.dirt, pz: TILES.dirt, nz: TILES.dirt },
  },
  [BlockId.Stone]: {
    id: BlockId.Stone,
    name: 'Stone',
    transparent: false,
    solid: true,
    textures: { px: TILES.stone, nx: TILES.stone, py: TILES.stone, ny: TILES.stone, pz: TILES.stone, nz: TILES.stone },
  },
  [BlockId.Sand]: {
    id: BlockId.Sand,
    name: 'Sand',
    transparent: false,
    solid: true,
    textures: { px: TILES.sand, nx: TILES.sand, py: TILES.sand, ny: TILES.sand, pz: TILES.sand, nz: TILES.sand },
  },
  [BlockId.Water]: {
    id: BlockId.Water,
    name: 'Water',
    transparent: true,
    solid: false,
    textures: { px: TILES.water, nx: TILES.water, py: TILES.water, ny: TILES.water, pz: TILES.water, nz: TILES.water },
  },
  [BlockId.Log]: {
    id: BlockId.Log,
    name: 'Log',
    transparent: false,
    solid: true,
    textures: { px: TILES.logSide, nx: TILES.logSide, py: TILES.logTop, ny: TILES.logTop, pz: TILES.logSide, nz: TILES.logSide },
  },
  [BlockId.Leaves]: {
    id: BlockId.Leaves,
    name: 'Leaves',
    transparent: true,
    solid: false,
    textures: { px: TILES.leaves, nx: TILES.leaves, py: TILES.leaves, ny: TILES.leaves, pz: TILES.leaves, nz: TILES.leaves },
  },
  [BlockId.CoalOre]: {
    id: BlockId.CoalOre,
    name: 'Coal Ore',
    transparent: false,
    solid: true,
    textures: { px: TILES.coalOre, nx: TILES.coalOre, py: TILES.coalOre, ny: TILES.coalOre, pz: TILES.coalOre, nz: TILES.coalOre },
  },
  [BlockId.IronOre]: {
    id: BlockId.IronOre,
    name: 'Iron Ore',
    transparent: false,
    solid: true,
    textures: { px: TILES.ironOre, nx: TILES.ironOre, py: TILES.ironOre, ny: TILES.ironOre, pz: TILES.ironOre, nz: TILES.ironOre },
  },
};