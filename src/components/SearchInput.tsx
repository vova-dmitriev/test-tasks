type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="search-field">
      <span className="search-label">Search</span>
      <input
        className="search-input"
        aria-label="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search events"
      />
    </label>
  );
}
