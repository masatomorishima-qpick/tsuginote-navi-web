'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

type DigitalHeaderProps = {
  userEmail: string | null;
};

export default function DigitalHeader({ userEmail }: DigitalHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createDigitalBrowserClient();
      await supabase.auth.signOut();
      router.replace('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* ロゴ */}
        <Link
          href="/digital"
          className="flex flex-shrink-0 items-baseline gap-2 whitespace-nowrap"
        >
          <span className="text-lg font-bold text-slate-900">つぎの手ナビ</span>
          <span className="text-xs text-slate-500">デジタル資産</span>
        </Link>

        {/* PC用ナビ（lg 以上で展開） */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/digital"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ダッシュボード
          </Link>
          <Link
            href="/digital/settings"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            設定
          </Link>
          <div className="mx-2 h-6 w-px bg-slate-200" aria-hidden="true" />
          {userEmail && (
            <span className="hidden max-w-[160px] truncate whitespace-nowrap text-xs text-slate-500 xl:inline">
              {userEmail}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ログアウト
          </button>
        </nav>

        {/* モバイル/タブレット用ハンバーガー（lg 未満） */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="メニューを開く"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* モバイル/タブレット用メニュー */}
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/digital"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              ダッシュボード
            </Link>
            <Link
              href="/digital/settings"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              設定
            </Link>
            <div className="my-2 h-px bg-slate-200" aria-hidden="true" />
            {userEmail && (
              <span className="px-3 py-1 text-xs text-slate-500">{userEmail}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              ログアウト
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
