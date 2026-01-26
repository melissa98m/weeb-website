import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function Autocomplete({
  id,
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  fetchOptions = async () => [],
  getOptionLabel = (opt) => String(opt?.label ?? opt?.value ?? ""),
  getOptionValue = (opt) => opt?.value ?? opt?.id ?? null,
  formatDisplayValue = (opt) => getOptionLabel(opt),
  minSearchLength = 2,
  debounceMs = 300,
}) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState(null);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Styles
  const inputBase =
    "w-full rounded-xl border px-3 py-2 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";
  const inputThemed =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] placeholder:text-white/50 focus:ring-2 focus:ring-white/20 focus:border-white/30"
      : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-gray-300";

  const dropdownBase =
    "absolute z-50 w-full mt-1 rounded-xl border shadow-lg max-h-60 overflow-auto";
  const dropdownThemed =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] shadow-black/50"
      : "bg-white border-gray-200 shadow-gray-200/50";

  const optionBase = "px-3 py-2 cursor-pointer transition";
  const optionThemed =
    theme === "dark"
      ? "hover:bg-white/10 text-white"
      : "hover:bg-gray-100 text-gray-900";
  const optionHighlighted =
    theme === "dark" ? "bg-white/20" : "bg-gray-200";

  // reset when the external value changes (for example, after submitting the form)
  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      setSearchQuery("");
    }
  }, [value]);

  // Search with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length < minSearchLength) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Cancel the previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      try {
        const results = await fetchOptions(searchQuery.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setOptions(results || []);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }
      } catch (error) {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          console.error("Erreur lors de la recherche:", error);
          setOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, fetchOptions, minSearchLength, debounceMs]);

  // Close the dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle the selection of an option
  const handleSelect = useCallback(
    (option) => {
      const optionValue = getOptionValue(option);
      setSelectedOption(option);
      setSearchQuery(""); // Reset the search after selection
      setIsOpen(false);
      setHighlightedIndex(-1);
      onChange(optionValue);
    },
    [onChange, getOptionValue]
  );

  // Handle the text change
  const handleInputChange = useCallback((e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    // If the user starts typing, reset the previous selection
    if (newQuery.trim().length > 0 && selectedOption) {
      setSelectedOption(null);
      onChange(null);
    } else if (newQuery.trim().length === 0) {
      setSelectedOption(null);
      onChange(null);
    }
  }, [onChange, selectedOption]);

  // Handle the keyboard keys
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen && options.length > 0) {
            setIsOpen(true);
          }
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
            handleSelect(options[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [disabled, isOpen, options, highlightedIndex, handleSelect]
  );

  // Display the selected value or the search
  const displayValue = useMemo(() => {
    // If there is a selected option and the user is not typing, display the option
    if (selectedOption && searchQuery.trim().length === 0) {
      return formatDisplayValue(selectedOption);
    }
    // Otherwise, display what the user is typing
    return searchQuery;
  }, [selectedOption, searchQuery, formatDisplayValue]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        className={`${inputBase} ${inputThemed}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchQuery.trim().length >= minSearchLength && options.length > 0) {
            setIsOpen(true);
          }
        }}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      {isOpen && options.length > 0 && (
        <ul
          id={`${id}-listbox`}
          className={`${dropdownBase} ${dropdownThemed}`}
          role="listbox"
        >
          {options.map((option, index) => {
            const label = getOptionLabel(option);
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={getOptionValue(option) ?? index}
                className={`${optionBase} ${optionThemed} ${
                  isHighlighted ? optionHighlighted : ""
                }`}
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
      {isOpen && !loading && searchQuery.trim().length >= minSearchLength && options.length === 0 && (
        <ul
          className={`${dropdownBase} ${dropdownThemed}`}
          role="listbox"
        >
          <li className={`${optionBase} text-gray-500 cursor-default`}>
            Aucun résultat trouvé
          </li>
        </ul>
      )}
    </div>
  );
}

export default React.memo(Autocomplete);

