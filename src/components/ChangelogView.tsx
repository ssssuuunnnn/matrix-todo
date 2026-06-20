import styles from './ChangelogView.module.css';

interface Release {
  version: string;
  date: string;
  type: 'feature' | 'fix';
  items: string[];
}

const RELEASES: Release[] = [
  {
    version: '1.2.0',
    date: '2026-06-20',
    type: 'feature',
    items: [
      'Header 手機版改為兩行排列，新增按鈕僅顯示圖示',
      '手機版操作按鈕（編輯、刪除）常駐顯示，不需 hover',
      '新增「移至象限」功能：手機底部 action sheet 選擇目標象限',
      '日曆視圖手機版左右滿版，統一間距',
      '矩陣模式隱藏手機版座標軸標籤',
      'URL hash 同步檢視模式（重新整理不跑回矩陣）',
      '新增 Footer：GitHub、LinkedIn 連結',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-20',
    type: 'feature',
    items: [
      '新增 Google 帳號登入（Firebase Auth）',
      '登入後任務自動同步至 Firestore，支援跨裝置即時更新',
      '首次登入自動將本地資料遷移至雲端',
      '未登入時維持 localStorage 本地儲存',
      '新增 Google Analytics 追蹤',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-05-30',
    type: 'feature',
    items: [
      '艾森豪矩陣四象限視圖（Q1–Q4）',
      '支援拖曳移動任務至不同象限',
      '清單視圖：依象限分組，支援篩選待辦 / 全部 / 已完成',
      '日曆視圖：月曆格式，彩色圓點標示截止日',
      '任務 CRUD：新增、編輯、刪除、完成切換',
      '截止日逾期 / 快到期警示',
      'localStorage 本地儲存，重新整理不流失',
    ],
  },
];

const TYPE_LABEL: Record<Release['type'], string> = {
  feature: '新功能',
  fix: 'Bug 修正',
};

const TYPE_COLOR: Record<Release['type'], string> = {
  feature: '#4f46e5',
  fix: '#059669',
};

interface Props {
  onBack: () => void;
}

export function ChangelogView({ onBack }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <button className={styles.backBtn} onClick={onBack}>
          ← 返回
        </button>
        <h1 className={styles.title}>更新紀錄</h1>

        <div className={styles.timeline}>
          {RELEASES.map(release => (
            <div key={release.version} className={styles.release}>
              <div className={styles.releaseHeader}>
                <span className={styles.version}>v{release.version}</span>
                <span
                  className={styles.typeBadge}
                  style={{ background: `${TYPE_COLOR[release.type]}18`, color: TYPE_COLOR[release.type] }}
                >
                  {TYPE_LABEL[release.type]}
                </span>
                <span className={styles.date}>{release.date}</span>
              </div>
              <ul className={styles.items}>
                {release.items.map((item, i) => (
                  <li key={i} className={styles.item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
