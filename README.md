# RANDOM POKEMON GENERATOR - Cypherpunk Pokemon Team Builder

A retro-futuristic Pokemon team generator built with Next.js 14+ and Tailwind CSS, featuring a high-end cypherpunk aesthetic inspired by the Solana Cypherpunk Hackathon.

## Features

- 🎲 Generate random teams of 6 unique Pokemon (from Pokédex #1-1025)
- 🎨 Cypherpunk design system with custom color palette and "slasher" cut-corner effects
- ⚡ Parallel API calls for optimal performance
- 📱 Fully responsive (1 column mobile, 3 columns desktop)
- 🔍 Detailed Pokemon stats and information pages
- 🛍️ Direct links to Amazon merch search

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **API**: PokeAPI (https://pokeapi.co)
- **Fonts**: Space Grotesk & Space Mono (Google Fonts)

## Design System

### Color Palette
- Background (Cream): `#FBE9BB`
- Primary Text (Black): `#0F0F0F`
- Secondary Text (Charcoal): `#2C2A26`
- Action Button (Marigold): `#F5BC22` (Hover: `#E0A815`)
- Accent (Indigo): `#2E0D8B`
- Borders (Brass): `#AC8D39`

### Key Design Rules
- NO rounded corners (`border-radius: 0px`)
- "Slasher" cut-corner effect using `clip-path: polygon()`
- Pokemon images use `mix-blend-mode: multiply`
- Space Grotesk for headings, Space Mono for data/labels

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

To build the project for production:

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /pokemon/[name]
    page.tsx          # Individual Pokemon detail page
  globals.css         # Global styles with Cypherpunk theme
  layout.tsx          # Root layout with Google Fonts
  page.tsx            # Homepage with team generator
next.config.ts        # Next.js configuration
tailwind.config.ts    # Tailwind CSS custom theme
```

## License

MIT
