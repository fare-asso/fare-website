"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "../input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingRing from "@/components/dashboard/loadingRing";

interface SearchLocationApiResponse {
  place_id: number,
  display_name: string,
  lat: string,
  lon: string
}

interface Coordinates {
  lat: string,
  lon: string
}

function isLocationObjectJson(value: string): boolean {
  try {
      const json = JSON.parse(value);
      return true
  } catch {
      return false
  }
}



export default function LocationPicker({ defaultValue, name }: { defaultValue: string, name: string }) {

  const isDefaultValueJson: boolean = isLocationObjectJson(defaultValue);

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultElements, setSearchResultElements] = useState(<></>);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<string>(defaultValue);

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
            `/api/searchLocation?query=${encodeURIComponent(debouncedQuery)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          const json: {sucess: boolean, results: SearchLocationApiResponse[], from: 'string'} = await res.json();

          const results = json.results;

          if (results.length > 0) {
            const elements = results.map((response) => 
              <Button 
                variant="outline" 
                className="w-full mb-1 text-start whitespace-normal justify-start h-auto" 
                key={response.place_id} 
                onClick={() => handleSuggestionClick(response.display_name, {lat: response.lat, lon: response.lon})}
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

  const handleSuggestionClick = (displayName: string, coordinates: Coordinates) => {
    setValue(JSON.stringify({
      displayName: displayName,
      coordinates: coordinates
    }));

    if (inputRef.current) {
      inputRef.current.value = displayName;
    }

    setSearchQuery(""); // Réinitialiser la requête de recherche pour empêcher une nouvelle recherche
    setSearchResultElements(<></>); // Cacher les résultats de la recherche
  };

  return (
    <div className="relative">
      <input type="hidden" id="locationSearch" name={name} value={value} />
      <Input
        ref={inputRef}
        defaultValue={isDefaultValueJson ? JSON.parse(defaultValue).displayName : defaultValue}
        onChange={handleSearchChange}
        autoComplete="off"
      />
      <div id="results" className="absolute overflow-auto z-20">
        {isLoading ? <div className="w-[350px] rounded-md mt-2 px-3 py-1 bg-card border text-foreground flex flex-row items-center justify-center"> <LoadingRing/> Chargement...</div> : searchResultElements}
      </div>
    </div>
  );
}
