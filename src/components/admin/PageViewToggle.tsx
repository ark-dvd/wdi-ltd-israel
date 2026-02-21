'use client';

/**
 * Shared toggle for CMS tabs that have both content list and page settings views.
 */
interface PageViewToggleProps {
  showSettings: boolean;
  onToggle: (show: boolean) => void;
}

export function PageViewToggle({ showSettings, onToggle }: PageViewToggleProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit" dir="rtl">
      <button
        onClick={() => onToggle(false)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
          !showSettings ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
        type="button"
      >
        תוכן
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
          showSettings ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
        type="button"
      >
        הגדרות עמוד
      </button>
    </div>
  );
}
