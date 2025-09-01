import Image from 'next/image'
import { Inter } from 'next/font/google'

import dynamic from 'next/dynamic'

import { type NeedleEngineProps } from '../needleEngine'
const NeedleEngine = dynamic<NeedleEngineProps>(() => import('../needleEngine'), { ssr: false })



const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (

    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="relative overflow-clip flex items-center justify-between w-full max-w-6xl h-[48rem] lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 mb-8">

        <NeedleEngine
          style={{
            left: "0",
            top: "0",
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      <div className="max-w-4xl text-center space-y-4">
        <h2 className={`${inter.className} text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200`}>
          操作方法
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className={`${inter.className} font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200`}>
              マウス操作
            </h3>
            <ul className={`${inter.className} space-y-2 text-sm text-gray-600 dark:text-gray-400`}>
              <li>• ドラッグで視点を回転</li>
              <li>• ホイールでズームイン/アウト</li>
              <li>• 右クリックドラッグでパン</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className={`${inter.className} font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200`}>
              キーボード操作
            </h3>
            <ul className={`${inter.className} space-y-2 text-sm text-gray-600 dark:text-gray-400`}>
              <li>• W/A/S/D: 前後左右移動</li>
              <li>• Shift: ダッシュ（高速移動）</li>
              <li>• Space: ジャンプ</li>
            </ul>
          </div>
        </div>
        
        <p className={`${inter.className} text-sm text-gray-500 dark:text-gray-500 mt-6`}>
          3D空間内を自由に移動して、アルギニンの分子構造をご覧ください
        </p>
      </div>
    </main>
  )
}
