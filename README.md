# PRD：今天該面對什麼 — 艾森豪決策矩陣待辦應用

**版本：** 1.0  
**日期：** 2026-05-30  
**技術棧：** React 19 + TypeScript + Vite + dnd-kit

---

## 一、產品概述

「今天該面對什麼」是一款基於**艾森豪決策矩陣**（Eisenhower Matrix）的個人待辦事項管理工具，協助使用者依「重要程度」與「緊急程度」兩個維度，將任務分類至四個象限，做出有效的優先順序決策。

---

## 二、目標使用者

- 需要管理大量待辦事項、容易感到不知從何下手的個人使用者
- 重視任務優先順序規劃的知識工作者

---

## 三、核心功能需求

### 3.1 四象限矩陣（Matrix View）

| 象限 | 標籤 | 說明 | 行動建議 |
|------|------|------|----------|
| Q1 | 火燒屁股了！ | 重要 × 緊急 | Do First — 立即處理 |
| Q2 | 有空一定要做 | 重要 × 不緊急 | Schedule — 排程規劃 |
| Q3 | 這誰的事啊？ | 不重要 × 緊急 | Delegate — 授權他人 |
| Q4 | 晚點再點開 | 不重要 × 不緊急 | Eliminate — 考慮刪除 |

- 每個象限顯示待辦任務卡片，含任務名稱、備註、截止日期
- 支援跨象限**拖曳移動**任務（dnd-kit，拖曳觸發距離 6px）
- 每個象限有「新增任務」按鈕

### 3.2 清單檢視（List View）

- 以象限分組顯示所有任務，按 Q1→Q2→Q3→Q4 排序
- 篩選器：**待辦** / **全部** / **已完成**，附即時數量
- 每個分組可收合 / 展開
- 整合 TodoCard 元件，操作與矩陣一致

### 3.3 日曆檢視（Calendar View）

- 月曆格式，可前後翻月，一鍵跳回今天
- 有設截止日的任務以**彩色圓點**標示在對應日期（最多顯示 4 個，超出顯示 +N）
- 圓點顏色對應象限顏色
- 逾期且未完成的日期顯示 ⚠ 警示
- 點選日期展開側欄查看當日任務，支援完成 / 編輯 / 刪除
- 側欄下方顯示「尚未設定截止日」任務列表

### 3.4 任務管理（CRUD）

**新增 / 編輯任務（Modal）**

- 任務名稱（必填，最多 50 字）
- 備註描述（選填）
- 截止日期（選填，日期選擇器，不可選過去）
- 分配象限（Radio 選擇，視覺化顯示象限顏色）
- 點擊背景遮罩可關閉 Modal
- 開啟時自動 focus 到標題欄位

**其他操作**

- 勾選完成 / 取消完成（Toggle）
- 刪除任務
- Header 顯示全站待辦數量 badge

### 3.5 資料持久化

- 使用 **localStorage**（key: `matrix-todo-v1`）在本地儲存所有任務
- 頁面重整後資料不流失

---

## 四、資料模型

```typescript
interface Todo {
  id: string;          // UUID v4
  title: string;       // 最多 50 字
  note: string;        // 備註
  deadline?: string;   // YYYY-MM-DD，選填
  quadrant: 'q1' | 'q2' | 'q3' | 'q4';
  completed: boolean;
  createdAt: number;   // Unix timestamp
}
```

---

## 五、檢視切換

Header 右側提供三個切換按鈕：

- ⊞ 矩陣（預設）
- ☰ 清單
- 📅 日曆

---

## 六、非功能需求

| 項目 | 說明 |
|------|------|
| 語系 | 繁體中文 |
| 平台 | 純前端 Web（SPA），無需後端 |
| 儲存 | 本地 localStorage，無雲端同步 |
| 效能 | 拖曳動畫 150ms ease；Pointer 感應器避免意外觸發 |
| 無障礙 | Modal 含 `role="dialog" aria-modal="true"`；按鈕含 `aria-label` |
| 型別安全 | 全 TypeScript，嚴格型別定義 |

---

## 七、測試

### 執行方式

```bash
npm test            # 單次執行
npm run test:watch  # 監控模式（開發時即時回饋）
```

> **Pre-push hook：** 每次 `git push` 前會自動執行測試，任何失敗都會中止推送。

### 測試涵蓋範圍

測試對象：`src/hooks/useTodos.ts` 內的 `reducer` 函數（核心業務邏輯）

| 分類 | 測試項目 |
|------|----------|
| **ADD**（6）| 新增一筆 todo、預設 completed 為 false、自動產生 id 與 createdAt、id 不重複、原有資料不受影響、可帶 deadline |
| **UPDATE**（4）| 更新 title、更新 note 與 deadline、不存在的 id 時 state 不變、只更新目標 todo |
| **DELETE**（4）| 刪除指定 id、其他 todo 保持不變、不存在的 id 時 state 不變、刪到空陣列 |
| **TOGGLE_COMPLETE**（5）| false → true、true → false、連續 toggle 兩次回原始值、不存在的 id 時 state 不變、只改目標 todo |
| **MOVE**（5）| 移動到指定象限、移到相同象限、不存在的 id 時 state 不變、只移動目標 todo、可移動到四個象限任一個 |
| **Immutability**（3）| ADD / UPDATE / DELETE 皆不修改原始 state |

共 **27 個測試**，工具：[Vitest](https://vitest.dev/)

---

## 八、未來可延伸方向（Out of Scope）

- 雲端同步 / 帳號登入
- 多人協作
- 行動 App（PWA / Native）
- 子任務 / 標籤
- 通知提醒（截止日警示推播）
