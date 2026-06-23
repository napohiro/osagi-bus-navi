# 長木バスナビ

福岡県行橋市 長木バス停の時刻表アプリ（太陽交通 香春線）

## 概要

- 長木バス停 ⇔ 行橋駅東口 の時刻表を確認できます
- 次のバス・本日の全時刻表・路線情報を表示します
- スマートフォンに最適化した高齢者向けデザインです
- Netlify でホスティングしています

## 時刻表データについて

`src/data/busData.js` に時刻表データが入っています。

- **ダイヤ改正：2026年4月1日**
- **確認日：2026年6月23日**

このアプリは自動で時刻表を取得していません。
時刻表変更時は公式情報を確認し、`busData.js` を手動で更新してください。

### 公式参照先

| 情報 | URL |
|------|-----|
| 太陽交通 時刻表 | https://www.taiyo-koutu.co.jp/bus/timetable/kawara.html |
| 太陽交通 運賃表 | https://www.taiyo-koutu.co.jp/bus/fares/kawara.html |
| 行橋市 路線バス情報 | https://www.city.yukuhashi.fukuoka.jp/soshiki/23/1648.html |

## 将来的な自動更新案

- GitHub Actions で月1回、公式ページの変更を確認
- 公式ページに変更があった場合、Issue を作成
- 管理者が公式 PDF / 時刻表を確認して `busData.js` を更新
- 自動で勝手に時刻表を書き換えない
- 理由：公共交通の時刻表は誤表示すると利用者に迷惑がかかるため、人間の確認を必須にする

## 開発

```bash
npm install
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run preview  # ビルド後のプレビュー
```

## ライセンス

個人利用・家族向けアプリ
