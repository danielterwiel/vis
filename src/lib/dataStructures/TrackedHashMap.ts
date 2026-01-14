import type { VisualizationStep } from "../../store/useAppStore";

/**
 * Interface for a hash map bucket entry (key-value pair)
 */
export interface HashMapEntry<K, V> {
  key: K;
  value: V;
}

/**
 * Interface for a hash map bucket (array of entries for collision handling)
 */
export interface HashMapBucket<K, V> {
  entries: HashMapEntry<K, V>[];
}

/**
 * TrackedHashMap - A hash map implementation that captures all operations for visualization
 *
 * Features:
 * - Separate chaining for collision resolution
 * - Automatic resizing when load factor exceeds threshold
 * - Generic key-value pairs with proper hashing
 * - Operation capture for visualization via callback
 *
 * @template K - The type of keys in the hash map
 * @template V - The type of values in the hash map
 */
export class TrackedHashMap<K = string, V = unknown> {
  private buckets: (HashMapBucket<K, V> | null)[];
  private size: number;
  private capacity: number;
  private loadFactorThreshold: number;
  private onOperation?: (step: VisualizationStep) => void;

  constructor(
    initialCapacity = 16,
    loadFactorThreshold = 0.75,
    onOperation?: (step: VisualizationStep) => void,
  ) {
    this.capacity = initialCapacity;
    this.loadFactorThreshold = loadFactorThreshold;
    this.size = 0;
    this.buckets = Array.from({ length: initialCapacity }, () => null);
    this.onOperation = onOperation;
  }

  /**
   * Hash function to convert key to bucket index
   */
  private hash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % this.capacity;
  }

  /**
   * Emit a visualization step
   */
  private emitStep(
    type: string,
    args: unknown[],
    _result: unknown,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.onOperation) {
      this.onOperation({
        type,
        target: "hashMap",
        args,
        result: this.toArray(),
        timestamp: Date.now(),
        metadata,
      });
    }
  }

  /**
   * Set a key-value pair in the hash map
   */
  set(key: K, value: V): this {
    const index = this.hash(key);
    const hashValue = index;

    // Initialize bucket if null
    if (!this.buckets[index]) {
      this.buckets[index] = { entries: [] };
    }

    const bucket = this.buckets[index]!;

    // Check if key exists, update value
    for (let i = 0; i < bucket.entries.length; i++) {
      if (bucket.entries[i]!.key === key) {
        const oldValue = bucket.entries[i]!.value;
        bucket.entries[i]!.value = value;
        this.emitStep("set", [key, value], value, {
          key,
          value,
          index,
          hashValue,
          collision: bucket.entries.length > 1,
          updated: true,
          oldValue,
        });
        return this;
      }
    }

    // Key doesn't exist, add new entry
    bucket.entries.push({ key, value });
    this.size++;

    this.emitStep("set", [key, value], value, {
      key,
      value,
      index,
      hashValue,
      collision: bucket.entries.length > 1,
      updated: false,
    });

    // Check if resize needed
    if (this.size / this.capacity > this.loadFactorThreshold) {
      this.resize();
    }

    return this;
  }

  /**
   * Get a value by key
   */
  get(key: K): V | undefined {
    const index = this.hash(key);
    const hashValue = index;
    const bucket = this.buckets[index];

    if (!bucket) {
      this.emitStep("get", [key], undefined, {
        key,
        index,
        hashValue,
        found: false,
      });
      return undefined;
    }

    for (let i = 0; i < bucket.entries.length; i++) {
      if (bucket.entries[i]!.key === key) {
        const value = bucket.entries[i]!.value;
        this.emitStep("get", [key], value, {
          key,
          value,
          index,
          hashValue,
          found: true,
          position: i,
        });
        return value;
      }
    }

    this.emitStep("get", [key], undefined, {
      key,
      index,
      hashValue,
      found: false,
    });
    return undefined;
  }

  /**
   * Delete a key-value pair
   */
  delete(key: K): boolean {
    const index = this.hash(key);
    const hashValue = index;
    const bucket = this.buckets[index];

    if (!bucket) {
      this.emitStep("delete", [key], false, {
        key,
        index,
        hashValue,
        deleted: false,
      });
      return false;
    }

    for (let i = 0; i < bucket.entries.length; i++) {
      if (bucket.entries[i]!.key === key) {
        const deletedValue = bucket.entries[i]!.value;
        bucket.entries.splice(i, 1);
        this.size--;

        // Remove bucket if empty
        if (bucket.entries.length === 0) {
          this.buckets[index] = null;
        }

        this.emitStep("delete", [key], true, {
          key,
          deletedValue,
          index,
          hashValue,
          deleted: true,
        });
        return true;
      }
    }

    this.emitStep("delete", [key], false, {
      key,
      index,
      hashValue,
      deleted: false,
    });
    return false;
  }

  /**
   * Check if a key exists
   */
  has(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    if (!bucket) {
      return false;
    }

    for (let i = 0; i < bucket.entries.length; i++) {
      if (bucket.entries[i]!.key === key) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear all entries
   */
  clear(): this {
    this.buckets = Array.from({ length: this.capacity }, () => null);
    this.size = 0;

    this.emitStep("clear", [], null, {
      cleared: true,
      capacity: this.capacity,
    });

    return this;
  }

  /**
   * Resize the hash map when load factor exceeds threshold
   */
  private resize(): void {
    const oldCapacity = this.capacity;
    const oldBuckets = this.buckets;

    this.capacity = this.capacity * 2;
    this.buckets = Array.from({ length: this.capacity }, () => null);
    this.size = 0;

    // Rehash all entries
    for (const bucket of oldBuckets) {
      if (bucket) {
        for (const entry of bucket.entries) {
          this.set(entry.key, entry.value);
        }
      }
    }

    this.emitStep("resize", [], this.capacity, {
      oldCapacity,
      newCapacity: this.capacity,
      resized: true,
    });
  }

  /**
   * Get all keys
   */
  keys(): K[] {
    const keys: K[] = [];
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const entry of bucket.entries) {
          keys.push(entry.key);
        }
      }
    }
    return keys;
  }

  /**
   * Get all values
   */
  values(): V[] {
    const values: V[] = [];
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const entry of bucket.entries) {
          values.push(entry.value);
        }
      }
    }
    return values;
  }

  /**
   * Get all entries
   */
  entries(): Array<[K, V]> {
    const entries: Array<[K, V]> = [];
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const entry of bucket.entries) {
          entries.push([entry.key, entry.value]);
        }
      }
    }
    return entries;
  }

  /**
   * Get the number of entries
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Check if the hash map is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Get the current capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get the current load factor
   */
  getLoadFactor(): number {
    return this.size / this.capacity;
  }

  /**
   * Get the buckets array for visualization
   */
  getBuckets(): (HashMapBucket<K, V> | null)[] {
    return this.buckets;
  }

  /**
   * Convert to array representation for visualization
   */
  toArray(): Array<[K, V]> {
    return this.entries();
  }

  /**
   * Static factory method
   */
  static from<K, V>(
    entries: Array<[K, V]>,
    onOperation?: (step: VisualizationStep) => void,
  ): TrackedHashMap<K, V> {
    const map = new TrackedHashMap<K, V>(16, 0.75, onOperation);
    for (const [key, value] of entries) {
      map.set(key, value);
    }
    return map;
  }
}

/**
 * Helper function to create a TrackedHashMap
 */
export function createTrackedHashMap<K = string, V = unknown>(
  initialCapacity?: number,
  loadFactorThreshold?: number,
  onOperation?: (step: VisualizationStep) => void,
): TrackedHashMap<K, V> {
  return new TrackedHashMap<K, V>(initialCapacity, loadFactorThreshold, onOperation);
}
