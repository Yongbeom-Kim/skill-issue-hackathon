# Booking & Logistics Data Sources Catalog

> Mainstream and specialized sources for flights, hotels, car rentals, activities, visas, and other trip logistics. Focused on scrapable websites and APIs that provide real pricing and availability data.

---

## FLIGHTS

### 1. Google Flights
- **URL:** https://www.google.com/travel/flights
- **Language:** Multi-language
- **What it is:** Google's flight metasearch engine aggregating prices from airlines and OTAs
- **Unique data:**
  - Price tracking and historical price graphs (cheapest time to fly)
  - "Explore" feature showing cheapest destinations from an origin on a map
  - Carbon emission estimates per flight
  - Price guarantee (selected routes)
  - Date flexibility grid showing cheapest dates across a month
- **Scraping feasibility:**
  - **SerpApi:** [Google Flights API](https://serpapi.com/google-flights-api) -- structured JSON results for flight searches
  - **Bright Data:** Google Flights scraper available
  - **Apify:** Multiple Google Flights actors available
  - **TinyFish:** Possible but heavy JS rendering; use `stealth` profile with `wait_for` on fare elements
  - **Difficulty:** Medium-Hard. Heavily dynamic, Google anti-bot is aggressive

### 2. Skyscanner
- **URL:** https://www.skyscanner.com
- **Language:** Multi-language (30+ languages)
- **What it is:** Major flight metasearch with hotel and car rental search, aggregates from 1,200+ travel providers
- **Unique data:**
  - "Everywhere" search -- cheapest flights from origin to any destination
  - Whole-month price calendar
  - Price alerts with historical trend data
  - Multi-city and open-jaw routing
- **Scraping feasibility:**
  - **Official API:** Skyscanner Flights Live API via RapidAPI -- returns real-time quotes, requires partner approval
  - **Apify:** [Skyscanner Scraper](https://apify.com/voyager/skyscanner-scraper) actor available
  - **TinyFish:** Works for search result pages with `stealth` profile
  - **Difficulty:** Medium. API is the cleanest path but requires approval

### 3. Kayak
- **URL:** https://www.kayak.com
- **Language:** Multi-language
- **What it is:** Metasearch engine for flights, hotels, and car rentals owned by Booking Holdings
- **Unique data:**
  - Price forecast (confidence indicator for buy-now vs wait)
  - "Explore" map with cheapest fares by destination
  - Fare comparison across cabin classes
  - Hacker fares (mixing airlines for outbound/return to get cheaper combo)
- **Scraping feasibility:**
  - **No public API** (deprecated their affiliate API)
  - **Apify:** [Kayak Scraper](https://apify.com/maxcopell/kayak-scraper) for flights, hotels, car rentals
  - **TinyFish:** Feasible with `stealth` profile; heavy anti-bot but pages render server-side partially
  - **Difficulty:** Hard. Aggressive bot detection, CAPTCHAs common

### 4. Kiwi.com (formerly Skypicker)
- **URL:** https://www.kiwi.com
- **Language:** Multi-language
- **What it is:** Flight search engine specializing in combining itineraries across multiple airlines (self-transfer)
- **Unique data:**
  - Virtual interlining -- combines separate one-way tickets from different airlines into a single itinerary
  - Nomad feature -- multi-city trip optimizer (up to 10 cities, finds cheapest routing order)
  - Kiwi Guarantee for missed connections on self-transfer itineraries
  - Radius search (flights within X km of a point)
- **Scraping feasibility:**
  - **Official API (Tequila):** [Kiwi Tequila API](https://tequila.kiwi.com/) -- free tier available, returns structured JSON for flights, locations, multi-city
  - **Difficulty:** Easy. Tequila API is well-documented and generous free tier. Best flight API for hackathons.

### 5. Momondo
- **URL:** https://www.momondo.com
- **Language:** Multi-language
- **What it is:** Flight metasearch owned by Kayak/Booking Holdings, known for finding budget airlines
- **Unique data:**
  - Often surfaces smaller regional and budget carriers not in Kayak/Google
  - Flight insight tool showing price distribution
  - Open-jaw search with mix-and-match airports
- **Scraping feasibility:**
  - **No public API**
  - **Apify:** Actors available (shares backend with Kayak)
  - **TinyFish:** Similar approach to Kayak with `stealth` profile
  - **Difficulty:** Hard. Same anti-bot as Kayak

### 6. ITA Matrix (Google)
- **URL:** https://matrix.itasoftware.com
- **Language:** English
- **What it is:** Advanced flight search tool by Google, used by travel agents and fare nerds
- **Unique data:**
  - Fare class and fare rule details (refund policies, change fees, routing rules)
  - Complex routing queries (stopover rules, open jaws, specific alliance routing)
  - Calendar view across an entire month of prices
- **Scraping feasibility:**
  - **No API**
  - **TinyFish:** Possible but requires interaction with complex form. Use `stealth` profile
  - **Difficulty:** Hard. Complex UI, no direct links to results

### 7. Airline Direct Websites
- **URLs:** delta.com, united.com, aa.com, southwest.com, ryanair.com, easyjet.com, etc.
- **Language:** Varies
- **What it is:** Direct airline booking sites
- **Unique data:**
  - Exclusive web fares not available on metasearch (Southwest is entirely absent from metasearch)
  - Loyalty program pricing and award availability
  - Ancillary fee details (baggage, seat selection, meals)
  - Schedule data and seat maps
- **Scraping feasibility:**
  - **Varies widely by airline.** Southwest is notoriously aggressive against scrapers
  - **TinyFish:** Works for some airlines with `stealth` profile for schedule/pricing pages
  - **Difficulty:** Hard to Very Hard. Airlines invest heavily in anti-bot

---

## HOTELS & ACCOMMODATION

### 8. Booking.com
- **URL:** https://www.booking.com
- **Language:** 40+ languages
- **What it is:** World's largest OTA with 28M+ accommodation listings
- **Unique data:**
  - "Genius" member pricing and loyalty tiers
  - Guest review scores with sub-category breakdowns (cleanliness, location, staff, etc.)
  - Free cancellation policies clearly marked
  - Real-time availability and last-booked indicators
  - Property-level COVID/safety protocols
- **Scraping feasibility:**
  - **Affiliate API:** Booking.com Demand API (requires affiliate partnership approval)
  - **Apify:** [Booking.com Scraper](https://apify.com/dtrungtin/booking-scraper) -- popular, well-maintained
  - **Bright Data:** Dedicated Booking.com dataset and scraper
  - **TinyFish:** Works well for property detail pages and search results. Use `stealth` profile
  - **Difficulty:** Medium. Server-rendered content but bot detection on search pages

### 9. Expedia
- **URL:** https://www.expedia.com
- **Language:** Multi-language
- **What it is:** Major OTA (Expedia Group also owns Hotels.com, Vrbo, Orbitz, Travelocity)
- **Unique data:**
  - Bundle deals (flight + hotel packages) with significant discounts
  - Expedia Rewards member pricing
  - One Key loyalty program pricing across brands
  - VIP Access properties with exclusive perks
- **Scraping feasibility:**
  - **Rapid API:** [Expedia listings](https://rapidapi.com/ntd119/api/expedia-com2) available
  - **Apify:** Expedia scraper actors available
  - **TinyFish:** Feasible with `stealth` profile for search results and property pages
  - **Difficulty:** Medium-Hard. Heavy JS, anti-bot measures

### 10. Agoda
- **URL:** https://www.agoda.com
- **Language:** 38 languages
- **What it is:** Booking Holdings OTA strong in Asia-Pacific with 4.3M+ properties
- **Unique data:**
  - Often cheapest prices in Asia (aggressive pricing strategy)
  - Agoda Insider Deals and secret deals for logged-in users
  - Point-based reward system
  - Strong coverage of small guesthouses and hostels in SE Asia
- **Scraping feasibility:**
  - **Affiliate API:** Available through Booking Holdings partnership
  - **Apify:** [Agoda Scraper](https://apify.com/curious_coder/agoda-scraper) available
  - **TinyFish:** Good fit for listing pages; use `country_code` matching target region
  - **Difficulty:** Medium

### 11. Hotels.com
- **URL:** https://www.hotels.com
- **Language:** Multi-language
- **What it is:** Expedia Group OTA with strong loyalty program
- **Unique data:**
  - "Stay 10 nights, get 1 free" loyalty benefit (now One Key)
  - Secret prices for members
  - Price match guarantee details
- **Scraping feasibility:**
  - **Apify:** Hotels.com scrapers available
  - **TinyFish:** Works similarly to Expedia scraping
  - **Difficulty:** Medium

### 12. Hostelworld
- **URL:** https://www.hostelworld.com
- **Language:** Multi-language
- **What it is:** Leading hostel booking platform with 13,000+ hostels in 170+ countries
- **Unique data:**
  - Hostel-specific data: dorm bed pricing, private room options, common areas, atmosphere ratings
  - Social/party vs quiet hostel ratings
  - "Hostelworld Guarantee" properties
  - Traveler reviews specifically about hostel culture and vibe
- **Scraping feasibility:**
  - **No public API** (deprecated)
  - **Apify:** [Hostelworld Scraper](https://apify.com/lhotanok/hostelworld-scraper) available
  - **TinyFish:** Good fit for property pages with dorm/room pricing
  - **Difficulty:** Low-Medium. Relatively simple page structure

### 13. Airbnb
- **URL:** https://www.airbnb.com
- **Language:** 60+ languages
- **What it is:** The dominant short-term rental platform with 7M+ listings globally
- **Unique data:**
  - Entire home/apartment rentals with kitchen (critical for long stays)
  - Unique/luxury stays (treehouses, castles, etc.)
  - Airbnb Experiences (local-guided activities)
  - Superhost designation and detailed review breakdown
  - Monthly/weekly discount pricing
  - Neighborhood guides
- **Scraping feasibility:**
  - **No public API** (internal API exists but undocumented)
  - **Apify:** [Airbnb Scraper](https://apify.com/dtrungtin/airbnb-scraper) -- well-maintained, returns pricing, reviews, host details
  - **Bright Data:** Airbnb dataset and scraper available
  - **TinyFish:** Feasible for listing pages with `stealth` profile. Search results are harder (React SPA)
  - **Difficulty:** Medium-Hard. React SPA, aggressive anti-bot, rate limiting

### 14. Vrbo (Vacation Rentals by Owner)
- **URL:** https://www.vrbo.com
- **Language:** Multi-language
- **What it is:** Expedia Group vacation rental platform focused on whole-home rentals
- **Unique data:**
  - Whole-home only (no shared spaces like Airbnb)
  - Family-friendly filtering and amenities
  - Often has inventory not on Airbnb (especially in US beach/mountain markets)
  - Trip board collaboration features
- **Scraping feasibility:**
  - **Apify:** Vrbo scraper actors exist
  - **TinyFish:** Feasible for property and search pages
  - **Difficulty:** Medium

---

## CAR RENTALS

### 15. Rentalcars.com (Booking Holdings)
- **URL:** https://www.rentalcars.com
- **Language:** Multi-language
- **What it is:** Largest car rental metasearch, aggregates from 900+ companies in 160+ countries
- **Unique data:**
  - Side-by-side comparison across all major rental agencies
  - Free cancellation options clearly marked
  - Insurance/protection package details and pricing
  - Customer review scores per rental company per location
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Good fit for search result comparison pages
  - **Difficulty:** Medium

### 16. Kayak Car Rentals
- **URL:** https://www.kayak.com/cars
- **Language:** Multi-language
- **What it is:** Car rental metasearch within Kayak
- **Unique data:**
  - Price trends and deal ratings
  - Filter by specific car models
  - Airport vs city pickup comparison
- **Scraping feasibility:**
  - Same as Kayak flights (see #3)
  - **Difficulty:** Hard

### 17. Turo
- **URL:** https://turo.com
- **Language:** English
- **What it is:** Peer-to-peer car rental marketplace ("Airbnb for cars")
- **Unique data:**
  - Specific car makes/models (not just "compact" categories)
  - Host reviews and ratings
  - Delivery-to-location option
  - Often cheaper for longer rentals or unique vehicles
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Feasible for listing and search pages
  - **Difficulty:** Medium

---

## ACTIVITIES & EXPERIENCES

### 18. GetYourGuide
- **URL:** https://www.getyourguide.com
- **Language:** Multi-language
- **What it is:** Leading activity/tour booking platform with 100K+ activities in 10,000+ destinations
- **Unique data:**
  - Skip-the-line tickets for major attractions
  - Tour duration, group size, cancellation policies
  - Availability calendar with real-time slots
  - Curated "GetYourGuide Originals" with quality guarantee
- **Scraping feasibility:**
  - **Affiliate API:** Available through partner program
  - **Apify:** [GetYourGuide Scraper](https://apify.com/epctex/getyourguide-scraper) available
  - **TinyFish:** Good fit for activity listing pages
  - **Difficulty:** Low-Medium

### 19. Viator (TripAdvisor)
- **URL:** https://www.viator.com
- **Language:** Multi-language
- **What it is:** TripAdvisor's tour and activity platform with 300K+ bookable experiences
- **Unique data:**
  - Linked to TripAdvisor reviews (massive review corpus)
  - Free cancellation up to 24h on most activities
  - "Likely to Sell Out" demand indicators
  - Private tour options with pricing
- **Scraping feasibility:**
  - **Affiliate API:** Viator Partner API available (requires approval)
  - **Apify:** Viator scraper actors available
  - **TinyFish:** Works well for activity detail and search pages
  - **Difficulty:** Low-Medium

### 20. Klook
- **URL:** https://www.klook.com
- **Language:** Multi-language (strong Asia coverage)
- **What it is:** Asia-dominant activity and transport booking platform
- **Unique data:**
  - Best coverage for Asian attractions, transport passes, and SIM cards
  - JR Pass, rail passes, and transport cards (ICOCA, Suica, T-money)
  - Airport transfer bookings
  - Mobile vouchers with instant confirmation
  - Klook exclusive deals often 10-30% cheaper than booking direct for Asian attractions
- **Scraping feasibility:**
  - **Affiliate API:** Available through partner program
  - **Apify:** Klook scrapers available
  - **TinyFish:** Good fit for product pages
  - **Difficulty:** Low-Medium

### 21. KKday
- **URL:** https://www.kkday.com
- **Language:** Multi-language (strong Asia)
- **What it is:** Taiwan-based tour and activity booking platform competing with Klook
- **Unique data:**
  - Strong coverage of Taiwan, Korea, Japan, and SE Asia activities
  - Often has unique local experiences not on Klook or GetYourGuide
  - Group discount pricing
  - Local SIM card and WiFi device rentals
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Good fit for product and search pages
  - **Difficulty:** Low-Medium

---

## TRAVEL INSURANCE

### 22. SquareMouth
- **URL:** https://www.squaremouth.com
- **Language:** English
- **What it is:** Travel insurance comparison engine
- **Unique data:**
  - Side-by-side policy comparison across 40+ providers
  - Coverage details (medical, trip cancellation, baggage)
  - Price quotes based on trip details
  - User reviews of claims experience
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Feasible for quote comparison pages after form submission
  - **Difficulty:** Medium

### 23. InsureMyTrip
- **URL:** https://www.insuremytrip.com
- **Language:** English
- **What it is:** Travel insurance comparison marketplace
- **Unique data:**
  - "Anytime" reviews (verified purchaser reviews)
  - Pre-existing condition coverage filters
  - Annual multi-trip policy options
  - Detailed benefit-by-benefit comparison tables
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Works for comparison result pages
  - **Difficulty:** Medium

---

## VISAS & ENTRY REQUIREMENTS

### 24. Sherpa (by Booking.com)
- **URL:** https://www.joinsherpa.com
- **Language:** English
- **What it is:** Visa and travel restriction API used by airlines and OTAs
- **Unique data:**
  - Passport-to-destination visa requirements
  - Real-time entry restrictions and health requirements
  - Transit visa requirements
  - Document checklists per destination-nationality pair
- **Scraping feasibility:**
  - **Official API:** [Sherpa API](https://developer.joinsherpa.com/) available -- structured JSON for visa/entry requirements
  - **Difficulty:** Easy. Well-documented REST API

### 25. iVisa
- **URL:** https://www.ivisa.com
- **Language:** Multi-language
- **What it is:** Visa processing service and requirements database
- **Unique data:**
  - Visa-on-arrival vs e-visa vs embassy visa classification
  - Processing time estimates and costs
  - Required documents checklist
  - Country-by-country entry requirement database
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Works for country requirement pages (mostly static content)
  - **Difficulty:** Low

### 26. Passport Index
- **URL:** https://www.passportindex.org
- **Language:** English
- **What it is:** Global passport ranking and visa requirement database
- **Unique data:**
  - Visa-free, visa-on-arrival, and eTA classifications for all passport-destination pairs
  - Global passport power rankings
  - Mobility score comparisons
- **Scraping feasibility:**
  - **Public data:** Structured pages, some open datasets available on GitHub
  - **TinyFish:** Easy extraction from country pages
  - **Difficulty:** Low

---

## GROUND TRANSPORT

### 27. Rome2Rio
- **URL:** https://www.rome2rio.com
- **Language:** Multi-language
- **What it is:** Multi-modal transport search engine (flights, trains, buses, ferries, driving)
- **Unique data:**
  - Door-to-door route options combining multiple transport modes
  - Duration and price estimates for every transport option between two points
  - Operator information (which bus/train company runs the route)
  - Booking links to individual operators
- **Scraping feasibility:**
  - **Official API:** [Rome2Rio API](https://www.rome2rio.com/documentation) available (paid, structured JSON)
  - **TinyFish:** Works for route result pages
  - **Difficulty:** Easy via API

### 28. Trainline
- **URL:** https://www.thetrainline.com
- **Language:** Multi-language
- **What it is:** Europe's leading train/bus booking platform covering 270+ operators
- **Unique data:**
  - Real-time pricing and availability for European trains (TGV, Eurostar, Deutsche Bahn, Trenitalia, etc.)
  - Split-ticket savings (UK)
  - Advance fare availability
  - Journey planning with connections
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Feasible for search results with `stealth` profile
  - **Difficulty:** Medium

### 29. 12Go.Asia
- **URL:** https://12go.asia
- **Language:** English, Asian languages
- **What it is:** Southeast Asia transport booking (trains, buses, ferries, transfers)
- **Unique data:**
  - The only aggregated booking platform for SE Asian ground transport
  - Thailand trains, Vietnam sleeper buses, Cambodia-Vietnam border crossings
  - Ferry schedules for Thai/Indonesian/Philippine islands
  - Real operator reviews and route advice
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Good fit for route search results and operator pages
  - **Difficulty:** Low-Medium. Relatively simple page structure

### 30. Omio (formerly GoEuro)
- **URL:** https://www.omio.com
- **Language:** Multi-language
- **What it is:** European multi-modal transport search (trains, buses, flights)
- **Unique data:**
  - Price comparison across train, bus, and flight for same route
  - Integrated booking for FlixBus, SNCF, Deutsche Bahn, etc.
  - Carbon footprint comparison across transport modes
- **Scraping feasibility:**
  - **No public API**
  - **TinyFish:** Works for search result pages
  - **Difficulty:** Medium

### 31. FlixBus
- **URL:** https://www.flixbus.com
- **Language:** Multi-language
- **What it is:** Europe's largest long-distance bus network, expanding to US and Brazil
- **Unique data:**
  - Direct pricing for Europe's cheapest intercity bus network
  - Route map with all stops
  - Real-time seat availability
  - Prices often start at 5 EUR
- **Scraping feasibility:**
  - **Public API:** FlixBus has a semi-public API used by their website (documented by community)
  - **Apify:** FlixBus scraper actors available
  - **TinyFish:** Easy for search results
  - **Difficulty:** Low-Medium

---

## TRAVEL AGGREGATORS & METASEARCH

### 32. TripAdvisor
- **URL:** https://www.tripadvisor.com
- **Language:** 20+ languages
- **What it is:** World's largest travel review platform with 1B+ reviews
- **Unique data:**
  - Massive review corpus for hotels, restaurants, and attractions
  - Traveler ranking algorithms
  - Price comparison widget pulling from multiple OTAs
  - Forums with destination-specific Q&A
  - "Travelers' Choice" awards data
- **Scraping feasibility:**
  - **Official API:** Content API available (requires partnership, limited)
  - **Apify:** [TripAdvisor Scraper](https://apify.com/maxcopell/tripadvisor) -- well-maintained, reviews, ratings, pricing
  - **Bright Data:** TripAdvisor dataset available
  - **TinyFish:** Works for property and review pages with `stealth` profile
  - **Difficulty:** Medium. Anti-scraping measures but manageable

### 33. Google Hotels
- **URL:** https://www.google.com/travel/hotels
- **Language:** Multi-language
- **What it is:** Google's hotel metasearch aggregating prices from OTAs and direct sites
- **Unique data:**
  - Price comparison across all major OTAs in one view
  - Google Reviews integration
  - Price tracking and alerts
  - Map-based search
  - "Deals" indicator showing below-normal pricing
- **Scraping feasibility:**
  - **SerpApi:** Google Hotels API available
  - **TinyFish:** Possible with `stealth` profile
  - **Difficulty:** Medium-Hard. Google anti-bot

### 34. Trivago
- **URL:** https://www.trivago.com
- **Language:** 30+ languages
- **What it is:** Hotel metasearch engine comparing prices from 400+ booking sites
- **Unique data:**
  - Widest OTA price comparison for hotels
  - Deal indicators and price ratings
  - Rating Index combining multiple review sources
- **Scraping feasibility:**
  - **No public API**
  - **Apify:** Trivago scraper actors available
  - **TinyFish:** Feasible for search and comparison pages
  - **Difficulty:** Medium

---

## CURRENCY & FINANCIAL

### 35. Wise (formerly TransferWise)
- **URL:** https://wise.com/gb/currency-converter/
- **Language:** Multi-language
- **What it is:** Currency conversion with real mid-market exchange rates
- **Unique data:**
  - True mid-market exchange rates (no markup)
  - Rate alerts and historical rate charts
  - Fee comparison for money transfers
- **Scraping feasibility:**
  - **Official API:** [Wise API](https://api-docs.wise.com/) for exchange rates
  - **Difficulty:** Easy via API

### 36. XE.com
- **URL:** https://www.xe.com
- **Language:** Multi-language
- **What it is:** Popular currency converter and exchange rate reference
- **Unique data:**
  - Historical exchange rates
  - Rate alerts
  - Travel expense calculator
- **Scraping feasibility:**
  - **Official API:** XE Currency Data API available (paid)
  - **Free alternatives:** exchangerate-api.com, open.er-api.com offer free tiers
  - **Difficulty:** Easy via API

---

## WEATHER & SEASONAL DATA

### 37. Weather Underground
- **URL:** https://www.wunderground.com
- **Language:** English
- **What it is:** Hyperlocal weather data from 250K+ personal weather stations
- **Unique data:**
  - Historical weather data (what was weather like in Tokyo in March last year?)
  - Hyperlocal data from personal weather stations
  - Travel planner tool with historical averages
- **Scraping feasibility:**
  - **API:** Weather Underground API (IBM) available
  - **Difficulty:** Easy via API

### 38. Holiday Calendar APIs
- **URLs:** Various (calendarific.com, abstractapi.com/holidays)
- **What it is:** Global public holiday and observance databases
- **Unique data:**
  - Public holidays by country (affects business hours, attraction closures)
  - Festival and observance dates (affects crowd levels and pricing)
  - School holiday periods (peak travel seasons)
- **Scraping feasibility:**
  - **Calendarific API:** Free tier with 1,000 requests/month, covers 230+ countries
  - **Difficulty:** Easy

---

## AIRPORT & FLIGHT STATUS

### 39. FlightAware
- **URL:** https://www.flightaware.com
- **Language:** English
- **What it is:** Real-time flight tracking and airport information
- **Unique data:**
  - Real-time flight tracking and status
  - Airport delay information
  - Historical on-time performance by route/airline
  - Taxi time and gate information
- **Scraping feasibility:**
  - **Official API:** [FlightAware AeroAPI](https://www.flightaware.com/aeroapi/) -- comprehensive REST API (paid)
  - **Difficulty:** Easy via API

### 40. SeatGuru (TripAdvisor)
- **URL:** https://www.seatguru.com
- **Language:** English
- **What it is:** Aircraft seat maps and airline reviews
- **Unique data:**
  - Seat-by-seat quality ratings (legroom, recline, window alignment)
  - Aircraft type by route
  - Seat recommendations and warnings ("avoid this seat -- galley noise")
  - Airline amenity comparisons (wifi, power, entertainment)
- **Scraping feasibility:**
  - **No API**
  - **TinyFish:** Easy for seat map and airline review pages (mostly static)
  - **Difficulty:** Low

---

## TRAVEL DOCUMENTS & PACKING

### 41. PackPoint
- **URL:** https://www.packpnt.com
- **Language:** English
- **What it is:** Smart packing list generator based on destination, weather, and activities
- **Unique data:**
  - Weather-aware packing suggestions
  - Activity-based item recommendations
  - Culturally-aware suggestions (modest dress requirements, etc.)
- **Scraping feasibility:**
  - **No API**
  - **TinyFish:** Works for generated list pages
  - **Difficulty:** Low

---

## NOTES ON SCRAPING STRATEGY

### Recommended Priority for a Trip Planner MVP:
1. **Kiwi Tequila API** (flights) -- free, excellent docs, virtual interlining
2. **Booking.com via Apify** (hotels) -- best coverage, well-maintained scraper
3. **Rome2Rio API** (ground transport) -- multimodal, structured data
4. **Sherpa API** (visa/entry) -- authoritative, structured
5. **GetYourGuide/Viator via Apify** (activities) -- good coverage
6. **TripAdvisor via Apify** (reviews) -- massive review corpus
7. **Wise API** (currency) -- free, accurate rates

### TinyFish Best Practices for Booking Sites:
- Always use `stealth` browser profile to avoid bot detection
- Set appropriate `country_code` proxy to get localized pricing
- Use `wait_for` selectors targeting price/availability elements (these load last)
- Implement request spacing to avoid rate limiting
- Cache results aggressively -- booking data changes frequently but not per-second
