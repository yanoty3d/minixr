# Needle Engine マルチシーン実装ガイド

## 概要

Unity + Needle Engine + Next.jsを使用してマルチシーンのWebアプリケーションを実装する際の完全ガイド。各シーンを独立したURLでアクセス可能にする手順を詳細に解説。

## 目標

- `/` : ホーム（シーン選択画面）
- `/{scene_name}` : 各シーンへの直接アクセス
- 例：`/multiscene_root`, `/arginine_scene1`, `/arginine_scene2`

## 前提条件

- Unity 2022.3 LTS以上
- Needle Engine 4.8.8以上
- Node.js 18以上
- Next.js 14以上

---

## Phase 1: Unity側の設定

### 1.1 シーンの準備

**必要なシーンファイル:**
```
minixr1/Assets/Scenes/
├── multiscene_root.unity      # メインのシーン切り替え管理
├── arginine_scene1.unity      # 切り替え対象シーン1
├── arginine_scene2.unity      # 切り替え対象シーン2
└── ...
```

### 1.2 各シーンにNeedle Engineコンポーネントを追加

**手順 (各シーンで実行):**

1. **Unity Editorでシーンを開く**
   ```
   Assets/Scenes/arginine_scene1.unity をダブルクリック
   ```

2. **Empty GameObjectを作成**
   ```
   Hierarchy右クリック → Create Empty
   名前を「Needle Engine」に変更
   ```

3. **Needle Engineコンポーネントを追加**
   ```
   Inspector → Add Component → "Needle Engine"を検索
   ```

4. **エクスポート設定**
   ```
   Directory: ../minixr1_needle_multiscene を選択
   ```

5. **シーンを保存**
   ```
   Ctrl+S (Cmd+S)
   ```

**実行対象シーン:**
- `arginine_scene1.unity`
- `arginine_scene2.unity`

### 1.3 マスターシーンにSceneSwitcherを追加

**対象シーン:** `multiscene_root.unity`

1. **シーンを開く**
2. **Empty GameObjectを作成**
   ```
   名前: SceneSwitcher
   ```
3. **SceneSwitcherコンポーネントを追加**
   ```
   Inspector → Add Component → "SceneSwitcher"を検索
   ```
4. **Scenes配列を設定**
   ```
   Size: 2
   Element 0: arginine_scene1 (シーンファイルをドラッグ&ドロップ)
   Element 1: arginine_scene2 (シーンファイルをドラッグ&ドロップ)
   ```

### 1.4 ビルド実行

1. **Needle Engine Build Windowを開く**
   ```
   Window → Needle Engine → Build Window
   ```

2. **全シーンをビルド**
   ```
   Build All Scenes ボタンをクリック
   ```

3. **生成確認**
   ```
   minixr1_needle_multiscene/public/assets/ に以下が生成される:
   - multiscene_root.glb
   - arginine_scene1.glb  
   - arginine_scene2.glb
   ```

### 1.5 Needle Engine設定ファイル更新確認

**ファイル:** `minixr1/ProjectSettings/NeedleExporterSceneData.asset`

**期待される内容:**
```yaml
Scenes:
- Path: Assets/Scenes/arginine_scene1.unity
  Projects:
  - ProjectPath: ../minixr1_needle_multiscene
- Path: Assets/Scenes/arginine_scene2.unity  
  Projects:
  - ProjectPath: ../minixr1_needle_multiscene
- Path: Assets/Scenes/multiscene_root.unity
  Projects:
  - ProjectPath: ../minixr1_needle_multiscene
```

---

## Phase 2: Web側の実装 (Next.js)

### 2.1 プロジェクト構造

```
minixr1_needle_multiscene/
├── src/
│   ├── pages/
│   │   ├── index.tsx              # ホームページ (シーン選択)
│   │   ├── [scene].tsx            # 動的ルーティング
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── needleEngine.tsx           # Needle Engineコンポーネント
│   └── generated/
│       ├── gen.js                 # 自動生成
│       ├── meta.json              # 自動生成
│       └── register_types.ts      # 自動生成
├── public/
│   └── assets/
│       ├── multiscene_root.glb
│       ├── arginine_scene1.glb
│       └── arginine_scene2.glb
├── package.json
├── needle.config.json
└── next.config.js
```

### 2.2 動的ルーティングページの実装

**ファイル:** `src/pages/[scene].tsx`

**核となる設定:**

```tsx
// シーン設定オブジェクト
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
```

**重要な実装ポイント:**

1. **URLパラメータの取得**
   ```tsx
   const router = useRouter()
   const { scene } = router.query
   ```

2. **シーン検証**
   ```tsx
   useEffect(() => {
     if (typeof scene === 'string' && scene in SCENE_CONFIG) {
       setCurrentScene(scene as SceneName)
       setIsValidScene(true)
     } else if (scene) {
       setIsValidScene(false)
     }
   }, [scene])
   ```

3. **NeedleEngineコンポーネント使用**
   ```tsx
   <NeedleEngine
     src={sceneConfig.glb}
     style={{
       left: "0",
       top: "0",
       width: '100%', 
       height: '100%',
     }}
   />
   ```

### 2.3 ホームページの実装

**ファイル:** `src/pages/index.tsx`

**主要機能:**
- シーン選択UI
- 各シーンへのナビゲーション
- 直接URLアクセスの説明

**重要なコンポーネント:**

```tsx
// シーン選択カード
{Object.entries(SCENE_CONFIG).map(([sceneName, config]) => (
  <Link
    key={sceneName}
    href={`/${sceneName}`}
    className="group block transform rounded-xl bg-white p-6 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
  >
    <div className="flex items-center space-x-4">
      <div className="text-3xl">{config.icon}</div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
          {config.name}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {config.description}
        </p>
      </div>
    </div>
  </Link>
))}
```

### 2.4 Needle Engine設定

**ファイル:** `needle.config.json`

```json
{
  "baseUrl": "./assets",
  "buildDirectory": "dist", 
  "assetsDirectory": "public/assets",
  "scriptsDirectory": "src/scripts",
  "codegenDirectory": "src/generated"
}
```

**ファイル:** `next.config.js`

```javascript
// Needle Engineのプラグインを使用
// 静的エクスポート設定も含む
```

---

## Phase 3: よくある問題と解決方法

### 3.1 SSRハイドレーションエラー

**エラー:** `Text content does not match server-rendered HTML`

**原因:** `window.location.origin`がサーバー側で利用できない

**解決方法:**
```tsx
// ❌ 間違い
<span>{typeof window !== 'undefined' ? window.location.origin : ''}/{sceneName}</span>

// ✅ 正解  
<span>/{sceneName}</span>
```

### 3.2 ImprovedFirstPersonController重複定義エラー

**エラー:**
```
CS0263: Partial declarations must not specify different base classes
CS0111: Type already defines a member with the same parameter types
```

**原因:** 2箇所でクラスが定義されている
- `Assets/Needle/Components.codegen/ImprovedFirstPersonController.cs`
- `Assets/Scripts/minixrNPM.codegen/ImprovedFirstPersonController.cs`

**解決方法:**
```bash
# 古い方を削除
rm minixr1/Assets/Needle/Components.codegen/ImprovedFirstPersonController.cs
rm minixr1/Assets/Needle/Components.codegen/ImprovedFirstPersonController.cs.meta
```

### 3.3 API Routes静的エクスポートエラー

**エラー:** `API Routes cannot be used with "output: export"`

**解決方法:**
```bash
# 不要なAPIフォルダを削除
rm -rf src/pages/api
```

---

## Phase 4: テスト手順

### 4.1 開発サーバー起動

```bash
cd minixr1_needle_multiscene
npm run dev
```

**アクセスURL:** `https://localhost:3000` (または3001)

### 4.2 動作確認項目

**ホームページ (`/`):**
- [x] シーン一覧表示
- [x] 各シーンカードのホバーエフェクト
- [x] レスポンシブデザイン

**各シーンページ:**
- [x] `/multiscene_root` - SceneSwitcher動作
- [x] `/arginine_scene1` - 3Dシーン表示
- [x] `/arginine_scene2` - 3Dシーン表示

**ナビゲーション:**
- [x] ホームからシーンへの遷移
- [x] シーン間の移動
- [x] ブラウザの戻る/進むボタン
- [x] 直接URL入力でのアクセス

**エラーハンドリング:**
- [x] 存在しないシーンへのアクセス
- [x] 適切なエラーメッセージ表示
- [x] ホームへの戻りリンク

---

## Phase 5: デプロイメント

### 5.1 本番ビルド

```bash
cd minixr1_needle_multiscene
npm run build
```

### 5.2 GitHub Actions設定

**ファイル:** `.github/workflows/deploy.yml`

```yaml
# Needle Cloudへの自動デプロイ設定
# NEEDLE_CLOUD_TOKEN secretが必要
```

### 5.3 確認項目

- [x] GLBファイルが正しく含まれている
- [x] 静的アセットの配置が正しい
- [x] HTTPSでの動作確認

---

## Phase 6: 新しいシーンの追加方法

### 6.1 Unity側

1. **新しいシーンを作成**
   ```
   Assets/Scenes/new_scene.unity
   ```

2. **Needle Engineコンポーネント追加**
   ```
   Directory: ../minixr1_needle_multiscene
   ```

3. **SceneSwitcherに追加** (必要に応じて)
   ```
   multiscene_root.unity の SceneSwitcher.scenes に追加
   ```

4. **ビルド実行**

### 6.2 Web側

1. **SCENE_CONFIGに追加**
   ```tsx
   // src/pages/[scene].tsx と src/pages/index.tsx の両方
   'new_scene': {
     glb: './assets/new_scene.glb',
     name: '新しいシーン',
     description: '新しいシーンの説明',
     icon: '🆕'
   }
   ```

2. **TypeScript型に追加**
   ```tsx
   type SceneName = keyof typeof SCENE_CONFIG
   ```

---

## 参考情報

### ファイル構造まとめ

**Unity側の重要ファイル:**
```
minixr1/
├── Assets/Scenes/
│   ├── multiscene_root.unity (SceneSwitcher付き)
│   ├── arginine_scene1.unity (Needle Engine付き)
│   └── arginine_scene2.unity (Needle Engine付き)
└── ProjectSettings/
    └── NeedleExporterSceneData.asset
```

**Web側の重要ファイル:**
```
minixr1_needle_multiscene/
├── src/pages/
│   ├── index.tsx (ホームページ)
│   └── [scene].tsx (動的ルーティング)
├── public/assets/
│   ├── multiscene_root.glb
│   ├── arginine_scene1.glb
│   └── arginine_scene2.glb
└── needle.config.json
```

### 重要な関数・コンポーネント

**React Hooks:**
- `useRouter()` - Next.jsのルーティング
- `useEffect()` - シーン検証
- `useState()` - 状態管理

**Needle Engine:**
- `<needle-engine>` - 3Dシーン表示
- `SceneSwitcher` - Unity側のシーン切り替え
- 自動生成されるTypeScript型定義

### デバッグTips

1. **コンソールでエラー確認**
2. **Network TabでGLBファイル読み込み確認**  
3. **Unity ConsoleでNeedle Engineのログ確認**
4. **開発者ツールでReactコンポーネントの状態確認**

---

## まとめ

このガイドに従うことで、Unity + Needle Engine + Next.jsを使用したマルチシーンWebアプリケーションを実装できます。各フェーズを順序通りに実行し、エラーが発生した場合は「よくある問題と解決方法」を参照してください。

**実装時間の目安:**
- Unity側設定: 30-60分
- Web側実装: 1-2時間  
- テスト・デバッグ: 30-60分
- **合計: 2-4時間**