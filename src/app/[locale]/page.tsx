"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Database, ChevronDown, X, Search, Share2, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Locale, pokeApiLanguageMap } from "@/i18n/routing";

// Dynamic imports for heavy/below-fold components (reduces initial bundle)
const SeoContent = dynamic(() => import("@/components/SeoContent"), {
  loading: () => <div className="h-96 bg-cream animate-pulse border-2 border-black" />,
  ssr: true, // Keep for SEO
});

const ShareModal = dynamic(() => import("@/components/ShareModal"), {
  loading: () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <Loader2 className="animate-spin text-white" size={48} />
    </div>
  ),
  ssr: false, // Modal doesn't need SSR
});

const CardShowcase = dynamic(() => import("@/components/CardShowcase"), {
  loading: () => <div className="h-96 bg-cream animate-pulse border-2 border-black" />,
  ssr: true,
});

interface PokemonType {
  type: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  localizedName?: string;
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
  // Advanced challenge modes
  monoType: boolean;
  noDuplicateLines: boolean;
  nuzlockeSafe: boolean;
  startersOnly: boolean;
  gameFilter: string;
}

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

// Region definitions with keys matching translation keys
const REGION_KEYS = [
  { key: "kanto", range: [1, 151] },
  { key: "stadiumRentals", range: [1, 151] },
  { key: "johto", range: [152, 251] },
  { key: "stadium2Rentals", range: [152, 251] },
  { key: "hoenn", range: [252, 386] },
  { key: "sinnoh", range: [387, 493] },
  { key: "sinnohPlatinum", range: [387, 493] },
  { key: "unova", range: [494, 649] },
  { key: "unovaB2W2", range: [494, 649] },
  { key: "kalos", range: [650, 721] },
  { key: "alola", range: [722, 809] },
  { key: "alolaUSUM", range: [722, 809] },
  { key: "galar", range: [810, 905] },
  { key: "hisui", range: [387, 905] },
  { key: "paldea", range: [906, 1025] },
  { key: "kitakami", range: [906, 1025] },
  { key: "blueberryAcademy", range: [906, 1025] },
  { key: "lumioseCity", range: [650, 721] },
];

// Legendary option keys matching translation keys
const LEGENDARY_OPTION_KEYS = [
  "subLegendary",
  "legendary",
  "mythical",
  "paradox",
  "ultraBeast",
];

// Evolution stage keys matching translation keys
const EVOLUTION_STAGE_KEYS = ["unevolved", "evolvedOnce", "evolvedTwice"];
const FULLY_EVOLVED_KEYS = ["notFullyEvolved", "fullyEvolved"];
const GENDER_KEYS = ["male", "female", "genderless"];
const DISPLAY_FORMAT_KEYS = ["nameOnly", "spriteOnly", "both"];
const NATURE_KEYS = [
  "adamant", "bold", "brave", "calm", "careful", "gentle", "hasty", "hardy",
  "impish", "jolly", "lax", "lonely", "mild", "modest", "naive", "naughty",
  "quiet", "quirky", "rash", "relaxed", "sassy", "timid", "bashful", "docile",
  "serious",
];
const FORM_OPTION_KEYS = ["alternateForms", "megaEvolutions", "gigantamaxForms"];

// Game filter keys for per-game availability
const GAME_FILTER_KEYS = [
  "any",
  "redBlue", "yellow", "goldSilver", "crystal",
  "rubySapphire", "emerald", "fireRedLeafGreen",
  "diamondPearl", "platinum", "heartGoldSoulSilver",
  "blackWhite", "black2White2",
  "xY", "omegarubyAlphasapphire",
  "sunMoon", "ultraSunUltraMoon", "letsGo",
  "swordShield", "brilliantDiamondShiningPearl", "legendsArceus",
  "scarletViolet"
];

// Game to Pokedex range mapping (approximate availability)
const GAME_POKEDEX_RANGES: Record<string, [number, number]> = {
  "any": [1, 1025],
  "redBlue": [1, 151],
  "yellow": [1, 151],
  "goldSilver": [1, 251],
  "crystal": [1, 251],
  "rubySapphire": [1, 386],
  "emerald": [1, 386],
  "fireRedLeafGreen": [1, 386],
  "diamondPearl": [1, 493],
  "platinum": [1, 493],
  "heartGoldSoulSilver": [1, 493],
  "blackWhite": [1, 649],
  "black2White2": [1, 649],
  "xY": [1, 721],
  "omegarubyAlphasapphire": [1, 721],
  "sunMoon": [1, 809],
  "ultraSunUltraMoon": [1, 809],
  "letsGo": [1, 153], // Gen 1 + Meltan/Melmetal
  "swordShield": [1, 898],
  "brilliantDiamondShiningPearl": [1, 493],
  "legendsArceus": [1, 905],
  "scarletViolet": [1, 1025]
};

// Starter Pokemon IDs (all generations)
const STARTER_IDS = new Set([
  // Gen 1
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  // Gen 2
  152, 153, 154, 155, 156, 157, 158, 159, 160,
  // Gen 3
  252, 253, 254, 255, 256, 257, 258, 259, 260,
  // Gen 4
  387, 388, 389, 390, 391, 392, 393, 394, 395,
  // Gen 5
  495, 496, 497, 498, 499, 500, 501, 502, 503,
  // Gen 6
  650, 651, 652, 653, 654, 655, 656, 657, 658,
  // Gen 7
  722, 723, 724, 725, 726, 727, 728, 729, 730,
  // Gen 8
  810, 811, 812, 813, 814, 815, 816, 817, 818,
  // Gen 9
  906, 907, 908, 909, 910, 911, 912, 913, 914
]);

// Evolution line data - maps Pokemon ID to their base form ID
// This helps identify Pokemon from the same evolution family
const getEvolutionLineId = (pokemonId: number): number => {
  // This is a simplified mapping - ideally would be fetched from API
  // Maps each Pokemon to its base form ID
  const evolutionLines: Record<number, number> = {
    // Bulbasaur line
    1: 1, 2: 1, 3: 1,
    // Charmander line
    4: 4, 5: 4, 6: 4,
    // Squirtle line
    7: 7, 8: 7, 9: 7,
    // Caterpie line
    10: 10, 11: 10, 12: 10,
    // Weedle line
    13: 13, 14: 13, 15: 13,
    // Pidgey line
    16: 16, 17: 16, 18: 16,
    // Rattata line
    19: 19, 20: 19,
    // Spearow line
    21: 21, 22: 21,
    // Ekans line
    23: 23, 24: 23,
    // Pikachu line
    25: 172, 26: 172, 172: 172,
    // And so on... for production, fetch from API
  };
  return evolutionLines[pokemonId] || pokemonId;
};

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
        className="btn-slide h-12 w-full px-3 md:px-4 bg-cream hover:bg-charcoal hover:text-cream border-2 border-black font-mono text-xs md:text-sm text-black whitespace-nowrap flex items-center gap-2 transition-colors duration-200"
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
          className={`absolute top-full left-0 mt-1 bg-white border-2 border-black ${minWidth} max-w-[90vw] max-h-[60vh] overflow-y-auto z-50 slasher animate-in fade-in slide-in-from-top-2 duration-200`}
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
  translationFn?: (key: string) => string;
}

const MultiSelectCheckboxes = ({
  options,
  selected,
  onChange,
  showSelectAll = false,
  translationFn,
}: MultiSelectCheckboxesProps) => {
  const isAllSelected = options.length > 0 && selected.length === options.length;
  const tFilters = useTranslations('filters');

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  const getDisplayText = (option: string) => {
    if (translationFn) {
      return translationFn(option);
    }
    return option;
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
            {isAllSelected ? tFilters('deselectAll') : tFilters('selectAll')}
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
            <span className="font-mono text-xs md:text-sm text-black">{getDisplayText(option)}</span>
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
  const locale = useLocale() as Locale;
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tFilters = useTranslations('filters');
  const tTypes = useTranslations('types');
  const tAbout = useTranslations('about');
  const tDisclaimer = useTranslations('disclaimer');
  const tPrivacy = useTranslations('privacy');
  const tFaq = useTranslations('faq');
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true); // Start as loading to avoid hydration mismatch
  const [terminalStatus, setTerminalStatus] = useState("INITIALIZING");
  const [searchQuery, setSearchQuery] = useState("");
  const [allPokemon, setAllPokemon] = useState<{ name: string; id: number; localizedName?: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ name: string; id: number; localizedName?: string }[]>([]);
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
    monoType: false,
    noDuplicateLines: false,
    nuzlockeSafe: false,
    startersOnly: false,
    gameFilter: "any",
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [typeCache, setTypeCache] = useState<Record<string, Set<number>>>({});
  const [natureSearch, setNatureSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sharePokemon, setSharePokemon] = useState<Pokemon | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const tChallengeIdeas = useTranslations('challengeIdeas');

  // Track if initial team has been generated
  const hasGeneratedInitialTeam = useRef(false);
  
  // Ref for scrolling to team grid
  const teamGridRef = useRef<HTMLDivElement>(null);

  // Fetch localized Pokemon name from species endpoint
  const fetchLocalizedName = useCallback(async (pokemonName: string): Promise<string> => {
    try {
      const pokeApiLang = pokeApiLanguageMap[locale];
      
      // Try original name first, then base name (without form suffix)
      const namesToTry = [pokemonName];
      if (pokemonName.includes('-')) {
        const baseName = pokemonName.split('-')[0];
        if (!namesToTry.includes(baseName)) {
          namesToTry.push(baseName);
        }
      }
      
      for (const name of namesToTry) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        if (res.ok) {
          const species = await res.json();
          const localizedEntry = species.names?.find((n: { language: { name: string }, name: string }) => n.language.name === pokeApiLang);
          if (localizedEntry) return localizedEntry.name;
          
          const englishEntry = species.names?.find((n: { language: { name: string }, name: string }) => n.language.name === 'en');
          if (englishEntry) return englishEntry.name;
        }
      }
      
      return pokemonName;
    } catch {
      return pokemonName;
    }
  }, [locale]);

  // Mark as mounted after hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all Pokemon names on mount for autocomplete (with localized names)
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await response.json();
        const pokemonList = data.results.map((p: { name: string; url: string }) => {
          // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/25/"
          const urlParts = p.url.split("/");
          const id = parseInt(urlParts[urlParts.length - 2]);
          return { name: p.name, id, localizedName: undefined as string | undefined };
        });
        setAllPokemon(pokemonList);
        
        // Fetch localized names in background for non-English locales
        if (locale !== 'en') {
          const pokeApiLang = pokeApiLanguageMap[locale];
          // Fetch in batches to avoid overwhelming the API
          const batchSize = 50;
          for (let i = 0; i < pokemonList.length; i += batchSize) {
            const batch = pokemonList.slice(i, i + batchSize);
            const localizedBatch = await Promise.all(
              batch.map(async (p: { name: string; id: number; localizedName?: string }) => {
                try {
                  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.id}`);
                  if (speciesRes.ok) {
                    const species = await speciesRes.json();
                    const localizedEntry = species.names?.find((n: { language: { name: string }, name: string }) => n.language.name === pokeApiLang);
                    return { ...p, localizedName: localizedEntry?.name || p.name };
                  }
                } catch {
                  // Ignore errors for individual Pokemon
                }
                return p;
              })
            );
            // Update state progressively
            setAllPokemon(prev => {
              const updated = [...prev];
              for (let j = 0; j < localizedBatch.length; j++) {
                updated[i + j] = localizedBatch[j];
              }
              return updated;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching Pokemon list:", error);
      }
    };
    fetchAllPokemon();
  }, [locale]);

  // Auto-generate team on initial page load for zero-click value
  useEffect(() => {
    if (isMounted && !hasGeneratedInitialTeam.current) {
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
          
          const fetchPromises = Array.from(uniqueIds).map(async (id) => {
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemonData = await pokemonRes.json();
            const localizedName = await fetchLocalizedName(pokemonData.name);
            return { ...pokemonData, localizedName };
          });
          
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
  }, [isMounted, fetchLocalizedName]);

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
      const searchTerm = value.toLowerCase().trim();
      const filtered = allPokemon
        .filter((p) => 
          p.name.toLowerCase().includes(searchTerm) || 
          (p.localizedName && p.localizedName.toLowerCase().includes(searchTerm))
        )
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

    // Apply game filter first (limits the Pokemon pool)
    if (filters.gameFilter !== "any") {
      const [start, end] = GAME_POKEDEX_RANGES[filters.gameFilter] || [1, 1025];
      for (let i = start; i <= end; i++) {
        validIds.add(i);
      }
    } else if (filters.regions.length > 0) {
      const regionRanges = filters.regions.map((regionKey) => {
        const region = REGION_KEYS.find((r) => r.key === regionKey);
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

    // Apply Nuzlocke-safe filter (excludes legendaries/mythicals)
    if (filters.nuzlockeSafe) {
      validIds = new Set([...validIds].filter((id) => !LEGENDARY_IDS.has(id)));
    }

    // Apply starters only filter
    if (filters.startersOnly) {
      validIds = new Set([...validIds].filter((id) => STARTER_IDS.has(id)));
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
      const isLegendary = filters.legendaryStatus.includes("legendary");
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
        setLoading(false);
        return;
      }

      const uniqueIds = new Set<number>();
      const usedEvolutionLines = new Set<number>();
      const teamSize = Math.min(filters.teamSize, validIds.length);
      const maxAttempts = Math.min(validIds.length * 3, teamSize * 50);
      let attempts = 0;

      // If mono-type is enabled, first pick a random type to focus on
      let monoTypeFilter: string | null = null;
      if (filters.monoType && filters.types.length === 0) {
        // Pick a random type
        monoTypeFilter = POKEMON_TYPES[Math.floor(Math.random() * POKEMON_TYPES.length)];
      } else if (filters.monoType && filters.types.length > 0) {
        // Use the first selected type
        monoTypeFilter = filters.types[0];
      }

      // Fetch type data for mono-type filtering if needed
      let monoTypeIds: Set<number> | null = null;
      if (monoTypeFilter) {
        monoTypeIds = await getTypeIds(monoTypeFilter);
      }

      while (uniqueIds.size < teamSize && attempts < maxAttempts) {
        const candidateId = validIds[Math.floor(Math.random() * validIds.length)];
        
        // Check mono-type filter
        if (monoTypeIds && !monoTypeIds.has(candidateId)) {
          attempts++;
          continue;
        }

        // Check no duplicate evolution lines
        if (filters.noDuplicateLines) {
          const lineId = getEvolutionLineId(candidateId);
          if (usedEvolutionLines.has(lineId)) {
            attempts++;
            continue;
          }
          usedEvolutionLines.add(lineId);
        }

        uniqueIds.add(candidateId);
        attempts++;
      }

      const fetchPromises = Array.from(uniqueIds).map(async (id) => {
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemonData = await pokemonRes.json();
        const localizedName = await fetchLocalizedName(pokemonData.name);
        return { ...pokemonData, localizedName };
      });

      const pokemonData = await Promise.all(fetchPromises);
      
      // For mono-type, verify all Pokemon share at least one type
      if (filters.monoType && pokemonData.length > 1) {
        const firstTypes = new Set(pokemonData[0].types.map((t: PokemonType) => t.type.name));
        const sharedType = pokemonData.every((p: Pokemon) => 
          p.types.some((t: PokemonType) => firstTypes.has(t.type.name))
        );
        if (!sharedType && monoTypeFilter) {
          // Filter to only Pokemon with the mono-type
          const filteredData = pokemonData.filter((p: Pokemon) =>
            p.types.some((t: PokemonType) => t.type.name === monoTypeFilter)
          );
          setTeam(filteredData.length > 0 ? filteredData : pokemonData);
        } else {
          setTeam(pokemonData);
        }
      } else {
        setTeam(pokemonData);
      }
      
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
      monoType: false,
      noDuplicateLines: false,
      nuzlockeSafe: false,
      startersOnly: false,
      gameFilter: "any",
    });
  };

  const removeFilter = (key: keyof FilterState, value?: string) => {
    if (key === "teamSize") {
      setFilters({ ...filters, teamSize: 6 });
    } else if (key === "displayFormat") {
      setFilters({ ...filters, displayFormat: "both" });
    } else if (key === "monoType" || key === "noDuplicateLines" || key === "nuzlockeSafe" || key === "startersOnly") {
      setFilters({ ...filters, [key]: false });
    } else if (key === "gameFilter") {
      setFilters({ ...filters, gameFilter: "any" });
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
      filters.regions.length > 0 ||
      filters.monoType ||
      filters.noDuplicateLines ||
      filters.nuzlockeSafe ||
      filters.startersOnly ||
      filters.gameFilter !== "any"
    );
  }, [filters]);

  const filteredNatures = useMemo(() => {
    // Filter natures by searching translated names
    return NATURE_KEYS.filter((natureKey) => {
      // Search by the key itself (which matches English names lowercase)
      return natureKey.toLowerCase().includes(natureSearch.toLowerCase());
    });
  }, [natureSearch]);

  const getFilterDisplayValue = (key: keyof FilterState): string => {
    switch (key) {
      case "teamSize":
        return String(filters.teamSize);
      case "regions":
        return filters.regions.length === 0
          ? tFilters('any')
          : filters.regions.length === 1
          ? tFilters(`regions.${filters.regions[0]}`)
          : `${filters.regions.length}`;
      case "types":
        return filters.types.length === 0
          ? tFilters('any')
          : filters.types.length === 1
          ? tTypes(filters.types[0])
          : `${filters.types.length}`;
      case "legendaryStatus":
        return filters.legendaryStatus.length === 0
          ? tFilters('all')
          : filters.legendaryStatus.length === 1
          ? tFilters(`legendaryOptions.${filters.legendaryStatus[0]}`)
          : `${filters.legendaryStatus.length}`;
      case "evolutionStage":
        return filters.evolutionStage.length === 0
          ? tFilters('all')
          : filters.evolutionStage.length === 1
          ? tFilters(`evolutionStages.${filters.evolutionStage[0]}`)
          : `${filters.evolutionStage.length}`;
      case "fullyEvolved":
        return filters.fullyEvolved.length === 0
          ? tFilters('all')
          : filters.fullyEvolved.length === 1
          ? tFilters(`fullyEvolvedOptions.${filters.fullyEvolved[0]}`)
          : `${filters.fullyEvolved.length}`;
      case "genders":
        return filters.genders.length === 0
          ? tFilters('all')
          : filters.genders.length === 1
          ? tFilters(`genderOptions.${filters.genders[0]}`)
          : `${filters.genders.length}`;
      case "natures":
        return filters.natures.length === 0
          ? tFilters('all')
          : filters.natures.length === 1
          ? tFilters(`natures.${filters.natures[0]}`)
          : `${filters.natures.length}`;
      case "forms":
        return filters.forms.length === 0
          ? tFilters('all')
          : filters.forms.length === 1
          ? tFilters(`formOptions.${filters.forms[0]}`)
          : `${filters.forms.length}`;
      case "displayFormat":
        return filters.displayFormat === "both"
          ? tFilters('both')
          : filters.displayFormat === "name-only"
          ? tFilters('nameOnly')
          : tFilters('spriteOnly');
      default:
        return tFilters('all');
    }
  };

  // Guard clause: Show loading spinner until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-cream p-4 md:p-8 relative">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo" size={64} />
        </div>
      </main>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Random Pokemon Team Generator",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Generate random Pokemon teams with advanced filters for types, generations, and Nuzlocke challenge modes. Supports all 1,025+ Pokemon across 7 languages.",
            "url": "https://www.randompokemon.co",
            "inLanguage": ["en", "ja", "ko", "fr", "de", "es", "pt"],
            "featureList": [
              "Random Pokemon team generation",
              "Nuzlocke mode support",
              "Type and generation filters",
              "Multi-language support (7 languages)",
              "Pokemon card generator",
              "Full Pokedex database"
            ],
            "browserRequirements": "Requires JavaScript"
          })
        }}
      />

      <main className="min-h-screen bg-cream p-4 md:p-8 relative">

      {/* Noscript fallback for Googlebot and users without JS */}
      <noscript>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-grotesk font-bold text-5xl md:text-7xl text-black mb-4">
              {t('title')}
            </h1>
            <p className="font-sans text-xl text-black/70 mb-8 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="bg-cream border-2 border-black p-8 slasher max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Generate Random Pokemon Teams</h2>
              <p className="text-black/80 mb-4 font-mono text-sm">
                This tool allows you to generate random Pokemon teams with advanced filters for types, generations, and challenge modes including Nuzlocke runs.
              </p>
              <p className="text-black/80 mb-4 font-mono text-sm">
                Please enable JavaScript to use the interactive team generator. You can also browse our <a href="/pokedex" className="underline font-bold">Full Pokedex</a> to explore all 1,025+ Pokemon.
              </p>
              <div className="mt-6">
                <a href="/pokedex" className="inline-block bg-black text-white px-6 py-3 font-mono font-bold border-2 border-black hover:bg-charcoal">
                  → Browse Full Pokedex
                </a>
              </div>
            </div>
          </div>
        </div>
      </noscript>

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
            {t('title')}
          </h1>
          {/* Status Box - bg-black with white text for better visibility */}
          <div className={`inline-block bg-black px-4 md:px-6 py-2 md:py-3 slasher mb-6 md:mb-8 transition-all ${showSuggestions && suggestions.length > 0 ? 'opacity-30 blur-[2px]' : ''}`}>
            <p className="font-mono text-xs md:text-sm font-semibold text-white">
              {tCommon('status')}: {terminalStatus}
            </p>
          </div>

          {/* Direct Search Form with Autocomplete */}
          <div ref={searchRef} className="w-full max-w-md mx-auto relative mb-6 md:mb-8 z-[70] px-2">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4 md:w-5 md:h-5 z-10" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-white border-2 border-black py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 font-mono text-xs md:text-sm text-black placeholder:text-black/30 focus:outline-none focus:bg-cream transition-colors rounded-none"
                />
              </div>
              <button 
                type="submit"
                className="btn-slide bg-black text-white px-4 md:px-6 font-mono text-xs md:text-sm font-bold hover:bg-charcoal transition-colors border-2 border-black border-l-0"
              >
                {tCommon('go')}
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
                    className="btn-slide w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 font-mono text-xs md:text-sm text-black hover:bg-cream transition-colors border-b border-black/10 last:border-b-0"
                  >
                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-cream">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.localizedName || pokemon.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="uppercase font-semibold truncate">{pokemon.localizedName || pokemon.name}</span>
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
                  <span className="font-semibold group-hover:text-cream">{tFilters('team')}:</span>
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
                label={tFilters('region')}
                value={getFilterDisplayValue("regions")}
                isOpen={openDropdown === "regions"}
                onToggle={() => toggleDropdown("regions")}
                minWidth="min-w-[220px]"
              >
                <MultiSelectCheckboxes
                  options={REGION_KEYS.map((r) => r.key)}
                  selected={filters.regions}
                  onChange={(regions) => setFilters({ ...filters, regions })}
                  showSelectAll={true}
                  translationFn={(key) => tFilters(`regions.${key}`)}
                />
              </CompactFilterDropdown>

              {/* 3. TYPE */}
              <CompactFilterDropdown
                label={tFilters('type')}
                value={getFilterDisplayValue("types")}
                isOpen={openDropdown === "types"}
                onToggle={() => toggleDropdown("types")}
                minWidth="min-w-[200px]"
              >
                <MultiSelectCheckboxes
                  options={POKEMON_TYPES}
                  selected={filters.types}
                  onChange={(types) =>
                    setFilters({
                      ...filters,
                      types: types,
                    })
                  }
                  showSelectAll={true}
                  translationFn={(type) => tTypes(type)}
                />
              </CompactFilterDropdown>

              {/* 4. RARITY */}
              <CompactFilterDropdown
                label={tFilters('rarity')}
                value={getFilterDisplayValue("legendaryStatus")}
                isOpen={openDropdown === "legendary"}
                onToggle={() => toggleDropdown("legendary")}
                minWidth="min-w-[200px]"
              >
                <MultiSelectCheckboxes
                  options={LEGENDARY_OPTION_KEYS}
                  selected={filters.legendaryStatus}
                  onChange={(legendaryStatus) =>
                    setFilters({ ...filters, legendaryStatus })
                  }
                  showSelectAll={true}
                  translationFn={(key) => tFilters(`legendaryOptions.${key}`)}
                />
              </CompactFilterDropdown>

              {/* MOBILE TOGGLE BUTTON - Shows between basic and advanced filters */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="col-span-2 md:hidden h-12 border-2 border-black bg-marigold text-black font-mono uppercase text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>{showAdvanced ? `[-] ${tFilters('closeFilters')}` : `[+] ${tFilters('advancedFilters')}`}</span>
              </button>

              {/* 5. STAGE - Hidden on mobile unless toggled, always visible on desktop */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('stage')}
                  value={getFilterDisplayValue("evolutionStage")}
                  isOpen={openDropdown === "evolution"}
                  onToggle={() => toggleDropdown("evolution")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={EVOLUTION_STAGE_KEYS}
                    selected={filters.evolutionStage}
                    onChange={(evolutionStage) =>
                      setFilters({ ...filters, evolutionStage })
                    }
                    showSelectAll={true}
                    translationFn={(key) => tFilters(`evolutionStages.${key}`)}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 6. EVOLVED */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('evolved')}
                  value={getFilterDisplayValue("fullyEvolved")}
                  isOpen={openDropdown === "fullyEvolved"}
                  onToggle={() => toggleDropdown("fullyEvolved")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={FULLY_EVOLVED_KEYS}
                    selected={filters.fullyEvolved}
                    onChange={(fullyEvolved) =>
                      setFilters({ ...filters, fullyEvolved })
                    }
                    showSelectAll={false}
                    translationFn={(key) => tFilters(`fullyEvolvedOptions.${key}`)}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 7. GENDER */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('gender')}
                  value={getFilterDisplayValue("genders")}
                  isOpen={openDropdown === "gender"}
                  onToggle={() => toggleDropdown("gender")}
                  minWidth="min-w-[160px]"
                >
                  <MultiSelectCheckboxes
                    options={GENDER_KEYS}
                    selected={filters.genders}
                    onChange={(genders) => setFilters({ ...filters, genders })}
                    showSelectAll={true}
                    translationFn={(key) => tFilters(`genderOptions.${key}`)}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 8. NATURE */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('nature')}
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
                        placeholder={tCommon('search')}
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
                      translationFn={(key) => tFilters(`natures.${key}`)}
                    />
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* 9. FORMS */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('forms')}
                  value={getFilterDisplayValue("forms")}
                  isOpen={openDropdown === "forms"}
                  onToggle={() => toggleDropdown("forms")}
                  minWidth="min-w-[180px]"
                >
                  <MultiSelectCheckboxes
                    options={FORM_OPTION_KEYS}
                    selected={filters.forms}
                    onChange={(forms) => setFilters({ ...filters, forms })}
                    showSelectAll={true}
                    translationFn={(key) => tFilters(`formOptions.${key}`)}
                  />
                </CompactFilterDropdown>
              </div>

              {/* 10. DISPLAY */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('display')}
                  value={getFilterDisplayValue("displayFormat")}
                  isOpen={openDropdown === "display"}
                  onToggle={() => toggleDropdown("display")}
                  minWidth="min-w-[180px]"
                >
                  <div className="space-y-1.5">
                    {DISPLAY_FORMAT_KEYS.map((formatKey) => (
                      <label
                        key={formatKey}
                        className="flex items-center gap-2 cursor-pointer hover:bg-cream p-1"
                      >
                        <input
                          type="radio"
                          name="displayFormat"
                          checked={
                            filters.displayFormat ===
                            (formatKey === "nameOnly"
                              ? "name-only"
                              : formatKey === "spriteOnly"
                              ? "sprite-only"
                              : "both")
                          }
                          onChange={() => {
                            const formatValue =
                              formatKey === "nameOnly"
                                ? "name-only"
                                : formatKey === "spriteOnly"
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
                        <span className="font-mono text-xs md:text-sm text-black">{tFilters(`displayFormats.${formatKey}`)}</span>
                      </label>
                    ))}
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* 11. GAME FILTER */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('gameFilters.label')}
                  value={filters.gameFilter === "any" ? tFilters('gameFilters.any') : tFilters(`gameFilters.${filters.gameFilter}`)}
                  isOpen={openDropdown === "gameFilter"}
                  onToggle={() => toggleDropdown("gameFilter")}
                  minWidth="min-w-[220px]"
                >
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {GAME_FILTER_KEYS.map((gameKey) => (
                      <label
                        key={gameKey}
                        className="flex items-center gap-2 cursor-pointer hover:bg-cream p-1"
                      >
                        <input
                          type="radio"
                          name="gameFilter"
                          checked={filters.gameFilter === gameKey}
                          onChange={() => {
                            setFilters({ ...filters, gameFilter: gameKey });
                            closeAllDropdowns();
                          }}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <span className="font-mono text-xs md:text-sm text-black">{tFilters(`gameFilters.${gameKey}`)}</span>
                      </label>
                    ))}
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* 12. CHALLENGE MODES */}
              <div className={`${showAdvanced ? '' : 'hidden md:block'}`}>
                <CompactFilterDropdown
                  label={tFilters('modeLabel')}
                  value={
                    filters.monoType || filters.noDuplicateLines || filters.nuzlockeSafe || filters.startersOnly
                      ? `${[filters.monoType, filters.noDuplicateLines, filters.nuzlockeSafe, filters.startersOnly].filter(Boolean).length} active`
                      : tFilters('all')
                  }
                  isOpen={openDropdown === "challengeModes"}
                  onToggle={() => toggleDropdown("challengeModes")}
                  minWidth="min-w-[220px]"
                >
                  <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-cream p-1">
                      <input
                        type="checkbox"
                        checked={filters.monoType}
                        onChange={(e) => setFilters({ ...filters, monoType: e.target.checked })}
                        className="w-4 h-4 cursor-pointer flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-mono text-xs md:text-sm text-black font-semibold block">{tFilters('challengeModes.monoType')}</span>
                        <span className="font-mono text-[10px] text-charcoal">{tFilters('challengeModeDescriptions.monoType')}</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-cream p-1">
                      <input
                        type="checkbox"
                        checked={filters.noDuplicateLines}
                        onChange={(e) => setFilters({ ...filters, noDuplicateLines: e.target.checked })}
                        className="w-4 h-4 cursor-pointer flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-mono text-xs md:text-sm text-black font-semibold block">{tFilters('challengeModes.noDuplicateLines')}</span>
                        <span className="font-mono text-[10px] text-charcoal">{tFilters('challengeModeDescriptions.noDuplicateLines')}</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-cream p-1">
                      <input
                        type="checkbox"
                        checked={filters.nuzlockeSafe}
                        onChange={(e) => setFilters({ ...filters, nuzlockeSafe: e.target.checked })}
                        className="w-4 h-4 cursor-pointer flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-mono text-xs md:text-sm text-black font-semibold block">{tFilters('challengeModes.nuzlockeSafe')}</span>
                        <span className="font-mono text-[10px] text-charcoal">{tFilters('challengeModeDescriptions.nuzlockeSafe')}</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-cream p-1">
                      <input
                        type="checkbox"
                        checked={filters.startersOnly}
                        onChange={(e) => setFilters({ ...filters, startersOnly: e.target.checked })}
                        className="w-4 h-4 cursor-pointer flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-mono text-xs md:text-sm text-black font-semibold block">{tFilters('challengeModes.startersOnly')}</span>
                        <span className="font-mono text-[10px] text-charcoal">{tFilters('challengeModeDescriptions.startersOnly')}</span>
                      </div>
                    </label>
                  </div>
                </CompactFilterDropdown>
              </div>

              {/* RESET BUTTON - Desktop */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="btn-pop hidden md:flex h-12 px-4 bg-marigold text-black hover:bg-marigold-hover font-mono text-xs md:text-sm font-semibold border-2 border-black transition-colors duration-200 items-center justify-center"
                  aria-label="Reset all filters"
                >
                  {tFilters('reset')}
                </button>
              )}
            </div>

            {/* RESET BUTTON - Mobile (Full Width Below Grid) */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn-pop md:hidden w-full mt-2 h-12 bg-marigold text-black hover:bg-marigold-hover font-mono text-xs font-semibold border-2 border-black transition-colors duration-200 flex items-center justify-center"
                aria-label="Reset all filters"
              >
                {tFilters('resetFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8 md:mb-12">
          <button
            onClick={generateTeam}
            disabled={loading}
            className="btn-shine btn-glow w-full md:w-auto px-10 py-5 font-grotesk font-bold text-xl uppercase tracking-wider bg-[#4ADE80] hover:bg-[#22c55e] text-black border-2 border-black slasher shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                {t('generating')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Zap size={20} className="animate-pulse text-[#FFEA00] fill-[#FFEA00]" />
                {t('generateButton')}
              </span>
            )}
          </button>
        </div>

        {/* Loading State - Skeleton cards to prevent CLS */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" aria-label="Loading Pokemon team">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white border-2 md:border-4 border-black slasher p-2 md:p-6 animate-pulse"
              >
                {/* ID Badge skeleton */}
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <div className="h-4 md:h-6 w-16 md:w-20 bg-gray-200 rounded" />
                  <div className="h-4 md:h-5 w-4 md:w-5 bg-gray-200 rounded" />
                </div>
                {/* Image skeleton */}
                <div className="relative w-full h-28 md:h-48 mb-2 md:mb-4 bg-gray-200" />
                {/* Name skeleton */}
                <div className="h-5 md:h-8 w-3/4 bg-gray-200 rounded mb-1 md:mb-3" />
                {/* Type badges skeleton */}
                <div className="flex gap-1 md:gap-2 mb-2 md:mb-6">
                  <div className="h-4 md:h-6 w-12 md:w-16 bg-gray-200 rounded" />
                  <div className="h-4 md:h-6 w-12 md:w-16 bg-gray-200 rounded" />
                </div>
                {/* Buttons skeleton */}
                <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                  <div className="h-8 md:h-12 bg-gray-200 rounded" />
                  <div className="h-8 md:h-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pokemon Grid */}
        {!loading && team.length > 0 && (
          <div ref={teamGridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {team.map((pokemon, index) => (
              <div
                key={pokemon.id}
                className={`pokemon-card bg-white border-2 md:border-4 border-black slasher p-2 md:p-6 hover:shadow-2xl transition-shadow duration-200 card-flip-in stagger-${index + 1}`}
              >
                {/* ID Badge & Share Button */}
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <span className="font-mono text-[10px] md:text-xs bg-marigold text-black px-2 md:px-3 py-0.5 md:py-1 inline-block border md:border-2 border-black font-semibold">
                    #{String(pokemon.id).padStart(4, "0")}
                  </span>
                  <button
                    onClick={() => setSharePokemon(pokemon)}
                    className="btn-icon-rotate p-1 md:p-2 text-black/40 hover:text-marigold transition-colors cursor-pointer"
                    aria-label={`Share ${pokemon.name} flash card`}
                  >
                    <Share2 size={16} className="md:w-5 md:h-5 transition-transform duration-200" />
                  </button>
                </div>

                {/* Pokemon Image */}
                {(filters.displayFormat === "both" ||
                  filters.displayFormat === "sprite-only") && (
                  <div className="relative w-full h-28 md:h-48 mb-2 md:mb-4 bg-cream overflow-hidden">
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
                          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                          className="object-contain blend-multiply pokemon-image pokemon-float"
                          priority={index < 3}
                          loading={index < 3 ? undefined : "lazy"}
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Name */}
                {(filters.displayFormat === "both" ||
                  filters.displayFormat === "name-only") && (
                  <h2 className="font-grotesk font-bold text-sm md:text-2xl text-black mb-1 md:mb-3 uppercase truncate">
                    {pokemon.localizedName || pokemon.name}
                  </h2>
                )}

                {/* Type Badges */}
                <div className="flex gap-1 md:gap-2 mb-2 md:mb-6 flex-wrap">
                  {pokemon.types.map((typeInfo, typeIndex) => (
                    <span
                      key={typeInfo.type.name}
                      className="font-mono text-[10px] md:text-xs px-1.5 md:px-3 py-0.5 md:py-1 text-white uppercase border border-black type-pop"
                      style={{ 
                        backgroundColor: getTypeColor(typeInfo.type.name),
                        animationDelay: `${typeIndex * 0.1 + 0.3}s`
                      }}
                    >
                      {tTypes(typeInfo.type.name)}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                  <Link
                    href={`/pokemon/${pokemon.name}`}
                    className="btn-shine bg-indigo hover:bg-opacity-90 text-cream font-grotesk font-semibold text-[10px] md:text-sm px-2 md:px-4 py-2 md:py-3 text-center border md:border-2 border-black transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <Database size={12} className="md:w-4 md:h-4" />
                      {t('data')}
                    </span>
                  </Link>
                  <Link
                    href="/pokedex"
                    className="btn-shine bg-purple-300 hover:bg-purple-400 text-purple-900 font-grotesk font-semibold text-[10px] md:text-sm px-2 md:px-4 py-2 md:py-3 text-center border md:border-2 border-black transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <BookOpen size={12} className="md:w-4 md:h-4" />
                      {t('pokedexButton')}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - only show if loading finished and still no team */}
        {!loading && team.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block border-4 border-charcoal p-8 slasher">
              <p className="font-mono text-charcoal text-lg">
                {t('loadingTeam')}
              </p>
            </div>
          </div>
        )}

        {/* Challenge Ideas Section - Shows after team is generated */}
        {!loading && team.length > 0 && (
          <section className="mt-8 md:mt-12 mb-8 bg-cream border-2 border-black p-4 md:p-8 slasher">
            <div className="inline-block bg-black px-3 py-1 slasher border border-black mb-4 challenge-badge">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{tChallengeIdeas('badge')}</span>
            </div>
            <h2 className="font-sans font-bold text-2xl md:text-3xl lg:text-4xl text-black leading-tight mb-2">
              {tChallengeIdeas('title')}
            </h2>
            <p className="font-mono text-sm text-charcoal mb-6">
              {tChallengeIdeas('subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Challenge 1: Hardcore Nuzlocke */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-red-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('hardcoreNuzlocke.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('hardcoreNuzlocke.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('hardcoreNuzlocke.description')}
                </p>
              </div>

              {/* Challenge 2: Soul Link */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-purple-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('soulLink.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('soulLink.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('soulLink.description')}
                </p>
              </div>

              {/* Challenge 3: Type-Locke */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-blue-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('typeLocke.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('typeLocke.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('typeLocke.description')}
                </p>
              </div>

              {/* Challenge 4: Random Moves */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-orange-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('randomMoves.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('randomMoves.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('randomMoves.description')}
                </p>
              </div>

              {/* Challenge 5: No Evolutions */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-green-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('noEvolutions.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('noEvolutions.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('noEvolutions.description')}
                </p>
              </div>

              {/* Challenge 6: Itemless */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-gray-700 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('itemless.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('itemless.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('itemless.description')}
                </p>
              </div>

              {/* Challenge 7: Speedrun */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-7">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-yellow-500 text-black font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('speedrun.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('speedrun.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('speedrun.description')}
                </p>
              </div>

              {/* Challenge 8: Egglocke */}
              <div className="challenge-card bg-white border-2 border-black p-4 hover:shadow-lg transition-shadow stagger-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="challenge-badge bg-pink-500 text-white font-mono text-[10px] px-2 py-0.5 font-bold">{tChallengeIdeas('egglocke.badge')}</span>
                  <h3 className="font-sans font-bold text-sm text-black">{tChallengeIdeas('egglocke.title')}</h3>
                </div>
                <p className="font-mono text-xs text-charcoal leading-relaxed">
                  {tChallengeIdeas('egglocke.description')}
                </p>
              </div>
            </div>

            {/* Link to Pokedex for more exploration */}
            <div className="mt-6 text-center">
              <Link
                href="/pokedex"
                className="btn-shine btn-glow group inline-flex items-center gap-2 bg-indigo hover:bg-opacity-90 text-cream font-grotesk font-semibold text-sm px-6 py-3 border-2 border-black transition-all duration-200"
              >
                <BookOpen size={16} className="group-hover:animate-pulse" />
                {t('pokedexButton')} - Explore All Pokemon
              </Link>
            </div>
          </section>
        )}
        </div>

        {/* FAQ Section */}
        {/* Card Showcase Section */}
        <CardShowcase />

        {/* SEO Content Section */}
        <SeoContent />

        {/* About Section */}
        <section id="about" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('aboutUs')}</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            {t('aboutTitle')}
          </h2>
          
          {/* About Item 1 */}
          <div className="challenge-card stagger-1">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tAbout('ourMission.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tAbout('ourMission.content')}
              </p>
            </div>
          </div>

          {/* About Item 2 */}
          <div className="mt-4 challenge-card stagger-2">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tAbout('whatWeOffer.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tAbout('whatWeOffer.content')}
              </p>
            </div>
          </div>

          {/* About Item 3 */}
          <div className="mt-4 challenge-card stagger-3">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tAbout('perfectFor.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tAbout('perfectFor.content')}
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section id="disclaimer" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('legalInfo')}</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            {t('disclaimerTitle')}
          </h2>
          
          {/* Disclaimer Item 1 */}
          <div className="challenge-card stagger-1">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tDisclaimer('copyrightNotice.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tDisclaimer('copyrightNotice.content')}
              </p>
            </div>
          </div>

          {/* Disclaimer Item 2 */}
          <div className="mt-4 challenge-card stagger-2">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tDisclaimer('fanProject.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tDisclaimer('fanProject.content')}
              </p>
            </div>
          </div>

          {/* Disclaimer Item 3 */}
          <div className="mt-4 challenge-card stagger-3">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tDisclaimer('dataSources.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tDisclaimer('dataSources.content')}
              </p>
            </div>
          </div>

          {/* Disclaimer Item 4 */}
          <div className="mt-4 challenge-card stagger-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tDisclaimer('fairUse.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tDisclaimer('fairUse.content')}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Section - GDPR Compliant with 6 sections covering Articles 4, 12, 15-17, 20-21 */}
        {/* All section badges use bg-black with text-white for consistency */}
        <section id="privacy-policy" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
          <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('privacyInfo')}</span>
          </div>
          <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
            {t('privacyTitle')}
          </h2>

          <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed mb-6">
            {tPrivacy('intro')}
          </p>
          
          {/* Policy Item 1 */}
          <div className="challenge-card stagger-1">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('dataCollection.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('dataCollection.content')}
              </p>
            </div>
          </div>

          {/* Policy Item 2 */}
          <div className="mt-4 challenge-card stagger-2">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('cookies.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('cookies.content')}
              </p>
            </div>
          </div>

          {/* Policy Item 3 */}
          <div className="mt-4 challenge-card stagger-3">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('localStorage.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('localStorage.content')}
              </p>
            </div>
          </div>

          {/* Policy Item 4 */}
          <div className="mt-4 challenge-card stagger-4">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('thirdParty.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('thirdParty.content')}
              </p>
            </div>
          </div>

          {/* Policy Item 5 */}
          <div className="mt-4 challenge-card stagger-5">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('yourRights.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('yourRights.content')}
              </p>
            </div>
          </div>

          {/* Policy Item 6 */}
          <div className="mt-4 challenge-card stagger-6">
            <div className="bg-black text-white p-4 slasher">
              <h3 className="font-sans font-bold text-lg md:text-xl">{tPrivacy('updates.title')}</h3>
            </div>
            <div className="border-2 border-black border-t-0 p-4 bg-white">
              <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                {tPrivacy('updates.content')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-12 md:mt-16 mb-8 bg-cream border-2 border-black p-6 md:p-12 slasher">
            <div className="inline-block bg-black px-4 py-1 slasher border border-black mb-4 challenge-badge">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">{t('helpDesk')}</span>
            </div>
            <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-black leading-[0.9] mb-8 uppercase">
              {t('faqTitle')}
            </h2>
            <div className="space-y-0">
              {/* FAQ Item 1 */}
              <div className="challenge-card stagger-1">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    {tFaq('q1.question')}
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    {tFaq('q1.answer')}
                  </p>
                </div>
              </div>
              {/* FAQ Item 2 */}
              <div className="mt-4 challenge-card stagger-2">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    {tFaq('q2.question')}
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    {tFaq('q2.answer')}
                  </p>
                </div>
              </div>
              {/* FAQ Item 3 */}
              <div className="mt-4 challenge-card stagger-3">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    {tFaq('q3.question')}
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    {tFaq('q3.answer')}
                  </p>
                </div>
              </div>
              {/* FAQ Item 4 */}
              <div className="mt-4 challenge-card stagger-4">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    {tFaq('q4.question')}
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    {tFaq('q4.answer')}
                  </p>
                </div>
              </div>
              {/* FAQ Item 5 */}
              <div className="mt-4 challenge-card stagger-5">
                <div className="bg-black text-white p-4 slasher">
                  <h3 className="font-sans font-bold text-lg md:text-xl">
                    {tFaq('q5.question')}
                  </h3>
                </div>
                <div className="border-2 border-black border-t-0 p-4 bg-white">
                  <p className="font-mono text-sm md:text-base text-charcoal leading-relaxed">
                    {tFaq('q5.answer')}
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
    </>
  );
}
