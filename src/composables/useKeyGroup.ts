import { ref } from 'vue'

export type KeyImageGroup = 'left-keys' | 'left-keys2'

const keyGroup = ref<KeyImageGroup>('left-keys')

export function useKeyGroup() {
  return keyGroup
}
