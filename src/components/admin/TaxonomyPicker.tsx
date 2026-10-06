import type { TaxonomyItem } from '../../types/person'

interface TaxonomyPickerProps {
  label: string
  items: TaxonomyItem[]
  selected: string[]
  onChange: (slugs: string[]) => void
  error?: string
}

// Dropdown se add karo, chip ke × se hatao
function TaxonomyPicker({ label, items, selected, onChange, error }: TaxonomyPickerProps) {
  const available = items.filter((item) => !selected.includes(item.slug))
  const nameOf = (slug: string) => items.find((item) => item.slug === slug)?.name ?? slug

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="mb-2 flex flex-wrap gap-2">
        {selected.map((slug) => (
          <span key={slug} className="inline-flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-sm">
            {nameOf(slug)}
            <button
              type="button"
              aria-label={`Remove ${nameOf(slug)}`}
              onClick={() => onChange(selected.filter((s) => s !== slug))}
              className="rounded-full px-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <select
        aria-label={`Add ${label.toLowerCase()}`}
        value=""
        disabled={selected.length >= 10}
        onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">+ Add {label.toLowerCase()}</option>
        {available.map((item) => (
          <option key={item._id} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default TaxonomyPicker
