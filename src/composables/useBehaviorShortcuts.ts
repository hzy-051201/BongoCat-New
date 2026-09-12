import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { watch } from 'vue'

import { useModelStore } from '@/stores/model'
import live2d from '@/utils/live2d'

const registered = new Map<string, string>()

export function useBehaviorShortcuts() {
  const modelStore = useModelStore()
  let queue = Promise.resolve()

  const trigger = (id: string) => {
    const parts = id.split(':')
    const type = parts[1]

    if (type === 'expression') {
      live2d.setExpression(Number(parts[2]))

      return
    }

    if (type !== 'motion') return

    const index = Number(parts.at(-1))
    const groupName = parts.slice(2, -1).join(':')
    const motions = modelStore.currentMotions.find(([name]) => name === groupName)?.[1]
    const motion = motions?.[index]

    if (motion) {
      live2d.startMotion(motion)
    }
  }

  const sync = async () => {
    const modelId = modelStore.currentModel?.id
    const next = new Map<string, string>()

    if (modelId) {
      for (const [id, shortcut] of Object.entries(modelStore.shortcuts)) {
        if (!shortcut || !id.startsWith(`${modelId}:`)) continue

        next.set(shortcut, id)
      }
    }

    for (const [shortcut, id] of registered) {
      if (next.get(shortcut) === id) continue

      if (await isRegistered(shortcut).catch(() => false)) {
        await unregister(shortcut).catch(() => {})
      }

      registered.delete(shortcut)
    }

    for (const [shortcut, id] of next) {
      if (registered.get(shortcut) === id) continue

      await register(shortcut, (event) => {
        if (event.state === 'Released') return

        trigger(id)
      }).catch(() => {})

      registered.set(shortcut, id)
    }
  }

  watch(
    () => [modelStore.currentModel?.id, modelStore.currentMotions, modelStore.shortcuts],
    () => {
      queue = queue.then(sync)
    },
    { deep: true, immediate: true },
  )
}
