"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "../input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingRing from "@/components/dashboard/loadingRing";

export default function LocationPicker({ defaultValue, name }: { defaultValue: string, name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultElements, setSearchResultElements] = useState(<></>);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000); // Délai de 500 ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (debouncedQuery) {
        setIsLoading(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${debouncedQuery}&format=json&limit=3&accept-language=FR&countrycodes=fr`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          const json = await res.json();
          if (json.length > 0) {
            const elements = json.map((response: any) => 
              <Button 
                variant="outline" 
                className="w-full mb-1 text-start whitespace-normal justify-start h-auto" 
                key={response.place_id} 
                onClick={() => handleSuggestionClick(response.display_name)}
              >
                {response.display_name}
              </Button>
            );
            setSearchResultElements(
              <ScrollArea className="w-[350px] rounded-md mt-1 p-1">
                {elements}
              </ScrollArea>
            );
          } else {
            setSearchResultElements(<></>);
          }
        } catch (error) {
          console.error("Error fetching location data: ", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResultElements(<></>);
      }
    };

    fetchLocation();
  }, [debouncedQuery]);

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleSuggestionClick = (displayName: string) => {
    if (inputRef.current) {
      inputRef.current.value = displayName;
    }
    setSearchQuery(""); // Réinitialiser la requête de recherche pour empêcher une nouvelle recherche
    setSearchResultElements(<></>); // Cacher les résultats de la recherche
  };

  return (
    <div>
      <Input
        ref={inputRef}
        type="text"
        id="locationSearch"
        name={name}
        defaultValue={defaultValue}
        onChange={handleSearchChange}
        autoComplete="off"
      />
      <div id="results" className="absolute overflow-auto z-20">
        {isLoading ? <div className="w-[350px] rounded-md mt-2 px-3 py-1 bg-card border text-foreground flex flex-row items-center justify-center"> <LoadingRing/> Chargement...</div> : searchResultElements}
      </div>
    </div>
  );
}
