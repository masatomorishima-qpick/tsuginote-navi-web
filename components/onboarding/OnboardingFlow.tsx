"use client"

import { useState } from "react"
import {
  Smartphone,
  Globe,
  Lock,
  CheckCircle2,
  ArrowRight,
  Tablet,
  Laptop,
  Monitor,
  Sparkles,
  Plus,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  /**
   * Onboarding 完了時に呼ばれる。nextPath を渡すと、その URL に遷移する。
   * 未指定の場合は親側のデフォルト（通常は /digital）に従う。
   */
  onComplete?: (nextPath?: string) => void
}

const steps = [
  {
    id: 1,
    title: "デジタル資産を登録",
    description: "よく使うサービスを1つ登録しましょう",
    icon: Globe,
    placeholder: "PayPay、Amazon など",
  },
  {
    id: 2,
    title: "デバイスを登録",
    description: "お使いのスマートフォンを登録しましょう",
    icon: Smartphone,
    placeholder: "iPhone、Android など",
  },
  {
    id: 3,
    title: "パスワードを登録",
    description: "デバイスの解除コードを安全に保管",
    icon: Lock,
    isPremium: true,
  },
]

const categoryMap: Record<string, string> = {
  '決済': 'finance',
  'ショッピング': 'shopping',
  '動画': 'subscription',
  'SNS': 'sns',
  '連絡': 'other',
  '銀行': 'finance',
};

const popularAssets = [
  { name: "PayPay", category: "決済" },
  { name: "Amazon", category: "ショッピング" },
  { name: "Netflix", category: "動画" },
  { name: "Instagram", category: "SNS" },
  { name: "LINE", category: "連絡" },
  { name: "楽天銀行", category: "銀行" },
]

const deviceTypes = [
  { name: "iPhone", icon: Smartphone, badge: null },
  { name: "Android", icon: Smartphone, badge: null },
  { name: "iPad", icon: Tablet, badge: null },
  { name: "Mac", icon: Laptop, badge: null },
  { name: "Windows PC", icon: Monitor, badge: null },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 選択したサービス・デバイスを保存してから onComplete を呼ぶ
  // Step 3 の「次にできること」カードからは nextPath を渡して個別 URL に遷移する。
  const handleComplete = async (nextPath?: string) => {
    if (isSaving) return
    setIsSaving(true)
    try {
      // デジタル資産の保存（未選択ならスキップ）
      if (selectedAsset !== null) {
        const selectedAssetData = popularAssets.find(
          (a) => a.name === selectedAsset
        )
        const res = await fetch('/api/digital/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_name: selectedAsset,
            category: categoryMap[selectedAssetData?.category ?? ''] ?? 'other',
            death_action: 'undecided',
          }),
        })
        if (!res.ok) {
          console.error(
            '[OnboardingFlow] asset save failed',
            res.status,
            await res.text()
          )
        }
      }
      // デバイスの保存（未選択ならスキップ）
      // disposal_status は必須項目なので、初期値 'in_use'（使用中）で保存。
      // 後から /digital/devices/[id] で変更可能。
      if (selectedDevice !== null) {
        const res = await fetch('/api/digital/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_name: selectedDevice,
            disposal_status: 'in_use',
          }),
        })
        if (!res.ok) {
          console.error(
            '[OnboardingFlow] device save failed',
            res.status,
            await res.text()
          )
        }
      }
    } catch (err) {
      console.error('[OnboardingFlow] save failed', err)
    } finally {
      setIsSaving(false)
    }
    onComplete?.(nextPath)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      void handleComplete()
    }
  }

  const handleSkip = () => {
    void handleComplete()
  }

  // -----------------------------------------------------------------------
  // Welcome 画面（チュートリアル導入）— 「はじめる」を押すまで表示
  // -----------------------------------------------------------------------
  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* 本体 — Apple 風シンプルなウェルカム */}
        <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto text-center space-y-8">
            {/* アイコン */}
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-emerald-700" />
            </div>

            {/* タイトル（大きく） */}
            <h1 className="text-3xl font-bold text-foreground leading-tight tracking-tight">
              ようこそ、<br />
              つぎの手ナビ<br />
              デジタル資産へ
            </h1>

            {/* サブ */}
            <p className="text-base text-foreground/90">
              もしものときの準備、始めましょう。
            </p>

            {/* 説明 */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              さっそく 3 ステップ（1〜2 分）で、初期設定を行います。
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="sticky bottom-0 p-6 bg-background/80 backdrop-blur-lg border-t border-border">
          <div className="space-y-3">
            <Button
              onClick={() => setShowWelcome(false)}
              className="w-full h-14 rounded-2xl text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            >
              はじめる
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSaving}
              className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              あとで設定する
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
          {currentStep !== 2 && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              スキップ
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                index <= currentStep ? "bg-emerald-600" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto">
        {currentStep === 0 && (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-emerald-700" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                デジタル資産を登録
              </h1>
              <p className="text-muted-foreground text-balance">
                よく使うサービスを1つ選んでください
              </p>
              <p className="text-sm text-gray-400">
                後からいつでも追加・変更できます
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {popularAssets.map((asset) => (
                <button
                  key={asset.name}
                  onClick={() => setSelectedAsset(asset.name)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                    selectedAsset === asset.name
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-transparent bg-card hover:bg-secondary border border-gray-200"
                  )}
                >
                  <p className="font-medium text-foreground">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-emerald-700" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                デバイスを登録
              </h1>
              <p className="text-muted-foreground text-balance">
                お使いのデバイスを1つ選んでください
              </p>
            </div>

            <div className="space-y-3">
              {deviceTypes.map((device) => {
                const IconComponent = device.icon
                return (
                  <button
                    key={device.name}
                    onClick={() => setSelectedDevice(device.name)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4",
                      selectedDevice === device.name
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-transparent bg-card hover:bg-secondary border border-gray-200"
                    )}
                  >
                    <IconComponent className="w-6 h-6 text-muted-foreground" />
                    <p className="font-medium text-foreground">{device.name}</p>
                    {device.badge && (
                      <span className="text-[11px] text-muted-foreground ml-auto mr-2">
                        {device.badge}
                      </span>
                    )}
                    {selectedDevice === device.name && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 py-8">
            {/* 完了の達成感 */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-3xl flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-700" />
              </div>
              <h1 className="text-3xl font-bold text-foreground leading-tight tracking-tight">
                準備完了！
              </h1>
              <p className="text-base text-muted-foreground">
                {selectedAsset && selectedDevice
                  ? `${selectedAsset} と ${selectedDevice} を登録しました。`
                  : selectedAsset
                  ? `${selectedAsset} を登録しました。`
                  : selectedDevice
                  ? `${selectedDevice} を登録しました。`
                  : '初期設定が完了しました。'}
              </p>
            </div>

            {/* 次にできること */}
            <div className="space-y-3">
              <p className="px-1 text-sm font-semibold text-foreground">
                次にできること
              </p>

              <button
                type="button"
                onClick={() => void handleComplete('/digital/assets/new')}
                disabled={isSaving}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">サービスをもっと追加</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    SNS・金融など 7 カテゴリで整理
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => void handleComplete('/digital/devices')}
                disabled={isSaving}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-medium text-foreground">
                      デバイスのパスワードを保管
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                     有料プラン
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    マスターコードで安全に保管
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => void handleComplete('/digital/share')}
                disabled={isSaving}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-medium text-foreground">大切な方を招待</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                     有料プラン
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    最大 10 名まで連携アカウントで共有
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 p-6 bg-background/80 backdrop-blur-lg border-t border-border">
        {currentStep === 2 ? (
          // Step 3 = 完了画面：シンプルに「ダッシュボードへ」のみ（スキップ導線不要）
          <Button
            onClick={() => void handleComplete()}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
          >
            ダッシュボードへ
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          // Step 1, 2 = 「次へ」ボタン（未選択時は disabled）
          <Button
            onClick={handleNext}
            className="w-full h-14 rounded-2xl text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={
              (currentStep === 0 && !selectedAsset) ||
              (currentStep === 1 && !selectedDevice)
            }
          >
            次へ
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default OnboardingFlow
