import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { MANIFEST_SCHEMA, type Inventory, type ScanProgress } from './core.ts';

type InventoryKind = 'source' | 'destination';

interface NativeInventory {
  schema: typeof MANIFEST_SCHEMA;
  label: string;
  createdAt: string;
  files: Inventory['files'];
}

interface SafInventoryPlugin {
  chooseTree(options: { kind: InventoryKind }): Promise<NativeInventory>;
  cancelScan(): Promise<void>;
  addListener(eventName: 'scanProgress', listener: (progress: ScanProgress & { kind: InventoryKind }) => void): Promise<PluginListenerHandle>;
}

const SafInventory = registerPlugin<SafInventoryPlugin>('SafInventory');

export function usesNativeSaf(): boolean {
  return Capacitor.isNativePlatform();
}

export async function chooseSafTree(kind: InventoryKind): Promise<Inventory> {
  const inventory = await SafInventory.chooseTree({ kind });
  if (inventory.schema !== MANIFEST_SCHEMA || !Array.isArray(inventory.files)) {
    throw new Error('Android returned an unsupported folder record. Choose the folder again.');
  }
  return inventory;
}

export async function listenForSafProgress(listener: (progress: ScanProgress & { kind: InventoryKind }) => void): Promise<PluginListenerHandle | null> {
  if (!usesNativeSaf()) return null;
  return SafInventory.addListener('scanProgress', listener);
}

export async function cancelSafScan(): Promise<void> {
  if (usesNativeSaf()) await SafInventory.cancelScan();
}
