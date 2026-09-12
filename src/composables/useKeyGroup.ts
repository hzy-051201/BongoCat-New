import { ref } from 'vue'

export type KeyImageGroup = 'left-keys' | 'left-keys2'

const keyGroup = ref<KeyImageGroup>('left-keys')
const keyGroupVersion = ref(0)

export function useKeyGroup() {
  const setKeyGroup = (group: KeyImageGroup) => {
    keyGroup.value = group
    keyGroupVersion.value += 1
  }

  return {
    keyGroup,
    keyGroupVersion,
    setKeyGroup,
  }
}
