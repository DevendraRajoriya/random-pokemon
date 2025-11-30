"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Database, ChevronDown, X, Search, Share2, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SeoContent from "@/components/SeoContent";
import ShareModal from "@/components/ShareModal";
import CardShowcase from "@/components/CardShowcase";

interface PokemonType {
  type: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
}

interface FilterState {
  teamSize: number;
  types: string[];
  legendaryStatus: string[];
  evolutionStage: string[];
  fullyEvolved: string[];
  displayFormat: "both" | "name-only" | "sprite-only";
  genders: string[];
  natures: string[];
  forms: string[];
  regions: string[];
}

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

const REGIONS = [
  { name: "Kanto", range: [1, 151] },
  { name: "Stadium Rentals", range: [1, 151] },
  { name: "Johto", range: [152, 251] },
  { name: "Stadium 2 Rentals", range: [152, 251] },
  { name: "Hoenn", range: [252, 386] },
  { name: "Sinnoh", range: [387, 493] },
  { name: "Sinnoh (Platinum)", range: [387, 493] },
  { name: "Unova", range: [494, 649] },
  { name: "Unova (B2W2)", range: [494, 649] },
  { name: "Kalos", range: [650, 721] },
  { name: "Alola", range: [722, 809] },
  { name: "Alola (USUM)", range: [722, 809] },
  { name: "Galar", range: [810, 905] },
  { name: "Hisui", range: [387, 905] },
  { name: "Paldea", range: [906, 1025] },
  { name: "Kitakami", range: [906, 1025] },
  { name: "Blueberry Academy", range: [906, 1025] },
  { name: "Lumiose City", range: [650, 721] },
];

const LEGENDARY_OPTIONS = [
  "Sub-Legendary",
  "Legendary",
  "Mythical",
  "Paradox",
  "Ultra Beast",
];

const EVOLUTION_STAGES = ["Unevolved", "Evolved Once", "Evolved Twice"];
const FULLY_EVOLVED_OPTIONS = ["Not Fully Evolved", "Fully Evolved"];
const GENDERS = ["Male", "Female", "Genderless"];
const DISPLAY_FORMATS = ["Name Only", "Sprite Only", "Both Name and Sprite"];
const NATURES = [
  "Adamant", "Bold", "Brave", "Calm", "Careful", "Gentle", "Hasty", "Hardy",
  "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty",
  "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Timid", "Bashful", "Docile",
  "Serious",
];
const FORM_OPTIONS = ["Alternate Forms", "Mega Evolutions", "Gigantamax Forms"];

const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380,
  381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 487, 488, 489,
  490, 491, 492, 493, 494, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646,
  647, 648, 649, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727,
  728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742,
  743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755, 756, 757,
  758, 759, 760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772,
  773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787,
  788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802,
  803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817,
  818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832,
]);

interface CompactFilterDropdownProps {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

const CompactFilterDropdown = ({
  label,
  value,
  isOpen,
  onToggle,
  children,
  minWidth = "min-w-[200px]",
  className = "",
}: CompactFilterDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={onToggle}
        className="h-12 w-full px-3 md:px-4 bg-cream hover:bg-charcoal hover:text-cream border-2 border-black font-mono text-xs md:text-sm text-black whitespace-nowrap flex items-center gap-2 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="font-semibold">{label}:</span>
        <span className="font-normal truncate flex-1 text-left">{value}</span>
        <ChevronDown
          size={14}
          className={`transform transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 bg-white border-2 border-black ${minWidth} max-w-[90vw] max-h-[60vh] overflow-y-auto z-50 slasher`}
        >
          <div className="p-3 md:p-4">{children}</div>
        </div>
      )}
    </div>
  );
};

interface MultiSelectCheckboxesProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  showSelectAll?: boolean;
}

const MultiSelectCheckboxes = ({
  options,
  selected,
  onChange,
  showSelectAll = false,
}: MultiSelectCheckboxesProps) => {
  const isAllSelected = options.length > 0 && selected.length === options.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  return (
    <div className="space-y-2">
      {showSelectAll && (
        <label className="flex items-center gap-2 cursor-pointer mb-2 pb-2 border-b border-charcoal">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="font-mono text-xs md:text-sm text-black">
            {isAllSelected ? "Deselect All" : "Select All"}
          </span>
        </label>
      )}
      <div className="grid grid-cols-1 gap-1.5">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-cream p-1">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, option]);
                } else {
                  onChange(selected.filter((s) => s !== option));
                }
              }}
              className="w-4 h-4 cursor-pointer flex-shrink-0"
            />
            <span className="font-mono text-xs md:text-sm text-black">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string) => void;
}

const ActiveFilterChips = ({ filters, onRemoveFilter }: ActiveFilterChipsProps) => {
  const chips: { label: string; key: keyof FilterState; value?: string }[] = [];

  if (filters.teamSize !== 6) {
    chips.push({ label: `SIZE: ${filters.teamSize}`, key: "teamSize" });
  }

  filters.types.forEach((type) => {
    chips.push({ label: `TYPE: ${type.toUpperCase()}`, key: "types", value: type });
  });

  filters.legendaryStatus.forEach((status) => {
    chips.push({ label: `${status.toUpperCase()}`, key: "legendaryStatus", value: status });
  });

  filters.regions.forEach((region) => {
    chips.push({ label: `${region.toUpperCase()}`, key: "regions", value: region });
  });

  filters.evolutionStage.forEach((stage) => {
    chips.push({ label: stage.toUpperCase(), key: "evolutionStage", value: stage });
  });

  filters.fullyEvolved.forEach((evolved) => {
    chips.push({ label: evolved.toUpperCase(), key: "fullyEvolved", value: evolved });
  });

  filters.genders.forEach((gender) => {
    chips.push({ label: `${gender.toUpperCase()}`, key: "genders", value: gender });
  });

  filters.natures.forEach((nature) => {
    chips.push({ label: nature.toUpperCase(), key: "natures", value: nature });
  });

  filters.forms.forEach((form) => {
    chips.push({ label: form.toUpperCase(), key: "forms", value: form });
  });

  if (filters.displayFormat !== "both") {
    chips.push({
      label: `DISPLAY: ${filters.displayFormat.toUpperCase()}`,
      key: "displayFormat",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2">
      {chips.map((chip, index) => (
        <div
          key={index}
          className="bg-marigold text-black px-2 md:px-3 py-1 text-[10px] md:text-xs font-mono flex items-center gap-1.5 slasher border-2 border-black"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="text-black hover:text-charcoal transition-colors"
            aria-label={`Remove ${chip.label}`}
          >
            <X size={12} className="md:w-3.5 md:h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState("IDLE");
  const [searchQuery, setSearchQuery] = useState("");
  const [allPokemon, setAllPokemon] = useState<{ name: string; id: number }[]>([]);
  const [suggestions, setSuggestions] = useState<{ name: string; id: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    teamSize: 6,
    types: [],
    legendaryStatus: [],
    evolutionStage: [],
    fullyEvolved: [],
    displayFormat: "both",
    genders: [],
    natures: [],
    forms: [],
    regions: [],
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [typeCache, setTypeCache] = useState<Record<string, Set<number>>>({});
  const [natureSearch, setNatureSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sharePokemon, setSharePokemon] = useState<Pokemon | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Track if initial team has been generated
  const hasGeneratedInitialTeam = useRef(false);
  
  // Ref for scrolling to team grid
  const teamGridRef = useRef<HTMLDivElement>(null);

  // Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch all Pokemon names on mount for autocomplete
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await response.json();
        const pokemonList = data.results.map((p: { name: string; url: string }) => {
          // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/25/"
          const urlParts = p.url.split("/");
          const id = parseInt(urlParts[urlParts.length - 2]);
          return { name: p.name, id };
        });
        setAllPokemon(pokemonList);
      } catch (error) {
        console.error("Error fetching Pokemon list:", error);
      }
    };
    fetchAllPokemon();
  }, []);

  // Auto-generate team on initial page load for zero-click value
  useEffect(() => {
    if (isClient && !hasGeneratedInitialTeam.current) {
      hasGeneratedInitialTeam.current = true;
      
      // Inline auto-generate to ensure it runs on page load/refresh
      const autoGenerateTeam = async () => {
        setLoading(true);
        setTerminalStatus("FETCHING...");
        
        try {
          // Generate 6 random Pokemon IDs (1-1025)
          const uniqueIds = new Set<number>();
          while (uniqueIds.size < 6) {
            uniqueIds.add(Math.floor(Math.random() * 1025) + 1);
          }
          
          const fetchPromises = Array.from(uniqueIds).map((id) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())
          );
          
          const pokemonData = await Promise.all(fetchPromises);
          setTeam(pokemonData);
          setTerminalStatus("SUCCESS");
          
          // Auto-scroll to the generated Pokemon team
          setTimeout(() => {
            teamGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (error) {
          console.error("Error auto-generating team:", error);
          setTerminalStatus("ERROR");
        } finally {
          setLoading(false);
        }
      };
      
      autoGenerateTeam();
    }
  }, [isClient]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      const filtered = allPokemon
        .filter((p) => p.name.toLowerCase().includes(value.toLowerCase().trim()))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    router.push(`/pokemon/${name}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/pokemon/${searchQuery.toLowerCase().trim()}`);
  };

  const toggleDropdown = useCallback((dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  // Close dropdowns on scroll
  useEffect(() => {
    if (!openDropdown) return;

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside a dropdown menu
      const target = e.target as Element;
      const dropdownElement = target.closest('.max-h-[60vh]');
      if (dropdownElement) return;
      
      closeAllDropdowns();
    };

    const handleWheel = (e: Event) => {
      // Don't close if scrolling inside a dropdown menu
      const target = e.target as Element;
      const dropdownElement = target.closest('.max-h-[60vh]');
      if (dropdownElement) return;
      
      closeAllDropdowns();
    };

    // Attach listeners with capture phase for early detection
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('wheel', handleWheel, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('wheel', handleWheel, true);
    };
  }, [openDropdown, closeAllDropdowns]);

  const getValidPokemonIds = async (): Promise<number[]> => {
    let validIds = new Set<number>();

    if (filters.regions.length > 0) {
      const regionRanges = filters.regions.map((regionName) => {
        const region = REGIONS.find((r) => r.name === regionName);
        return region?.range || [0, 0];
      });

      for (const [start, end] of regionRanges) {
        for (let i = start; i <= end; i++) {
          validIds.add(i);
        }
      }
    } else {
      for (let i = 1; i <= 1025; i++) {
        validIds.add(i);
      }
    }

    if (filters.types.length > 0) {
      const typeIdSets = await Promise.all(
        filters.types.map((type) => getTypeIds(type))
      );
      const allTypeIds = typeIdSets.reduce(
        (acc, set) => new Set([...acc, ...set]),
        new Set<number>()
      );
      validIds = new Set([...validIds].filter((id) => allTypeIds.has(id)));
    }

    if (filters.legendaryStatus.length > 0) {
      const isLegendary = filters.legendaryStatus.includes("Legendary");
      const isNonLegendary = !isLegendary;

      if (isLegendary) {
        validIds = new Set([...validIds].filter((id) => LEGENDARY_IDS.has(id)));
      } else if (isNonLegendary) {
        validIds = new Set([...validIds].filter((id) => !LEGENDARY_IDS.has(id)));
      }
    }

    return Array.from(validIds);
  };

  const getTypeIds = async (typeName: string): Promise<Set<number>> => {
    if (typeCache[typeName]) {
      return typeCache[typeName];
    }

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/type/${typeName}`
      );
      const data = await response.json();
      const ids = new Set<number>(
        data.pokemon
          .map((p: { pokemon: { url: string } }) => {
            const id = parseInt(p.pokemon.url.split("/")[6]);
            return id <= 1025 ? id : null;
          })
          .filter((id: number | null): id is number => id !== null)
      );

      setTypeCache((prev) => ({
        ...prev,
        [typeName]: ids,
      }));

      return ids;
    } catch (error) {
      console.error("Error fetching type data:", error);
      return new Set();
    }
  };

  const generateTeam = async () => {
    setLoading(true);
    setTerminalStatus("FETCHING...");
    setTeam([]);

    try {
      const validIds = await getValidPokemonIds();

      if (validIds.length === 0) {
        setTerminalStatus("NO MATCHES");
        return;
      }

      const uniqueIds = new Set<number>();
      const teamSize = Math.min(filters.teamSize, validIds.length);
      const maxAttempts = Math.min(validIds.length, teamSize * 10);
      let attempts = 0;

      while (uniqueIds.size < teamSize && attempts < maxAttempts) {
        uniqueIds.add(validIds[Math.floor(Math.random() * validIds.length)]);
        attempts++;
      }

      const fetchPromises = Array.from(uniqueIds).map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
          res.json()
        )
      );

      const pokemonData = await Promise.all(fetchPromises);
      setTeam(pokemonData);
      setTerminalStatus("SUCCESS");
      
      // Scroll to the team grid after generation
      setTimeout(() => {
        teamGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      setTerminalStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      normal: "#A8A878",
      fire: "#F08030",
      water: "#6890F0",
      electric: "#F8D030",
      grass: "#78C850",
      ice: "#98D8D8",
      fighting: "#C03028",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      psychic: "#F85888",
      bug: "#A8B820",
      rock: "#B8A038",
      ghost: "#705898",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      fairy: "#EE99AC",
    };
    return typeColors[type] || "#68A090";
  };

  const resetFilters = () => {
    setFilters({
      teamSize: 6,
      types: [],
      legendaryStatus: [],
      evolutionStage: [],
      fullyEvolved: [],
      displayFormat: "both",
      genders: [],
      natures: [],
      forms: [],
      regions: [],
    });
  };

  const removeFilter = (key: keyof FilterState, value?: string) => {
    if (key === "teamSize") {
      setFilters({ ...filters, teamSize: 6 });
    } else if (key === "displayFormat") {
      setFilters({ ...filters, displayFormat: "both" });
    } else if (Array.isArray(filters[key])) {
      const arr = filters[key] as string[];
      if (value) {
        setFilters({
          ...filters,
          [key]: arr.filter((item) => item !== value),
        });
      } else {
        setFilters({
          ...filters,
          [key]: [],
        });
      }
    }
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.teamSize !== 6 ||
      filters.types.length > 0 ||
      filters.legendaryStatus.length > 0 ||
      filters.evolutionStage.length > 0 ||
      filters.fullyEvolved.length > 0 ||
      filters.displayFormat !== "both" ||
      filters.genders.length > 0 ||
      filters.natures.length > 0 ||
      filters.forms.length > 0 ||
      filters.regions.length > 0
    );
  }, [filters]);

  const filteredNatures = useMemo(() => {
    return NATURES.filter((nature) =>
      nature.toLowerCase().includes(natureSearch.toLowerCase())
    );
  }, [natureSearch]);

  const getFilterDisplayValue = (key: keyof FilterState): string => {
    switch (key) {
      case "teamSize":
        return String(filters.teamSize);
      case "regions":
        return filters.regions.length === 0
          ? "All"
          : filters.regions.length === 1
          ? filters.regions[0]
          : `${filters.regions.length}`;
      case "types":
        return filters.types.length === 0
          ? "Any"
          : filters.types.length === 1
          ? filters.types[0].charAt(0).toUpperCase() + filters.types[0].slice(1)
          : `${filters.types.length}`;
      case "legendaryStatus":
        return filters.legendaryStatus.length === 0
          ? "All"
          : filters.legendaryStatus.length === 1
          ? filters.legendaryStatus[0]
          : `${filters.legendaryStatus.length}`;
      case "evolutionStage":
        return filters.evolutionStage.length === 0
          ? "All"
          : filters.evolutionStage.length === 1
          ? filters.evolutionStage[0]
          : `${filters.evolutionStage.length}`;
      case "fullyEvolved":
        return filters.fullyEvolved.length === 0
          ? "All"
          : filters.fullyEvolved.length === 1
          ? filters.fullyEvolved[0]
          : `${filters.fullyEvolved.length}`;
      case "genders":
        return filters.genders.length === 0
          ? "All"
          : filters.genders.length === 1
          ? filters.genders[0]
          : `${filters.genders.length}`;
      case "natures":
        return filters.natures.length === 0
          ? "All"
          : filters.natures.length === 1
          ? filters.natures[0]
          : `${filters.natures.length}`;
      case "forms":
        return filters.forms.length === 0
          ? "All"
          : filters.forms.length === 1
          ? filters.forms[0]
          : `${filters.forms.length}`;
      case "displayFormat":
        return filters.displayFormat === "both"
          ? "Both"
          : filters.displayFormat === "name-only"
          ? "Name"
          : "Sprite";
      default:
        return "All";
    }
  };

  // Guard clause: Show loading spinner until mounted (prevents hydration mismatch)
  if (!isClient) {
    return (
      <main className="min-h-screen bg-cream p-4 md:p-8 relative">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo" size={64} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream p-4 md:p-8 relative">
      {/* Blur Overlay when search is active */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[55]"
          onClick={() => setShowSuggestions(false)}
        />
      )}
      
      <div className="max-w-7xl mx-auto relative">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center relative z-[60]">
          <h1 className={`font-grotesk font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-black mb-3 md:mb-4 tracking-tight transition-all px-2 ${showSuggestions && suggestions.length > 0 ? 'opacity-30 blur-[2px]' : ''}`}>
            RANDOM POKEMON GENERATOR
          </h1>
          {/* Status Box - bg-black with white text for better visibility */}
          <div className={`inline-block bg-black px-4 md:px-6 py-2 md:py-3 slasher mb-6 md:mb-8 transition-all ${showSuggestions && suggestions.length > 0 ? 'opacity-30 blur-[2px]' : ''}`}>
            <p className="font-mono text-xs md:text-sm font-semibold text-white">
              STATUS: {terminalStatus}
            </p>
          </div>

          {/* Direct Search Form with Autocomplete */}
          <div ref={searchRef} className="w-full max-w-md mx-auto relative mb-6 md:mb-8 z-[70] px-2">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4 md:w-5 md:h-5 z-10" />
                <input
                  type="text"
                  placeholder="SEARCH_DATABASE..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-white border-2 border-black py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 font-mono text-xs md:text-sm text-black placeholder:text-black/30 focus:outline-none focus:bg-cream transition-colors rounded-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-black text-white px-4 md:px-6 font-mono text-xs md:text-sm font-bold hover:bg-charcoal transition-colors border-2 border-black border-l-0"
              >
                GO
              </button>
            </form>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 z-50 max-h-64 md:max-h-80 overflow-y-auto">
                {suggestions.map((pokemon) => (
                  <button
                    key={pokemon.name}
                    type="button"
                    onClick={() => handleSuggestionClick(pokemon.name)}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 font-mono text-xs md:text-sm text-black hover:bg-cream transition-colors border-b border-black/10 last:border-b-0"
                  >
                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-cream">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="uppercase font-semibold truncate">{pokemon.name}</span>
                    <span className="text-black/40 text-xs ml-auto flex-shrink-0">#{String(pokemon.id).padStart(4, "0")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rest of page content - blurs when search is active */}
        <div className={`transition-all ${showSuggestions && suggestions.length > 0 ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
        {/* CONTROL PANEL GRID */}
        <div className="mb-6">
          <div className="bg-white border-2 border-black p-3 md:p-4 relative z-50 overflow-visible">
            {/* CSS Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-visible">
              
              {/* 1. TEAM (Ghost Select Style) */}
              <div className="relative h-12 w-full bg-cream border-2 border-black font-mono text-xs md:text-sm text-black flex items-center hover:bg-charcoal hover:text-cream transition-colors group">
                <div className="flex items-center gap-2 px-3 md:px-4 w-full h-full pointer-events-none">
                  <span className="font-semibold group-hover:text-cream">Team:</span>
                  <span className="font-normal group-hover:text-cream flex-1">{filters.teamSize}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 group-hover:text-cream"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <select
                  id="teamSize"
                  value={filters.teamSize}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      teamSize: parseInt(e.target.value),
                    })
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. REGION */}
              <CompactFilterDropdown
                label="Region"
                value={getFilterDisplayValue("regions")}
                isOpen={openDropdown === "regions"}
                onToggle={() => toggleDropdown("regions")}
                minWidth="min-w-[220px]"
              >
                <MultiSelectCheckboxes
                  options={REGIONS.map((r) => r.name)}
                  selected={filters.regions}
                  onChange={(regions) => setFilters({ ...filters, regions })}
                  showSelectAll={true}
                />
              </CompactFilterDropdown>

              {/* 3. TYPE */}
              <CompactFilterDropdown
                label="Type"
                value={getFilterDisplayValue("types")}
                isOpen={openDropdown === "types"}
                onToggle={() => toggleDropdown("types")}
                minWidth="min-w-[200px]"
              >
                <MultiSelectCheckboxes
                  options={POKEMON_TYPES.map(
                    (t) => t.charAt(0).toUpperCase() + t.slice(1)
                  )}
                  selected={filters.types.map(
                    (t) => t.charAt(0).toUpperCase() + t.slice(1)
                  )}
                  onChange={(types) =>
                    setFilters({
                      ...filters,
                      types: types.map((t) => t.toLowerCase()),
                    })
                  }
                  showSelectAll={true}
                />
              </CompactFilterDropdown>

              {/* 4. RARITY */}
              <CompactFilterDropdown
                label="Rarity"
                value={getFilterDisplayValue("legendaryStatus")}
                isOpen={openDropdown === "legendary"}
                onToggle={() => toggleDropdown("legendary")}
                minWidth="min-w-[200px]"
              >
                <MultiSelectCheckboxes
                  options={LEGENDARY_OPTIONS}
                  selected={filters.legendaryStatus}
                  onChange={(legendaryStatus) =>
                    setFilters({ ...filters, legendaryStatus })
                  }
                  showSelectAll={true}
                />
              </CompactFilterDropdown>

              {/* MOBILE TOGGLE BUTTON - Shows between basic and advanced filters */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="col-span-2 md:hidden h-12 border-2 border-black bg-marigold text-black font-mono uppercase text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>{showAdvanced ? '[-] CLOSE FILTERS' : '[+] ADVANCED FILTERS'}</span>
              </button>

              {/* 5. STAGE - Hidden on mobile unless toggled, always visible on desktop */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Stage"
                  value={getFilterDisplayValue("evolutionStage")}
                  isOpen={openDropdown === "evolution"}
                  onToggle={() => toggleDropdown("evolution")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={EVOLUTION_STAGES}
                    selected={filters.evolutionStage}
                    onChange={(evolutionStage) =>
                      setFilters({ ...filters, evolutionStage })
                    }
                    showSelectAll={true}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 6. EVOLVED */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Evolved"
                  value={getFilterDisplayValue("fullyEvolved")}
                  isOpen={openDropdown === "fullyEvolved"}
                  onToggle={() => toggleDropdown("fullyEvolved")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={FULLY_EVOLVED_OPTIONS}
                    selected={filters.fullyEvolved}
                    onChange={(fullyEvolved) =>
                      setFilters({ ...filters, fullyEvolved })
                    }
                    showSelectAll={false}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 7. GENDER */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Gender"
                  value={getFilterDisplayValue("genders")}
                  isOpen={openDropdown === "gender"}
                  onToggle={() => toggleDropdown("gender")}
                  minWidth="min-w-[160px]"
                >
                  <MultiSelectCheckboxes
                    options={GENDERS}
                    selected={filters.genders}
                    onChange={(genders) => setFilters({ ...filters, genders })}
                    showSelectAll={true}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 8. NATURE */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Nature"
                  value={getFilterDisplayValue("natures")}
                  isOpen={openDropdown === "nature"}
                  onToggle={() => toggleDropdown("nature")}
                  minWidth="min-w-[200px]"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-2.5 text-charcoal" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={natureSearch}
                        onChange={(e) => setNatureSearch(e.target.value)}
                        className="w-full bg-cream border-2 border-black px-2 py-2 pl-8 font-mono text-xs text-black placeholder-charcoal"
                      />
                    </div>
                    <MultiSelectCheckboxes
                      options={filteredNatures}
                      selected={filters.natures}
                      onChange={(natures) => setFilters({ ...filters, natures })}
                      showSelectAll={true}
                    />
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* 9. FORMS */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Forms"
                  value={getFilterDisplayValue("forms")}
                  isOpen={openDropdown === "forms"}
                  onToggle={() => toggleDropdown("forms")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={FORM_OPTIONS}
                    selected={filters.forms}
                    onChange={(forms) => setFilters({ ...filters, forms })}
                    showSelectAll={true}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 10. DISPLAY */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label="Display"
                  value={getFilterDisplayValue("displayFormat")}
                  isOpen={openDropdown === "display"}
                  onToggle={() => toggleDropdown("display")}
                  minWidth="min-w-[180px]"
                >
                  <div className="space-y-1.5">
                    {DISPLAY_FORMATS.map((format) => (
                      <label
                        key={format}
                        className="flex items-center gap-2 cursor-pointer hover:bg-cream p-1"
                      >
                        <input
                          type="radio"
                          name="displayFormat"
                          checked={
                            filters.displayFormat ===
                            (format === "Name Only"
                              ? "name-only"
                              : format === "Sprite Only"
                              ? "sprite-only"
                              : "both")
                          }
                          onChange={() => {
                            const formatValue =
                              format === "Name Only"
                                ? "name-only"
                                : format === "Sprite Only"
                                ? "sprite-only"
                                : "both";
                            setFilters({
                              ...filters,
                              displayFormat: formatValue,
                            });
                            closeAllDropdowns();
                          }}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <span className="font-mono text-xs md:text-sm text-black">{format}</span>
                      </label>
                    ))}
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* RESET BUTTON - Desktop */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="hidden md:flex h-12 px-4 bg-marigold text-black hover:bg-marigold-hover font-mono text-xs md:text-sm font-semibold border-2 border-black transition-colors duration-200 items-center justify-center"
                  aria-label="Reset all filters"
                >
                  RESET
                </button>
              )}
            </div>

            {/* RESET BUTTON - Mobile (Full Width Below Grid) */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="md:hidden w-full mt-2 h-12 bg-marigold text-black hover:bg-marigold-hover font-mono text-xs font-semibold border-2 border-black transition-colors duration-200 flex items-center justify-center"
                aria-label="Reset all filters"
              >
                RESET FILTERS
              </button>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8 md:mb-12">
          <button
            onClick={generateTeam}
            disabled={loading}
            className="w-full md:w-auto px-10 py-5 font-grotesk font-bold text-xl uppercase tracking-wider bg-[#4ADE80] hover:bg-[#22c55e] text-black border-2 border-black slasher shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                GENERATING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Zap size={20} className="animate-pulse text-[#FFEA00] fill-[#FFEA00]" />
                GENERATE TEAM
              </span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {isClient && loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo" size={64} />
          </div>
        )}

        {/* Initial Loading Placeholder - shown before client hydration */}
        {!isClient && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo" size={64} />
          </div>
        )}

        {/* Pokemon Grid */}
        {isClient && !loading && team.length > 0 && (
          <div ref={teamGridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {team.map((pokemon) => (
              <div
                key={pokemon.id}
                className="bg-white border-2 md:border-4 border-black slasher p-2 md:p-6 hover:shadow-2xl transition-shadow duration-200"
              >
                {/* ID Badge & Share Button */}
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <span className="font-mono text-[10px] md:text-xs bg-marigold text-black px-2 md:px-3 py-0.5 md:py-1 inline-block border md:border-2 border-black font-semibold">
                    #{String(pokemon.id).padStart(4, "0")}
                  </span>
                  <button
                    onClick={() => setSharePokemon(pokemon)}
                    className="p-1 md:p-2 text-black/40 hover:text-marigold transition-colors cursor-pointer"
                    aria-label={`Share ${pokemon.name} flash card`}
                  >
                    <Share2 size={16} className="md:w-5 md:h-5" />
                  </button>
                </div>

                {/* Pokemon Image */}
                {(filters.displayFormat === "both" ||
                  filters.displayFormat === "sprite-only") && (
                  <div className="relative w-full h-28 md:h-48 mb-2 md:mb-4 bg-cream">
                    {(() => {
                      const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
                      const typeText = pokemon.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join('/');
                      const altText = `${pokemonName} official artwork with ${pokemon.types.length > 1 ? 'dual ' : ''}${typeText} type`;
                      return (
                        <Image
                          src={
                            pokemon.sprites.other["official-artwork"].front_default
                          }
                          alt={altText}
                          fill
                          className="object-contain blend-multiply"
                          unoptimized
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Name */}
                {(filters.displayFormat === "both" ||
                  filters.displayFormat === "name-only") && (
                  <h2 className="font-grotesk font-bold text-sm md:text-2xl text-black mb-1 md:mb-3 uppercase truncate">
                    {pokemon.name}
                  </h2>
                )}

                {/* Type Badges */}
                <div className="flex gap-1 md:gap-2 mb-2 md:mb-6 flex-wrap">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className="font-mono text-[10px] md:text-xs px-1.5 md:px-3 py-0.5 md:py-1 text-white uppercase border border-black"
                      style={{ backgroundColor: getTypeColor(typeInfo.type.name) }}
                    >
                      {typeInfo.type.name}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                  <Link
                    href={`/pokemon/${pokemon.name}`}
                    className="bg-indigo hover:bg-opacity-90 text-cream font-grotesk font-semibold text-[10px] md:text-sm px-2 md:px-4 py-2 md:py-3 text-center border md:border-2 border-black transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <Database size={12} className="md:w-4 md:h-4" />
                      DATA
                    </span>
                  </Link>
                  <Link
                    href="/pokedex"
                    className="bg-purple-300 hover:bg-purple-400 text-purple-900 font-grotesk font-semibold text-[10px] md:text-sm px-2 md:px-4 py-2 md:py-3 text-center border md:border-2 border-black transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <BookOpen size={12} className="md:w-4 md:h-4" />
                      POKEDEX
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - only show after client hydration if still no team */}
        {isClient && !loading && team.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block border-4 border-charcoal p-8 slasher">
              <p className="font-mono text-charcoal text-lg">
                Loading your team...
              </p>
            </div>
          </div>
        )}
        </div>

        {/* FAQ Section */}
        {/* Card Showcase Section */}
        <CardShowcase />

        {/* SEO Content Section */}
        <SeoContent />

        {/* About Section */}
        <section id="about" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">ABOUT US</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            GLOBAL POKEMON <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
              DATABASE
            </span>
          </h2>
          
          {/* About Item 1 */}
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Our Mission</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Random Pokemon Generator is the world&apos;s leading free Pokemon database and team builder, designed to help trainers globally create random teams for gameplay challenges, competitive battles, and creative adventures. Our global database contains complete data for all 1,025+ Pokemon across 9 generations.
              </p>
            </div>
          </div>

          {/* About Item 2 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">What We Offer</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Instant team generation, comprehensive Pokedex data, smart filtering by type/generation/rarity, detailed Pokemon stats and abilities, easy team sharing, and 24/7 worldwide availability. Whether you&apos;re planning a Nuzlocke run, organizing a draft league, or discovering new favorites — we&apos;ve got you covered.
              </p>
            </div>
          </div>

          {/* About Item 3 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Perfect For</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Nuzlocke Runs, Soul Link challenges, Draft Leagues, Randomizer playthroughs, casual fun, and content creation. Built with love by fans, for fans worldwide. We believe in making Pokemon team building accessible, fun, and completely free for everyone, everywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section id="disclaimer" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">IMPORTANT</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            LEGAL <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
              DISCLAIMER
            </span>
          </h2>
          
          {/* Disclaimer Item 1 */}
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Copyright Notice</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Pokémon and all related content including character names, images, and trademarks are © 1995-2025 Nintendo / Creatures Inc. / GAME FREAK inc. TM, ® and character names are trademarks of Nintendo.
              </p>
            </div>
          </div>

          {/* Disclaimer Item 2 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Fan Project Status</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                This website is a fan-made, non-commercial project. We are NOT affiliated with, endorsed by, or sponsored by Nintendo, The Pokémon Company, Creatures Inc., GAME FREAK inc., or any of their subsidiaries or related companies.
              </p>
            </div>
          </div>

          {/* Disclaimer Item 3 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Data Sources</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                All Pokemon data and images are sourced from PokeAPI (pokeapi.co), a free and open Pokemon database maintained by the community. We do not claim ownership of any Pokemon-related intellectual property.
              </p>
            </div>
          </div>

          {/* Disclaimer Item 4 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Fair Use</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                This tool is provided for entertainment and educational purposes only. We believe our use falls under fair use as we are non-commercial, provide a transformative utility tool, cause no market harm, and help fans learn about Pokemon. If you are a rights holder with concerns, please contact us immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Section - GDPR Compliant with 6 sections covering Articles 4, 12, 15-17, 20-21 */}
        {/* All section badges use bg-black with text-white for consistency */}
        <section id="privacy-policy" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">GDPR COMPLIANT</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            PRIVACY <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
              POLICY
            </span>
          </h2>
          
          {/* Policy Item 1 */}
          <div>
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Data Collection & Legal Basis</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                This website does not collect, store, or process any personal data as defined under GDPR (Article 4). We do not use cookies for tracking, profiling, or advertising purposes. The Random Pokemon Generator operates entirely client-side—all data processing happens locally in your browser. No personal information is transmitted to our servers.
              </p>
            </div>
          </div>

          {/* Policy Item 2 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Third-Party Services</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                We use PokeAPI (pokeapi.co) to fetch Pokemon data. This third-party service may log IP addresses per their own privacy policy. We recommend reviewing their privacy practices. No external redirects, third-party commerce sites, or advertising networks are involved. We do not share any data with third parties for marketing purposes.
              </p>
            </div>
          </div>

          {/* Policy Item 3 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Your Rights Under GDPR</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                As an EU/EEA resident, you have rights under GDPR including: Right to Access (Article 15), Right to Rectification (Article 16), Right to Erasure (Article 17), Right to Data Portability (Article 20), and Right to Object (Article 21). Since we do not collect personal data, these rights are automatically respected. If you believe we hold any data about you, contact us for verification.
              </p>
            </div>
          </div>

          {/* Policy Item 4 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Analytics & Cookies</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                We may use privacy-respecting, cookie-free analytics (such as Plausible or similar) to understand general usage patterns. These tools do not use cookies, do not track users across sites, and do not collect personally identifiable information. No consent banner is required as no tracking cookies are used.
              </p>
            </div>
          </div>

          {/* Policy Item 5 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Data Retention & Security</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Since no personal data is collected, there is no data retention period. Your generated teams and preferences are stored only in your browser&apos;s local storage (if applicable) and can be cleared at any time through your browser settings. We implement industry-standard security measures including HTTPS encryption for all connections.
              </p>
            </div>
          </div>

          {/* Policy Item 6 */}
          <div className="mt-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">Data Controller & Contact</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                Data Controller: Random Pokemon Generator. For any privacy-related questions, GDPR requests, or concerns, please contact us at shadowrajoriya@gmail.com. We will respond to all legitimate requests within 30 days as required by GDPR (Article 12). This privacy policy was last updated on November 30, 2025.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
            <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">HELP DESK</span>
            </div>
            <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
              FREQUENTLY <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-charcoal">
                ASKED
              </span>
            </h2>
            <div className="space-y-0">
              {/* FAQ Item 1 */}
              <div>
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    How do I generate a random Pokemon team?
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    Simply click the &apos;GENERATE TEAM&apos; button. Our tool instantly selects 6 unique Pokemon from Gen 1 to Gen 9, creating a balanced team for Nuzlockes or creative drawing challenges.
                  </p>
                </div>
              </div>
              {/* FAQ Item 2 */}
              <div className="mt-4">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    Can I exclude Legendary Pokemon?
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    Yes. Use the &apos;Rarity&apos; filter above the generator to exclude Legendaries, Mythicals, or Ultra Beasts for a standard playthrough experience.
                  </p>
                </div>
              </div>
              {/* FAQ Item 3 */}
              <div className="mt-4">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    Is this updated for Pokemon Scarlet and Violet?
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    Yes. Our database includes the complete Paldea Pokédex and is updated regularly for new DLC expansions.
                  </p>
                </div>
              </div>
              {/* FAQ Item 4 */}
              <div className="mt-4">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    Can I generate Pokemon cards with this tool?
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    Yes! Each generated Pokemon displays as a stylized card with stats, types, and official artwork. Perfect for collectors, TCG fans, or creating custom card collections.
                  </p>
                </div>
              </div>
              {/* FAQ Item 5 */}
              <div className="mt-4">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    What is the Pokedex database?
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    Our comprehensive Pokedex contains detailed information on all 1025 Pokemon across every generation. Browse stats, types, abilities, evolution chains, and Pokedex entries for any Pokemon.
                  </p>
                </div>
              </div>
            </div>
        </section>
      </div>

      {/* Share Modal */}
      {sharePokemon && (
        <ShareModal
          pokemon={sharePokemon}
          onClose={() => setSharePokemon(null)}
        />
      )}
    </main>
  );
}
