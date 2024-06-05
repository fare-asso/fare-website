"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "../input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LocationPicker({defaultValue} : {defaultValue : string}) {

  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResultElements, setSearchResultElements] = useState(<></>);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // Délai de 500 ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (debouncedQuery) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${debouncedQuery}&format=json&limit=3&accept-language=FR`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const json = await res.json();
        if (json.length > 0) {
          const elements = json.map((response : any) => 
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
      }
    };

    fetchLocation();
  }, [debouncedQuery]);

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleSuggestionClick = (displayName : string) => {
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
        type="search"
        id="locationSearch"
        name="location"
        defaultValue={defaultValue}
        onChange={handleSearchChange}
        autoComplete="off"
      />
      <div id="results" className="absolute overflow-auto z-20">{searchResultElements}</div>
    </div>
  );
}
