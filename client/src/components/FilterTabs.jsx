const tabs = ['Daily', 'Weekly', 'Monthly'];

export default function FilterTabs({ active, onChange }) {
  return (
    <div className="px-4">
      <div className="grid grid-cols-3 rounded-full bg-[#DDF2E7] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              active === tab ? 'bg-brand text-white shadow-soft' : 'text-slateSoft'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
