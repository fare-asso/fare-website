import prisma from "@/helpers/db";

const maxCacheSize = 150;

async function cleanUpCache() : Promise<void> {

    const cacheCount = await prisma.locationCache.count();

    if (cacheCount > maxCacheSize) {


        // fetch the last accessed cache elements that are excess
        const excessEntries = await prisma.locationCache.findMany({
            orderBy: {
                lastAccessedAt: 'asc'
            },
            take: cacheCount - maxCacheSize,
            select: {
                id: true
            }
        })

        const excessIds = excessEntries.map(entry => entry.id)

        // delete all entries that are in excess
        await prisma.locationCache.deleteMany({
            where: {
                id: {
                    in: excessIds
                }
            }
        });
    }
}

/**
 * An API request which gives autocompletion for an address query.
 * This API route uses the LocationCache model in the database to store unknown requests.
 */
export async function GET(request: Request) {

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return new Response(JSON.stringify({ error: 'Erreur: Requête nulle' }), { status: 400 });
    }

  try {
    // Check if the address is cached
    const cachedResult = await prisma.locationCache.findFirst({
        where: {
            query: {
                equals: query.toLowerCase()
            }
        }
    });


    if (cachedResult) {
        // update cache
        const updatedCachedResult = await prisma.locationCache.update({
            where: {
                id: cachedResult?.id
            }, data: {
                lastAccessedAt: new Date(Date.now())
            }
        })
        // Return the cached result if found
        return Response.json({
            success: true,
            results: cachedResult.response,
            from: 'cache'
        });
    }

    // Address not cached, fetch from Nominatim API
    const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&accept-language=FR&countrycodes=fr`,
        {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
        }
    );

    if (!nominatimResponse.ok) {
        throw new Error('Failed to fetch data from Nominatim API');
    }

    const jsonData : {place_id: number, display_name: string, lat: string, lon: string}[] = await nominatimResponse.json();

    /* Cache the response in the database */

    const responseToCache = jsonData.length > 0 ? jsonData : [];

    // reduce the responses to keep only essential informations
    const reducedResponse = jsonData.map((item) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
    }))
    
    await prisma.locationCache.create({
        data: {
            query: query.toLowerCase(),
            response: reducedResponse,
        }
    });

    // Clean up cache if it exceeds maxCacheSize
    await cleanUpCache();
    
    // Return the results
    return Response.json({
        success: true,
        results: reducedResponse,
        from: 'nominatim'
    });


  } catch (error) {
        console.error('Error fetching location data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
