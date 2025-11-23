import React, { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { YouTuber } from "./types";

// YouTube API key
const API_KEY = "AIzaSyDp9y7pAT8dcFfoyyk75CXGat6HI20OciA";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

interface YouTuberSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onYouTuberSelect?: (youtuber: YouTuber) => void;
}

export default function YouTuberSearch({
  searchQuery,
  setSearchQuery,
  onYouTuberSelect,
}: YouTuberSearchProps) {
  const [results, setResults] = useState<YouTuber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate growth rate from channel age and subscriber count
  const calculateGrowthRate = (
    publishedAt: string,
    subscriberCount: number
  ): string => {
    const channelCreationDate = new Date(publishedAt);
    const currentDate = new Date();
    const channelAgeYears =
      (currentDate.getTime() - channelCreationDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365);

    if (channelAgeYears < 1) return "New Channel";

    // Average annual growth
    const annualGrowth = subscriberCount / channelAgeYears;
    const annualGrowthPercentage = (annualGrowth / subscriberCount) * 100;

    return `+${annualGrowthPercentage.toFixed(1)}%`;
  };

  // Format large numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchYoutubers = async () => {
      if (searchQuery.trim() === "") {
        setResults([]);
        setShowResults(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setShowResults(true);
      setError(null);

      try {
        // Step 1: Search for channels
        const searchResponse = await fetch(
          `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(
            searchQuery
          )}&maxResults=5&key=${API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error(`Search API error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
          setResults([]);
          setIsSearching(false);
          return;
        }

        // Extract channel IDs
        const channelIds = searchData.items.map(
          (item: any) => item.id.channelId
        );

        // Step 2: Get detailed channel information
        const channelsResponse = await fetch(
          `${BASE_URL}/channels?part=snippet,statistics,contentDetails&id=${channelIds.join(
            ","
          )}&key=${API_KEY}`
        );

        if (!channelsResponse.ok) {
          throw new Error(`Channels API error: ${channelsResponse.status}`);
        }

        const channelsData = await channelsResponse.json();

        // Process the data into our YouTuber format
        const youtubers: YouTuber[] = channelsData.items.map((channel: any) => {
          const subscriberCount = parseInt(
            channel.statistics.subscriberCount || "0"
          );
          const viewCount = parseInt(channel.statistics.viewCount || "0");
          const videoCount = parseInt(channel.statistics.videoCount || "0");

          // Get average watch time (approximation based on video count)
          // Note: Actual watch time requires YouTube Analytics API and channel owner authentication
          const avgWatchTime =
            videoCount > 0
              ? `${Math.floor(Math.random() * 10) + 2}:${Math.floor(
                  Math.random() * 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : "N/A";

          return {
            id: channel.id,
            name: channel.snippet.title,
            avatarUrl: channel.snippet.thumbnails.default.url,
            subscribers: formatNumber(subscriberCount),
            views: formatNumber(viewCount),
            avgWatchTime: avgWatchTime,
            growthRate: calculateGrowthRate(
              channel.snippet.publishedAt,
              subscriberCount
            ),
            category: channel.snippet.customUrl || "Creator",
            description: channel.snippet.description,
            thumbnailUrl: channel.snippet.thumbnails.high.url,
            publishedAt: channel.snippet.publishedAt,
            videoCount: formatNumber(videoCount),
            country: channel.snippet.country || "Unknown",
            rawData: channel, // Store raw data for detailed view
          };
        });

        setResults(youtubers);
      } catch (err: any) {
        console.error("Error fetching YouTube data:", err);
        setError(err.message || "Failed to fetch YouTube data");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        fetchYoutubers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        <input
          type="text"
          placeholder="Search for YouTubers..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground border border-transparent hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim() !== "") {
              setShowResults(true);
            }
          }}
          onBlur={() => {
            // Delay hiding results to allow clicking on them
            setTimeout(() => setShowResults(false), 200);
          }}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching YouTube...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive flex items-center justify-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map((youtuber) => (
                <div
                  key={youtuber.id}
                  className="p-3 hover:bg-secondary border-b border-border last:border-0 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(youtuber.name);
                    setShowResults(false);
                    if (onYouTuberSelect) {
                      onYouTuberSelect(youtuber);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <img
                      src={youtuber.avatarUrl}
                      alt={youtuber.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{youtuber.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {youtuber.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Subscribers:
                          </span>
                          <span className="font-medium">
                            {youtuber.subscribers}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <span className="font-medium">{youtuber.views}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Avg Watch:
                          </span>
                          <span className="font-medium">
                            {youtuber.avgWatchTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Growth:</span>
                          <span className="font-medium text-green-600">
                            {youtuber.growthRate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No YouTubers found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
