"use client";

import { useState, useEffect } from "react";
import { X, Download, Copy, Check, Twitter, Facebook, Link } from "lucide-react";
import html2canvas from "html2canvas";

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  height?: number;
  weight?: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  stats?: PokemonStat[];
  abilities?: PokemonAbility[];
}

interface ShareModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

// Type-based gradient backgrounds
const getTypeGradient = (type: string): string => {
  const gradients: Record<string, string> = {
    normal: "linear-gradient(180deg, #C6C6A7 0%, #A8A878 100%)",
    fire: "linear-gradient(180deg, #F5AC78 0%, #F08030 100%)",
    water: "linear-gradient(180deg, #9DB7F5 0%, #6890F0 100%)",
    electric: "linear-gradient(180deg, #FAE078 0%, #F8D030 100%)",
    grass: "linear-gradient(180deg, #A7DB8D 0%, #78C850 100%)",
    ice: "linear-gradient(180deg, #BCE6E6 0%, #98D8D8 100%)",
    fighting: "linear-gradient(180deg, #D67873 0%, #C03028 100%)",
    poison: "linear-gradient(180deg, #C183C1 0%, #A040A0 100%)",
    ground: "linear-gradient(180deg, #EBD69D 0%, #E0C068 100%)",
    flying: "linear-gradient(180deg, #C6B7F5 0%, #A890F0 100%)",
    psychic: "linear-gradient(180deg, #FA92B2 0%, #F85888 100%)",
    bug: "linear-gradient(180deg, #C6D16E 0%, #A8B820 100%)",
    rock: "linear-gradient(180deg, #D1C17D 0%, #B8A038 100%)",
    ghost: "linear-gradient(180deg, #A292BC 0%, #705898 100%)",
    dragon: "linear-gradient(180deg, #A27DFA 0%, #7038F8 100%)",
    dark: "linear-gradient(180deg, #A29288 0%, #705848 100%)",
    steel: "linear-gradient(180deg, #D1D1E0 0%, #B8B8D0 100%)",
    fairy: "linear-gradient(180deg, #F4BDC9 0%, #EE99AC 100%)",
  };
  return gradients[type] || gradients.normal;
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

// Card dimensions (fixed at 1080x1520)
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1520;

// ============================================================
// REUSABLE CARD UI COMPONENT
// ============================================================
interface PokemonCardUIProps {
  pokemon: Pokemon;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  isExport?: boolean; // When true, applies tighter spacing for export
}

function PokemonCardUI({ pokemon, hp, attack, defense, speed, isExport = false }: PokemonCardUIProps) {
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const primaryType = pokemon.types[0]?.type.name || "normal";

  // Export mode uses slightly reduced spacing to ensure footer fits
  const statsGap = isExport ? "16px" : "24px";
  const statsPadding = isExport ? "20px 50px" : "30px 50px";
  const artBoxMargin = isExport ? "24px 40px" : "30px 40px";
  const footerPadding = isExport ? "28px 32px 44px 32px" : "32px";

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        border: "24px solid #F5BC22",
        borderRadius: "40px",
        background: getTypeGradient(primaryType),
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header Bar - Dark background with Name & HP */}
      <div
        style={{
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          padding: "40px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: "900",
            fontSize: "70px",
            color: "#FFFFFF",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          {capitalizedName}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: "700",
              color: "#888",
            }}
          >
            HP
          </span>
          <span
            style={{
              fontFamily: "system-ui",
              fontWeight: "900",
              fontSize: "60px",
              color: "#EF4444",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {hp}
          </span>
        </div>
      </div>

      {/* Art Box - White background with Pokemon artwork */}
      <div
        style={{
          height: "750px",
          margin: artBoxMargin,
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "inset 0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pokemon.sprites.other["official-artwork"].front_default}
          alt={`${capitalizedName} official artwork`}
          crossOrigin="anonymous"
          style={{
            height: "650px",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      {/* Stats Section */}
      <div
        style={{
          padding: statsPadding,
          display: "flex",
          flexDirection: "column",
          gap: statsGap,
        }}
      >
        {/* Type Badges Row */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          {pokemon.types.map((typeInfo) => (
            <div
              key={typeInfo.type.name}
              style={{
                minWidth: "120px",
                height: "60px",
                borderRadius: "30px",
                backgroundColor: getTypeColor(typeInfo.type.name),
                border: "4px solid rgba(0,0,0,0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 24px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  letterSpacing: "1px",
                }}
              >
                {typeInfo.type.name}
              </span>
            </div>
          ))}
        </div>

        {/* Base Stats Bar */}
        <div
          style={{
            background: "rgba(0,0,0,0.15)",
            borderRadius: "16px",
            padding: "30px 40px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "rgba(0,0,0,0.6)",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              ATK
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "900",
                color: "#1a1a1a",
              }}
            >
              {attack}
            </div>
          </div>
          <div
            style={{
              width: "2px",
              height: "60px",
              background: "rgba(0,0,0,0.2)",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "rgba(0,0,0,0.6)",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              DEF
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "900",
                color: "#1a1a1a",
              }}
            >
              {defense}
            </div>
          </div>
          <div
            style={{
              width: "2px",
              height: "60px",
              background: "rgba(0,0,0,0.2)",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "rgba(0,0,0,0.6)",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              SPD
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "900",
                color: "#1a1a1a",
              }}
            >
              {speed}
            </div>
          </div>
        </div>

        {/* Abilities Footer */}
        <div
          style={{
            background: "rgba(0,0,0,0.1)",
            borderRadius: "12px",
            padding: "24px 32px",
            border: "2px solid rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "rgba(0,0,0,0.6)",
              textTransform: "uppercase",
              marginBottom: "8px",
              letterSpacing: "2px",
            }}
          >
            Abilities
          </p>
          <p
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1a1a1a",
              lineHeight: "1.3",
              textTransform: "capitalize",
            }}
          >
            {pokemon.abilities && pokemon.abilities.length > 0
              ? pokemon.abilities
                  .map((a) => a.ability.name.replace(/-/g, " "))
                  .join(" / ")
              : "Unknown"}
          </p>
        </div>
      </div>

      {/* Footer - Website branding */}
      <div
        style={{
          marginTop: "auto",
          background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
          padding: footerPadding,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: "800",
            fontSize: "30px",
            color: "#F5BC22",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          randompokemon.co
        </span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN SHARE MODAL COMPONENT
// ============================================================
export default function ShareModal({ pokemon, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [instagramToast, setInstagramToast] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [previewScale, setPreviewScale] = useState(0.3);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Calculate preview scale based on viewport
  useEffect(() => {
    const calculateScale = () => {
      const maxPreviewWidth = Math.min(window.innerWidth - 80, 400);
      const maxPreviewHeight = window.innerHeight * 0.5;
      const scaleByWidth = maxPreviewWidth / CARD_WIDTH;
      const scaleByHeight = maxPreviewHeight / CARD_HEIGHT;
      setPreviewScale(Math.min(scaleByWidth, scaleByHeight, 0.35));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  // Safely get the current URL (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const capitalizedName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  // Get stats
  const getStat = (name: string): number => {
    const stat = pokemon.stats?.find((s) => s.stat.name === name);
    return stat?.base_stat || Math.floor(Math.random() * 50) + 50;
  };

  const hp = getStat("hp");
  const attack = getStat("attack");
  const defense = getStat("defense");
  const speed = getStat("speed");

  // Generate image from the GHOST CARD (hidden HD version)
  const generateImage = async (): Promise<HTMLCanvasElement | null> => {
    const element = document.getElementById("download-card-target");
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for sharpness and better color accuracy
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff", // Force white background to prevent darkening
      logging: false,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      windowWidth: 1920,
    });

    return canvas;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await generateImage();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${pokemon.name}-trading-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const canvas = await generateImage();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // Social Share Functions
  const shareToTwitter = () => {
    const text = `Check out this ${capitalizedName} Pokemon card!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToReddit = () => {
    const title = `Look at this ${capitalizedName} Pokemon!`;
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleInstagramShare = async () => {
    await handleDownload();
    setInstagramToast(true);
    setTimeout(() => setInstagramToast(false), 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  // Scaled dimensions for the preview container
  const scaledWidth = CARD_WIDTH * previewScale;
  const scaledHeight = CARD_HEIGHT * previewScale;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(460px, 95vw)" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="font-bold text-lg text-white">Pokemon Trading Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ============================================ */}
        {/* 1. VISIBLE PREVIEW (Scaled for screen)      */}
        {/* ============================================ */}
        <div className="p-4 flex justify-center">
          <div
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              overflow: "hidden",
            }}
          >
            {/* Scaled preview - uses CSS transform */}
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <PokemonCardUI
                pokemon={pokemon}
                hp={hp}
                attack={attack}
                defense={defense}
                speed={speed}
                isExport={false}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-neutral-700 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            {downloading ? "GENERATING..." : "DOWNLOAD"}
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} />
                COPIED!
              </>
            ) : (
              <>
                <Copy size={18} />
                COPY IMAGE
              </>
            )}
          </button>
        </div>

        {/* Social Sharing Section */}
        <div className="p-4 border-t border-neutral-700">
          <h3 className="font-mono text-xs text-neutral-400 mb-3 text-center uppercase tracking-wider">
            Share This Discovery
          </h3>
          <div className="flex justify-center gap-3">
            {/* Twitter/X */}
            <button
              onClick={shareToTwitter}
              className="h-12 w-12 bg-black flex items-center justify-center hover:bg-neutral-800 hover:scale-105 transition-all border-2 border-neutral-700 rounded-lg"
              aria-label="Share on X (Twitter)"
              title="Share on X"
            >
              <Twitter size={20} className="text-[#F5BC22]" />
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="h-12 w-12 bg-black flex items-center justify-center hover:bg-neutral-800 hover:scale-105 transition-all border-2 border-neutral-700 rounded-lg"
              aria-label="Share on Facebook"
              title="Share on Facebook"
            >
              <Facebook size={20} className="text-[#F5BC22]" />
            </button>

            {/* Reddit */}
            <button
              onClick={shareToReddit}
              className="h-12 w-12 bg-black flex items-center justify-center hover:bg-neutral-800 hover:scale-105 transition-all border-2 border-neutral-700 rounded-lg"
              aria-label="Share on Reddit"
              title="Share on Reddit"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#F5BC22]"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagramShare}
              className="h-12 w-12 bg-black flex items-center justify-center hover:bg-neutral-800 hover:scale-105 transition-all border-2 border-neutral-700 rounded-lg"
              aria-label="Save for Instagram"
              title="Save for Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#F5BC22]"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="h-12 w-12 bg-black flex items-center justify-center hover:bg-neutral-800 hover:scale-105 transition-all border-2 border-neutral-700 rounded-lg"
              aria-label="Copy link"
              title="Copy link"
            >
              {linkCopied ? (
                <Check size={20} className="text-emerald-400" />
              ) : (
                <Link size={20} className="text-[#F5BC22]" />
              )}
            </button>
          </div>

          {/* Instagram Toast */}
          {instagramToast && (
            <div className="mt-3 bg-emerald-600 text-white text-xs font-mono py-2 px-4 rounded text-center">
              Image saved! Open Instagram to post.
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* 2. THE GHOST CARD (Hidden off-screen)       */}
      {/*    This is what html2canvas captures        */}
      {/*    STRICT 1080x1520, no scaling             */}
      {/* ============================================ */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div id="download-card-target">
          <PokemonCardUI
            pokemon={pokemon}
            hp={hp}
            attack={attack}
            defense={defense}
            speed={speed}
            isExport={true}
          />
        </div>
      </div>
    </div>
  );
}
