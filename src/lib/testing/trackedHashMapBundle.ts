/**
 * TrackedHashMap Bundle
 *
 * Serializes TrackedHashMap class as executable JavaScript string for sandbox injection.
 * Follows same pattern as trackedArrayBundle, trackedLinkedListBundle, etc.
 */

export function bundleTrackedHashMap(): string {
  return `
    class TrackedHashMap {
      constructor(initialCapacity = 16, loadFactorThreshold = 0.75, onOperation) {
        this.capacity = initialCapacity;
        this.loadFactorThreshold = loadFactorThreshold;
        this.size = 0;
        this.buckets = new Array(initialCapacity).fill(null);
        this.onOperation = onOperation;
      }

      hash(key) {
        const str = String(key);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return Math.abs(hash) % this.capacity;
      }

      emitStep(type, args, result, metadata) {
        if (this.onOperation) {
          // Capture line number from call stack for code highlighting
          let lineNumber = null;
          try {
            const stack = new Error().stack;
            if (stack) {
              const lines = stack.split('\\n');
              for (let i = 2; i < lines.length; i++) {
                const match = lines[i].match(/:(\\d+):\\d+/);
                if (match && match[1]) {
                  const rawLine = parseInt(match[1], 10);
                  const offset = typeof window !== 'undefined' && window.__userCodeLineOffset ? window.__userCodeLineOffset : 0;
                  lineNumber = rawLine - offset;
                  if (lineNumber < 1) lineNumber = null;
                  break;
                }
              }
            }
          } catch (e) {}
          this.onOperation({
            type,
            target: "hashMap",
            args,
            result: this.toArray(),
            timestamp: Date.now(),
            metadata: { ...metadata, lineNumber }
          });
        }
      }

      set(key, value) {
        const index = this.hash(key);
        const hashValue = index;

        if (!this.buckets[index]) {
          this.buckets[index] = { entries: [] };
        }

        const bucket = this.buckets[index];

        for (let i = 0; i < bucket.entries.length; i++) {
          if (bucket.entries[i].key === key) {
            const oldValue = bucket.entries[i].value;
            bucket.entries[i].value = value;
            this.emitStep("set", [key, value], value, {
              key,
              value,
              index,
              hashValue,
              collision: bucket.entries.length > 1,
              updated: true,
              oldValue
            });
            return this;
          }
        }

        bucket.entries.push({ key, value });
        this.size++;

        this.emitStep("set", [key, value], value, {
          key,
          value,
          index,
          hashValue,
          collision: bucket.entries.length > 1,
          updated: false
        });

        if (this.size / this.capacity > this.loadFactorThreshold) {
          this.resize();
        }

        return this;
      }

      get(key) {
        const index = this.hash(key);
        const hashValue = index;
        const bucket = this.buckets[index];

        if (!bucket) {
          this.emitStep("get", [key], undefined, {
            key,
            index,
            hashValue,
            found: false
          });
          return undefined;
        }

        for (let i = 0; i < bucket.entries.length; i++) {
          if (bucket.entries[i].key === key) {
            const value = bucket.entries[i].value;
            this.emitStep("get", [key], value, {
              key,
              value,
              index,
              hashValue,
              found: true,
              position: i
            });
            return value;
          }
        }

        this.emitStep("get", [key], undefined, {
          key,
          index,
          hashValue,
          found: false
        });
        return undefined;
      }

      delete(key) {
        const index = this.hash(key);
        const hashValue = index;
        const bucket = this.buckets[index];

        if (!bucket) {
          this.emitStep("delete", [key], false, {
            key,
            index,
            hashValue,
            deleted: false
          });
          return false;
        }

        for (let i = 0; i < bucket.entries.length; i++) {
          if (bucket.entries[i].key === key) {
            const deletedValue = bucket.entries[i].value;
            bucket.entries.splice(i, 1);
            this.size--;

            if (bucket.entries.length === 0) {
              this.buckets[index] = null;
            }

            this.emitStep("delete", [key], true, {
              key,
              deletedValue,
              index,
              hashValue,
              deleted: true
            });
            return true;
          }
        }

        this.emitStep("delete", [key], false, {
          key,
          index,
          hashValue,
          deleted: false
        });
        return false;
      }

      has(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];

        if (!bucket) {
          return false;
        }

        for (let i = 0; i < bucket.entries.length; i++) {
          if (bucket.entries[i].key === key) {
            return true;
          }
        }

        return false;
      }

      clear() {
        this.buckets = new Array(this.capacity).fill(null);
        this.size = 0;

        this.emitStep("clear", [], null, {
          cleared: true,
          capacity: this.capacity
        });

        return this;
      }

      resize() {
        const oldCapacity = this.capacity;
        const oldBuckets = this.buckets;

        this.capacity = this.capacity * 2;
        this.buckets = new Array(this.capacity).fill(null);
        this.size = 0;

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
          resized: true
        });
      }

      keys() {
        const keys = [];
        for (const bucket of this.buckets) {
          if (bucket) {
            for (const entry of bucket.entries) {
              keys.push(entry.key);
            }
          }
        }
        return keys;
      }

      values() {
        const values = [];
        for (const bucket of this.buckets) {
          if (bucket) {
            for (const entry of bucket.entries) {
              values.push(entry.value);
            }
          }
        }
        return values;
      }

      entries() {
        const entries = [];
        for (const bucket of this.buckets) {
          if (bucket) {
            for (const entry of bucket.entries) {
              entries.push([entry.key, entry.value]);
            }
          }
        }
        return entries;
      }

      getSize() {
        return this.size;
      }

      isEmpty() {
        return this.size === 0;
      }

      getCapacity() {
        return this.capacity;
      }

      getLoadFactor() {
        return this.size / this.capacity;
      }

      getBuckets() {
        return this.buckets;
      }

      toArray() {
        return this.entries();
      }

      static from(entries, onOperation) {
        const map = new TrackedHashMap(16, 0.75, onOperation);
        for (const [key, value] of entries) {
          map.set(key, value);
        }
        return map;
      }
    }

    // Helper function to create TrackedHashMap
    // Automatically uses window.__capture if available and no callback is provided
    function createTrackedHashMap(initialCapacity, loadFactorThreshold, onOperation) {
      // If only one argument and it's a function, treat it as onOperation
      if (typeof initialCapacity === 'function') {
        onOperation = initialCapacity;
        initialCapacity = 16;
        loadFactorThreshold = 0.75;
      }
      // If only two arguments and second is a function, treat it as onOperation with custom capacity
      else if (typeof loadFactorThreshold === 'function') {
        onOperation = loadFactorThreshold;
        loadFactorThreshold = 0.75;
      }

      // Auto-wire window.__capture if no callback provided
      const callback = onOperation !== undefined
        ? onOperation
        : (typeof window !== 'undefined' && typeof window.__capture === 'function' ? window.__capture : undefined);

      return new TrackedHashMap(
        initialCapacity !== undefined ? initialCapacity : 16,
        loadFactorThreshold !== undefined ? loadFactorThreshold : 0.75,
        callback
      );
    }
  `;
}
