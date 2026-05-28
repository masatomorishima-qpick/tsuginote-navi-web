import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Phase1 PIN / Phase1.5 死後開示: crypto.subtle の直接使用は lib/crypto/ 配下の
  // 専用モジュール（pin.ts / envelope.ts）だけに許可。
  // それ以外で暗号処理を書くと「暗号ロジックは crypto/ に集約」ルールが崩れる。
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["lib/crypto/pin.ts", "lib/crypto/envelope.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='crypto'][property.name='subtle']",
          message:
            "crypto.subtle の直接呼び出しは禁止です。暗号処理は lib/crypto/pin.ts または lib/crypto/envelope.ts のラッパー関数を使ってください。",
        },
        {
          selector:
            "MemberExpression[object.object.name='window'][object.property.name='crypto'][property.name='subtle']",
          message:
            "window.crypto.subtle の直接呼び出しは禁止です。暗号処理は lib/crypto/ 配下の専用モジュールを使ってください。",
        },
      ],
    },
  },
]);

export default eslintConfig;
