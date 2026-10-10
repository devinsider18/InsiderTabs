import { Info } from "lucide-react";

interface PreferenceToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

export default function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <div className={`preference-row${description ? " has-description" : ""}`}>
      <span className="preference-copy">
        <span className="preference-label">
          {label}
          <Info size={13} aria-hidden="true" />
        </span>
        {description && <span className="preference-description">{description}</span>}
      </span>
      <button
        className={`preference-switch${checked ? " is-on" : ""}`}
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
