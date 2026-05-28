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
  Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete?: () => void
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
  { name: "Android", icon: Smartphone, badge: "Android" },
  { name: "iPad", icon: Tablet, badge: null },
  { name: "Mac", icon: Laptop, badge: null },
  { name: "Windows PC", icon: Monitor, badge: null },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 選択したサービス・デバイスを保存してから onComplete を呼ぶ
  const handleComplete = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      // デジタル資産の保存（未選択ならスキップ）
      if (selectedAsset !== null) {
        const selectedAssetData = popularAssets.find(
          (a) => a.name === selectedAsset
        )
        await fetch('/api/digital/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_name: selectedAsset,
            category: categoryMap[selectedAssetData?.category ?? ''] ?? 'other',
            death_action: 'undecided',
          }),
        })
      }
      // デバイスの保存（未選択ならスキップ）
      if (selectedDevice !== null) {
        await fetch('/api/digital/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_name: selectedDevice,
          }),
        })
      }
    } catch (err) {
      console.error('[OnboardingFlow] save failed', err)
    } finally {
      setIsSaving(false)
    }
    onComplete?.()
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
          <div className="space-y-6 py-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-emerald-700" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                パスワードを安全に残せます
              </h1>
              <p className="text-muted-foreground text-balance">
                運営も見られない暗号化で、大切な方だけに届けます
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm border border-emerald-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">STANDARD</h3>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full font-medium">
                    30日間無料
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-foreground">スマホ・PCのパスワード保管</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-foreground">大切な人への連携アカウント</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-foreground">デジタル資産・サービスの登録（無制限）</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-center">
                    <span className="text-sm text-muted-foreground">連携者1名ごと </span>
                    <span className="text-3xl font-bold text-foreground">¥110</span>
                    <span className="text-muted-foreground"> / 月（税込）</span>
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    30日間は無料。いつでも解約できます
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-[15px] text-muted-foreground my-4">
              大切な方が困らない準備を、今日から。
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 p-6 bg-background/80 backdrop-blur-lg border-t border-border">
        {currentStep === 2 ? (
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="w-full h-14 rounded-2xl text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            >
              無料トライアルを開始
            </Button>
            <button
              onClick={handleSkip}
              disabled={isSaving}
              className="w-full text-center text-[13px] text-muted-foreground"
            >
              今はスキップ
            </button>
          </div>
        ) : (
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
