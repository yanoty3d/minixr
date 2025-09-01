import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import { type NeedleEngineProps } from '../needleEngine'
const NeedleEngine = dynamic<NeedleEngineProps>(() => import('../needleEngine'), { ssr: false })

// Available scene configurations
const SCENE_CONFIG = {
  'multiscene_root': {
    glb: './assets/multiscene_root.glb',
    name: 'マルチシーンルート',
    description: 'シーン切り替えの管理画面'
  },
  'arginine_scene1': {
    glb: './assets/arginine_scene1.glb',
    name: 'アルギニンシーン1',
    description: 'アルギニン分子の3Dビュー（シーン1）'
  },
  'arginine_scene2': {
    glb: './assets/arginine_scene2.glb', 
    name: 'アルギニンシーン2',
    description: 'アルギニン分子の3Dビュー（シーン2）'
  }
} as const

type SceneName = keyof typeof SCENE_CONFIG

export default function ScenePage() {
  const router = useRouter()
  const { scene } = router.query
  const [currentScene, setCurrentScene] = useState<SceneName | null>(null)
  const [isValidScene, setIsValidScene] = useState(false)

  useEffect(() => {
    if (typeof scene === 'string' && scene in SCENE_CONFIG) {
      setCurrentScene(scene as SceneName)
      setIsValidScene(true)
    } else if (scene) {
      setIsValidScene(false)
    }
  }, [scene])

  // Loading state
  if (!scene) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">読み込み中...</div>
        </div>
      </div>
    )
  }

  // Invalid scene
  if (!isValidScene) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">シーンが見つかりません</h1>
          <p className="mb-6 text-gray-600">
            シーン "{scene}" は存在しません。
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">利用可能なシーン:</p>
            {Object.keys(SCENE_CONFIG).map((sceneName) => (
              <Link
                key={sceneName}
                href={`/${sceneName}`}
                className="block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                {SCENE_CONFIG[sceneName as SceneName].name}
              </Link>
            ))}
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-500 hover:text-blue-700"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const sceneConfig = SCENE_CONFIG[currentScene!]

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gray-100 p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{sceneConfig.name}</h1>
            <p className="text-gray-600">{sceneConfig.description}</p>
          </div>
          <Link
            href="/"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            ホーム
          </Link>
        </div>
      </div>

      {/* Scene Navigation */}
      <div className="w-full bg-white p-4 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <nav className="flex space-x-4">
            {Object.entries(SCENE_CONFIG).map(([sceneName, config]) => (
              <Link
                key={sceneName}
                href={`/${sceneName}`}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  currentScene === sceneName
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {config.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="relative flex w-full flex-1 items-center justify-center">
        <div className="relative h-[600px] w-full max-w-6xl overflow-hidden rounded-lg bg-gray-100 lg:border lg:shadow-lg">
          {currentScene && (
            <NeedleEngine
              src={sceneConfig.glb}
              style={{
                left: "0",
                top: "0", 
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          現在のシーン: <strong>{currentScene}</strong> | GLBファイル: <strong>{sceneConfig.glb}</strong>
        </div>
      </div>
    </main>
  )
}