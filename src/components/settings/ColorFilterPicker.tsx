import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type ColorFilter = "none" | "protanopia" | "deuteranopia" | "tritanopia";

const colorFilterOptions: Array<{ value: ColorFilter; label: string; description?: string }> = [
  { value: "none", label: "None" },
  { value: "protanopia", label: "Red/Green Filter", description: "Protanopia" },
  { value: "deuteranopia", label: "Green/Red Filter", description: "Deuteranopia" },
  { value: "tritanopia", label: "Blue/Yellow Filter", description: "Tritanopia" },
];

export default function ColorFilterPicker() {
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusSelectedRef = useRef(false);
  const [selectedFilter, setSelectedFilter] = useState<ColorFilter>("none");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !focusSelectedRef.current) return;
    const selectedIndex = colorFilterOptions.findIndex(({ value }) => value === selectedFilter);
    pickerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[selectedIndex]?.focus();
    focusSelectedRef.current = false;
  }, [isOpen, selectedFilter]);

  useEffect(() => {
    if (!isOpen) return;

    function closeWhenClickingOutside(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    return () => document.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, [isOpen]);

  function selectFilter(filter: ColorFilter) {
    setSelectedFilter(filter);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const selectedIndex = colorFilterOptions.findIndex(({ value }) => value === selectedFilter);
    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (selectedIndex + offset + colorFilterOptions.length) % colorFilterOptions.length;
    event.preventDefault();

    if (!isOpen) {
      focusSelectedRef.current = true;
      setIsOpen(true);
      return;
    }

    pickerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
  }

  return (
    <div
      className={`preference-filter-picker${isOpen ? " is-open" : ""}`}
      ref={pickerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        className="preference-select-row"
        type="button"
        aria-expanded={isOpen}
        aria-controls="color-filter-options"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Colour Filters</span>
        <span className="preference-select-value">
          {colorFilterOptions.find(({ value }) => value === selectedFilter)?.label}
        </span>
        <ChevronDown className="preference-select-chevron" size={16} aria-hidden="true" />
      </button>

      <div
        className="preference-filter-options"
        id="color-filter-options"
        role="radiogroup"
        aria-label="Colour Filters"
        hidden={!isOpen}
      >
        {colorFilterOptions.map(({ value, label, description }) => (
          <button
            key={value}
            className="preference-filter-option"
            type="button"
            role="radio"
            aria-checked={selectedFilter === value}
            onClick={() => selectFilter(value)}
          >
            <span className="preference-radio" aria-hidden="true" />
            <span className="preference-option-copy">
              <span>{label}</span>
              {description && <small>{description}</small>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
