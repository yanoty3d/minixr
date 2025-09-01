import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// Available scene configurations  
const SCENE_CONFIG = {
  'multiscene_root': {
    name: 'マルチシーンルート',
    description: 'シーン切り替えの管理画面',
    icon: '🎛️'
  },
  'arginine_scene1': {
    name: 'アルギニンシーン1', 
    description: 'アルギニン分子の3Dビュー（シーン1）',
    icon: '🧬'
  },
  'arginine_scene2': {
    name: 'アルギニンシーン2',
    description: 'アルギニン分子の3Dビュー（シーン2）', 
    icon: '⚛️'
  }
} as const

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="w-full bg-white shadow-sm">
        <div className="mx-auto max-w-6xl p-6">
          <h1 className={`${inter.className} text-4xl font-bold text-gray-900`}>
            MiniXR マルチシーンビューア
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            3Dシーンを選択して探索してください
          </p>
        </div>
      </div>

      {/* Scene Selection Grid */}
      <div className="mx-auto max-w-6xl flex-1 p-6">
        <div className="mt-8">
          <h2 className={`${inter.className} mb-6 text-2xl font-semibold text-gray-800`}>
            利用可能なシーン
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SCENE_CONFIG).map(([sceneName, config]) => (
              <Link
                key={sceneName}
                href={`/${sceneName}`}
                className="group block transform rounded-xl bg-white p-6 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{config.icon}</div>
                  <div className="flex-1">
                    <h3 className={`${inter.className} text-xl font-semibold text-gray-900 group-hover:text-blue-600`}>
                      {config.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">
                    /{sceneName}
                  </span>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    開く →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Access Info */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6">
          <h3 className={`${inter.className} text-lg font-semibold text-blue-900`}>
            直接アクセス
          </h3>
          <p className="mt-2 text-sm text-blue-700">
            URLで直接シーンにアクセスできます：
          </p>
          <div className="mt-3 space-y-1 font-mono text-sm">
            {Object.keys(SCENE_CONFIG).map((sceneName) => (
              <div key={sceneName} className="text-blue-600">
                <span className="text-gray-600">{typeof window !== 'undefined' ? window.location.origin : ''}</span>
                <span className="font-bold">/{sceneName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          <p>Powered by Needle Engine + Next.js</p>
          <p className="mt-1">
            Unity scenes exported as GLB files and rendered in the browser
          </p>
        </div>
      </footer>
    </main>
  )
}
