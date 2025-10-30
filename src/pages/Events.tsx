import { Search, Filter, Plus, Heart, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Events() {
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter events based on search, tab, and price
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "upcoming" 
      ? new Date(event.date) > new Date()
      : activeTab === "past"
      ? new Date(event.date) <= new Date()
      : true; // all
    
    const matchesPrice = priceFilter === "all" 
      ? true 
      : priceFilter === "free" 
      ? event.price === 0 
      : event.price > 0;

    return matchesSearch && matchesTab && matchesPrice;
  });

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Events
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Browse and book upcoming events
          </p>
        </div>
        <Button onClick={() => navigate("/organizer")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events, venues, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events
          </TabsTrigger>
          <TabsTrigger value="all">
            All Events
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>
        
        {/* Price Filter */}
        <div className="flex gap-2">
          {["all", "free", "paid"].map((price) => (
            <Button
              key={price}
              variant={priceFilter === price ? "default" : "outline"}
              size="sm"
              onClick={() => setPriceFilter(price)}
            >
              {price === "all" ? "All Prices" : price === "free" ? "Free" : "Paid"}
            </Button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">Error loading events</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {searchQuery ? "No events found matching your search." : "No events available yet."}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/organizer")}
              >
                Create First Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer transition-shadow hover:shadow-lg group overflow-hidden"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              {/* Event Banner Image */}
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-muted/50" />
                <Badge 
                  variant={event.price === 0 ? "success" : "default"}
                  className="absolute top-3 right-3"
                >
                  {event.price === 0 ? "Free" : `$${event.price}`}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event.id);
                  }}
                  className="absolute top-3 left-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.has(event.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
                  />
                </button>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                  {event.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1">
                  {event.description || "No description available"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Event Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date TBD"}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}`);
                  }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}