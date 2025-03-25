"use client";

import { useState, useEffect } from "react";

// Define interfaces for type safety
interface Quote {
  text: string;
  author: string;
}

// This would typically come from an API or database
const quotes: Quote[] = [
  {
    text: "La discipline est le pont entre les objectifs et les accomplissements.",
    author: "Jim Rohn"
  },
  {
    text: "Le succès n'est pas définitif, l'échec n'est pas fatal : c'est le courage de continuer qui compte.",
    author: "Winston Churchill"
  },
  {
    text: "La douleur que vous ressentez aujourd'hui sera la force que vous sentirez demain.",
    author: "Arnold Schwarzenegger"
  },
  {
    text: "Le corps atteint ce que l'esprit croit.",
    author: "Napoleon Hill"
  },
  {
    text: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui.",
    author: "Franklin D. Roosevelt"
  }
];

export function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote>({ text: "", author: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API based on workout type
    // For now, we'll just pick a random quote from our local array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg animate-pulse">
        <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
      <p className="text-blue-800 dark:text-blue-200 italic mb-2">{quote.text}</p>
      <p className="text-blue-600 dark:text-blue-300 text-sm font-medium text-right">— {quote.author}</p>
    </div>
  );
}
