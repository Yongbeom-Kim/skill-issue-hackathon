# E2E Trip Planner - Master Data Source Catalog

> Compiled from 7 parallel research agents. Covers 100+ data sources across 8 categories.

---

## Quick Reference: Hackathon Priority Stack

### Tier 1 - Use Immediately (Free, instant access)

| Source | What For | Access | Cost |
|--------|----------|--------|------|
| **Amadeus Self-Service** | Flights + hotels + activities + POI + busiest periods | Official API | Free (2K calls/mo) |
| **Google Maps Places API** | POI details, photos, 5 reviews, hours | Official API | Free ($200/mo credit) |
| **YouTube Data API v3** | Travel vlogs, transcripts, comments | Official API | Free (10K units/day) |
| **Reddit (PRAW)** | Raw tips, itineraries, scam warnings | Official API | Free (60 req/min) |
| **WikiVoyage** | Curated travel guides (CC-BY-SA) | MediaWiki API | Free |
| **OpenTripMap** | 10M+ tourist attractions | Official API | Free |
| **Rome2Rio** | Multi-modal transport routing | Official API | Free (100K req/mo) |
| **REST Countries** | Country metadata (currency, language, TZ) | Official API | Free, no key needed |
| **Open-Meteo** | Weather forecasts | Official API | Free, no key needed |
| **Nager.Date** | Public holidays (100+ countries) | Official API | Free, no key needed |
| **Unsplash** | Destination photos | Official API | Free (50 req/hr demo) |
| **Queue-Times.com** | Theme park wait times | Official API | Free |
| **populartimes (Python)** | Google Popular Times | Open-source lib | Free |
| **Passport Index Dataset** | Visa requirements | GitHub CSV | Free |
| **ExchangeRate-API** | Currency conversion | Official API | Free, no key needed |

### Tier 2 - Strong Options (Low cost / some setup)

| Source | What For | Access | Cost |
|--------|----------|--------|------|
| **Xiaohongshu (RED)** | Chinese traveler reviews (Asian destinations) | Apify / RapidAPI | Free tier |
| **Tabelog** | Japan restaurants (gold standard) | Apify / Kaggle | Free tier |
| **Naver Blog** | Korean travel reviews | Kakao Search API | Free |
| **Rakuten Travel** | Japan hotels/ryokan | Official API | Free |
| **Hot Pepper Gourmet** | Japan restaurants | Official API | Free |
| **BestTime.app** | Hourly venue busyness | Official API | Free trial |
| **Google Street View** | Destination visual previews | Official API | Free ($200/mo credit) |
| **Skyscanner** | Flight search | RapidAPI | Free (cached) |
| **Ticketmaster** | Live events | Official API | Free (5K/day) |
| **Meteostat** | Historical climate (best time to visit) | Python library | Free |
| **Visual Crossing** | 50yr weather history | Official API | Free (1K records/day) |
| **PyTrends** | Destination popularity trends | Python library | Free |
| **Atlas Obscura** | Hidden gems / unusual places | NPM / Apify | Free |
| **Spotted by Locals** | Verified local tips (85+ cities) | TinyFish scrape | Per-call |
| **Outscraper** | Google Maps reviews (500+ per place) | Official API | 500 free/mo |

### Tier 3 - Valuable with More Effort

| Source | What For | Access | Cost |
|--------|----------|--------|------|
| **TripAdvisor** | Reviews + forums | Content API / Apify | Paid |
| **Booking.com reviews** | Hotel sentiments (liked/disliked) | Apify / TinyFish | Per-use |
| **TikTok comments** | Viral crowding alerts, trendy spots | Apify | $0.30/1K |
| **Foursquare** | 16B+ check-ins, venue popularity | Official API | Free V2 endpoints |
| **PredictHQ** | Event-driven crowd predictions | Official API | Free tier |
| **Dianping** | China restaurant reviews | Apify | Paid |
| **Daum Cafe / Tistory** | Korean travel forums | Kakao API | Free |
| **Jalan.net** | Japan hotel/ryokan reviews | TinyFish (JP proxy) | Per-call |
| **SerpApi** | Google Flights/Hotels scraping | Official API | $75/mo |
| **Cruise ship schedules** | Port city crowding signals | CruiseMapper scrape | Manual/scrape |

### Skip for Hackathon

| Source | Why |
|--------|-----|
| Instagram scraping | Aggressive anti-bot, legal risks |
| Twitter/X API | $100-$42K/month |
| Airbnb | No public API |
| Booking.com hotel API | Slow partner approval |
| Numbeo API | $260/month |
| Placer.ai | Enterprise-only pricing |
| Lonely Planet Thorn Tree | Defunct |

---

## Category 1: Google Ecosystem

| Source | Data | Access Method | Free Tier | Native Language |
|--------|------|---------------|-----------|-----------------|
| **Places API (New)** | POI details, photos, 5 reviews, hours, amenities | Official API | 5K-10K calls/mo | 80+ languages via `languageCode` |
| **Google Maps Reviews** | Review text in original language | Outscraper / SerpApi | 500 free (Outscraper) | Reviews in original language + `textLanguageCode` |
| **Directions / Routes** | Turn-by-turn, travel time, distance | Official API | 10K calls/mo | Yes |
| **Geocoding** | Address <-> coordinates | Official API | 10K calls/mo | Yes |
| **Street View** | 360-degree street imagery | Official API | ~28.5K free images/mo | Visual (N/A) |
| **Google Flights** | Flight prices, routes, airlines | SerpApi / TinyFish / `fast-flights` lib | 250/mo (SerpApi) | `hl` + `gl` params |
| **Google Hotels** | Hotel prices from multiple OTAs | SerpApi / TinyFish | 250/mo (SerpApi) | `hl` + `gl` params |
| **Google Things to Do** | Attractions, ticket prices | Places API + TinyFish | Hybrid | Yes |
| **Google Travel Explore** | Destination discovery, flight price context | SerpApi | 250/mo (SerpApi) | `hl` + `gl` params |
| **Google Trends** | Destination search popularity | PyTrends (Python) | Unlimited* | Geographic filtering to city level |
| **Google Popular Times** | Hourly crowd levels (historical + live) | populartimes lib / Outscraper | Free (lib) / 500 free (Outscraper) | N/A (numeric) |
| **Google Image Search** | Destination photos | Custom Search API | 100/day | `gl` + `hl` params |

**Key limitation:** Google Flights, Hotels, Things to Do, Travel, Popular Times, and Trends have **NO official APIs**. Access via scraping tools (SerpApi, TinyFish, Python libraries).

---

## Category 2: Social Media & UGC

| Source | Data Type | Access Method | Free Tier | Language | Hackathon Score |
|--------|-----------|---------------|-----------|----------|-----------------|
| **YouTube** | Travel vlogs, transcripts, comments | Official Data API v3 + youtube-transcript-api | 10K units/day | 100+ languages (auto-transcript) | 5/5 |
| **Reddit** | Tips, itineraries, scam warnings, budget advice | PRAW (official) | 60 req/min | English (some intl subreddits) | 5/5 |
| **Xiaohongshu (RED)** | Detailed Chinese travel guides, food, shopping | Apify / RapidAPI / MCP Server | Free tiers | Chinese (needs translation) | 4/5 |
| **Naver Blog** | Korean travel reviews (30+ photos per post) | Kakao Search API + TinyFish | Free API | Korean (needs translation) | 4/5 |
| **Tabelog** | Japan restaurant reviews (gold standard) | Apify / Kaggle / tabetree_api | Free tiers | Japanese | 4/5 |
| **TikTok** | Viral travel content, comments | Apify / TinyFish stealth | $0.30/1K | Global | 3/5 |
| **Pinterest** | Visual travel inspiration, boards | Apify | Pay-per-use | English-dominant | 3/5 |
| **Instagram** | Location-tagged posts, hashtags | Graph API (limited) / Apify | 200 calls/hr | Global | 2/5 |
| **Weibo** | Chinese travel posts | Apify | Pay-per-use | Chinese | 2/5 |
| **Twitter/X** | Real-time travel alerts | Too expensive | N/A | Global | 1/5 |

---

## Category 3: Travel Platforms (Booking/Reviews)

### Flights & Transport

| Source | Data | Access | Free Tier | Hackathon Score |
|--------|------|--------|-----------|-----------------|
| **Amadeus** | 400+ airlines, hotels, activities, POI, busiest periods | Official Self-Service API | 2K flights/mo (test) | 5/5 |
| **Rome2Rio** | Multi-modal (flights, trains, buses, ferries) | Official API | 100K req/mo | 5/5 |
| **Skyscanner** | Flights (cached + live) | RapidAPI | Free cached | 4/5 |
| **Kiwi.com Tequila** | Budget flights, virtual interlining | Official API | Free tier (50K MAU req) | 3/5 |
| **Japan ODPT** | Tokyo transit (JR, Metro, Toei) | Official (free registration) | Free | 4/5 |
| **Transitland** | Global public transit (2,500+ agencies) | Official API | Free | 4/5 |

### Accommodation

| Source | Data | Access | Free Tier | Hackathon Score |
|--------|------|--------|-----------|-----------------|
| **Amadeus Hotels** | 150K+ properties | Official API (bundled) | Part of Amadeus free tier | 5/5 |
| **Rakuten Travel** | Japan hotels/ryokan | Official API | Free | 4/5 |
| **Agoda** | Asia-Pacific hotels | Partner API | Requires approval | 2/5 |
| **Jalan.net** | Japan accommodations | TinyFish (JP proxy) | Per-call | 3/5 |

### Activities & Tours

| Source | Data | Access | Free Tier | Hackathon Score |
|--------|------|--------|-----------|-----------------|
| **Amadeus Tours & Activities** | 300K+ activities (aggregates Viator, GetYourGuide, Klook, 40+ more) | Official API | Part of Amadeus free tier | 5/5 |
| **Klook** | Asian activities | Via Amadeus aggregation | N/A direct | 4/5 (via Amadeus) |

### Dining

| Source | Data | Access | Free Tier | Hackathon Score |
|--------|------|--------|-----------|-----------------|
| **Yelp Fusion** | US/Canada restaurants, tips, wait times | Official API | 5K calls/day (30-day trial) | 4/5 |
| **Tabelog** | Japan restaurants | Apify / Kaggle | Free tiers | 4/5 |
| **Hot Pepper Gourmet** | Japan restaurants | Official API | Free | 4/5 |
| **MangoPlate** | Korea restaurants | No API (scrape only) | N/A | 1/5 |
| **Dianping** | China restaurants | No intl API | N/A | 1/5 |

---

## Category 4: Local / Native Language Sources (Key Differentiator)

These contain data that **does NOT exist** in English-language platforms.

### Japan
| Source | What | Why It Matters | Access |
|--------|------|----------------|--------|
| **Tabelog** | Restaurant reviews | 3.5/5 = exceptional (only 3% of restaurants). Google reviews in Japan are tourist-inflated noise | Apify, Kaggle, TinyFish+JP proxy |
| **Rakuten Travel** | Hotels/ryokan | **Free official API**. Domestic focus with ryokan/minshuku listings missing from Western OTAs | Official API |
| **Hot Pepper Gourmet** | Restaurants + reservations | **Free official API**. Covers izakayas and local spots Google misses | Official API |
| **Jalan.net** | Hotels/ryokan/travel packages | 20K+ properties, domestic-focused reviews | TinyFish+JP proxy |
| **Gurunavi** | Restaurants | Free API tier. Covers 500K+ restaurants | Official API |
| **Ikyu** | Luxury hotels/restaurants | Premium segment data | TinyFish+JP proxy |

### Korea
| Source | What | Why It Matters | Access |
|--------|------|----------------|--------|
| **Naver Blog** | Travel reviews | Koreans document EVERYTHING (30+ photos per restaurant visit). Google Maps restricted to 1:25K scale in Korea | Kakao Search API + TinyFish |
| **Naver Maps** | POI, business data | Most Korean businesses register on Naver, NOT Google | Apify scraper |
| **Kakao Maps** | Maps, navigation | Dominant maps app in Korea | Kakao Developers API |
| **MangoPlate** | Restaurant reviews | Korea's Yelp. 200K+ restaurants | No API (scrape) |
| **Yanolja** | Budget accommodation | Motels/pensions that don't appear on Booking.com | TinyFish |

### China
| Source | What | Why It Matters | Access |
|--------|------|----------------|--------|
| **Xiaohongshu (RED)** | Travel guides | 300M users, 80%+ of Chinese travelers research here. Travel content surged 273% in 2023 | Apify, RapidAPI, MCP Server |
| **Dianping** | Restaurant/activity reviews | 300M reviews, 25M businesses, 2,300 cities. Per-dish ratings, wait times | Heavy anti-scraping |
| **Mafengwo** | Travel guides | China's TripAdvisor. Detailed itineraries by Chinese travelers | Scraping |
| **Ctrip/Trip.com** | Flights/hotels/reviews | China's largest OTA | Partner API |

### Southeast Asia
| Source | What | Why It Matters | Access |
|--------|------|----------------|--------|
| **Traveloka** | Flights/hotels | Dominant OTA in Indonesia/SEA | Partner API |
| **Grab** | Transport + food | Uber equivalent across SEA | TinyFish |
| **Wongnai** | Thai restaurants | Thailand's Yelp | TinyFish |
| **Foody.vn** | Vietnamese restaurants | Vietnam's Yelp | TinyFish |

### Europe
| Source | What | Why It Matters | Access |
|--------|------|----------------|--------|
| **TheFork** | Restaurant booking | Dominant in Southern Europe (France, Italy, Spain) | Apify |
| **Trainline** | Rail across Europe | 270+ operators, 45 countries | B2B only (use Rome2Rio instead) |
| **BlaBlaCar** | Ridesharing | Free API. Huge in France/Spain/Italy | Official API |
| **Komoot** | Hiking/outdoor routes | Dominant hiking app in Europe | Apify |

---

## Category 5: Community Sentiment & Raw Tips (Your Key Differentiator)

This is what makes your planner feel like advice from a well-traveled friend.

### Tip Categories to Extract
| Category | Example | Best Sources |
|----------|---------|-------------|
| **Timing** | "Go before 7am or skip it" | Reddit, Naver Blog, Google Reviews |
| **Crowding** | "Avoid cruise ship days (Mon/Wed)" | Reddit, TikTok comments, PredictHQ |
| **Hidden gems** | "The alley behind the market has better food" | Xiaohongshu, Reddit, Atlas Obscura |
| **Scam warnings** | "Taxi drivers overcharge at this station" | Reddit, TripAdvisor forums |
| **Budget hacks** | "Free museum day is first Sunday" | Reddit, WikiVoyage |
| **Cultural tips** | "Don't tip here", "Cash only" | Reddit, WikiVoyage, Naver Blog |
| **Real-time conditions** | "East wing closed for renovation until March" | Google Reviews, TikTok |
| **Seasonal** | "Cherry blossoms peak 2nd week of April" | Reddit, Naver Blog, Tabelog |

### Best Sources by Richness

| Source | Tip Richness | Volume | Freshness | Access |
|--------|-------------|--------|-----------|--------|
| **Reddit** (r/JapanTravel, r/solotravel) | Very High | Very High | Real-time | PRAW (free) |
| **YouTube comments** | High | High | Daily | Official API (free) |
| **Google Maps reviews (full text)** | High | Very High | Daily | Outscraper (500 free) |
| **Naver Blog** | Very High | High | Daily | Kakao API + TinyFish |
| **Xiaohongshu** | Very High | Very High | Real-time | Apify / RapidAPI |
| **TripAdvisor forums** | High | High | Weekly | Apify / TinyFish |
| **TikTok comments** | Medium | Very High | Real-time | Apify ($0.30/1K) |
| **Atlas Obscura** | High | Medium | Monthly | NPM lib / Apify |
| **Spotted by Locals** | Very High | Low | Weekly | TinyFish |

### TinyFish Goal Template for Tip Extraction
```
Extract ALL user reviews/tips visible on this page.
For each, extract:
1. text: The full review/tip text
2. rating: numeric rating if present, null otherwise
3. date: when posted
4. author: username or name
5. categories: classify each tip into one or more of:
   ["timing", "crowd", "budget", "scam_warning", "hidden_gem", "cultural", "seasonal", "real_time_condition"]

Return JSON: {"tips": [{text, rating, date, author, categories}]}
IMPORTANT: Extract FULL text, not truncated.
```

---

## Category 6: Real-Time Crowd & Busyness Data

| Source | Data | Access | Cost | Hackathon Score |
|--------|------|--------|------|-----------------|
| **Google Popular Times** | Hourly crowd levels + live busyness | populartimes (Python lib) / Outscraper | Free (lib) / 500 free | 5/5 |
| **BestTime.app** | Hourly foot traffic for venues (150+ countries) | Official API | Free trial | 4/5 |
| **Queue-Times.com** | Theme park ride wait times (80+ parks) | Official API | Free | 5/5 |
| **ThemeParks.wiki** | Disney/Universal wait times + schedules | Official API | Free | 5/5 |
| **Yelp Waitlist** | Restaurant wait time estimates | Yelp Fusion API | Free trial | 3/5 |
| **PredictHQ** | Event-driven crowd predictions | Official API | Free tier | 4/5 |
| **Amadeus Busiest Period** | Seasonal demand patterns by city | Official API | Part of free tier | 4/5 |
| **Cruise ship schedules** | Port city crowding days | CruiseMapper (scrape) | Manual | 3/5 |
| **GTFS-Realtime Occupancy** | Transit vehicle crowding levels | Open data feeds | Free | 3/5 |
| **Foursquare** | 16B+ check-ins, venue visit patterns | Official API | Free V2 endpoints | 3/5 |

---

## Category 7: Open Data & Reference

| Source | Data | Access | Cost | Hackathon Score |
|--------|------|--------|------|-----------------|
| **WikiVoyage** | CC-BY-SA travel guides (142K+ destinations) | MediaWiki API / dumps | Free | 5/5 |
| **Wikidata** | Structured destination facts (100M+ items) | SPARQL endpoint | Free | 5/5 |
| **OpenStreetMap** | POIs, routes, maps (entire world) | Overpass API / Nominatim | Free | 5/5 |
| **REST Countries** | Country metadata (250+ countries) | REST API | Free, no key | 5/5 |
| **UNESCO World Heritage** | 1,199+ sites with coordinates | UNESCO DataHub API | Free | 4/5 |
| **NPS API** | 400+ US national parks | Official API | Free (1K/hr) | 4/5 |
| **Passport Index Dataset** | Visa requirements (199 countries) | GitHub CSV | Free | 5/5 |
| **CDC Travel Notices** | Health advisories by destination | RSS/XML | Free | 3/5 |

---

## Category 8: Weather & Climate

| Source | Data | Access | Cost | Best For |
|--------|------|--------|------|----------|
| **Open-Meteo** | Forecasts (80+ variables) | REST API | Free, no key | Current trip weather |
| **OpenWeatherMap** | Current + 5-day forecast | Official API | 1K calls/day free | Current trip weather |
| **Visual Crossing** | 50+ years historical + 15-day forecast | Official API | 1K records/day free | "Best time to visit" |
| **Meteostat** | Historical climate normals (30-year avg) | Python library | Unlimited | "Best time to visit" |

---

## Architecture: How Data Flows Into the Trip Planner

```
USER INPUT (photos, social links, or typed destination)
  |
  v
EXTRACTION LAYER
  ├── Google Cloud Vision (landmark detection from photos)
  ├── youtube-transcript-api (travel vlog transcripts)
  ├── PRAW (Reddit tips)
  ├── TinyFish (scrape any site: Tabelog, Naver, RED, etc.)
  └── LLM structuring (extract destinations + preferences)
  |
  v
ENRICHMENT LAYER
  ├── Official: WikiVoyage, Wikidata, OpenTripMap, REST Countries
  ├── Sentiment: Google Reviews, Reddit, YouTube comments, Xiaohongshu
  ├── Crowd: Popular Times, BestTime, PredictHQ, Queue-Times
  ├── Weather: Open-Meteo + Visual Crossing (current + best-time-to-visit)
  └── Photos: Unsplash, Google Street View, Flickr
  |
  v
LOGISTICS LAYER
  ├── Flights: Amadeus + Skyscanner
  ├── Ground transport: Rome2Rio + Transitland
  ├── Hotels: Amadeus + Rakuten Travel (Japan)
  ├── Activities: Amadeus Tours (aggregates 45+ providers)
  ├── Dining: Yelp + Tabelog (JP) + Hot Pepper (JP) + Naver (KR)
  └── Practical: Passport Index (visa), ExchangeRate, Nager.Date (holidays)
  |
  v
PRESENTATION LAYER
  ├── Curated options with community sentiment overlay
  ├── "Best time to go" recommendations
  ├── Hidden gems from local-language sources
  └── Affiliate/redirect booking links
```

---

## Total Source Count by Category

| Category | Sources | Free/Low-Cost |
|----------|---------|---------------|
| Google Ecosystem | 12 | 10 |
| Social Media & UGC | 14 | 6 |
| Travel Platforms | 20+ | 8 |
| Local/Native Language | 20+ | 6 |
| Community Sentiment | 15+ | 8 |
| Real-Time Crowd | 10 | 6 |
| Open Data & Reference | 18 | 18 |
| Weather & Climate | 4 | 4 |
| **Total** | **110+** | **66+** |
