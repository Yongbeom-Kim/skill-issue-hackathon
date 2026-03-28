# Local & Native-Language Travel Data Sources Catalog

> These are the hidden gems that mainstream English-language trip planners miss entirely. Each source contains data that simply does not exist in English-language platforms like TripAdvisor, Google Maps, or Lonely Planet.

---

## JAPAN

### 1. Tabelog (食べログ)
- **URL:** https://tabelog.com
- **Language:** Japanese (English app launched Nov 2025, but review corpus remains Japanese)
- **What it is:** Japan's #1 restaurant review platform with 800K+ restaurants
- **Unique data you CAN'T get from English sources:**
  - Stricter, more meaningful rating system (3.5+ = exceptional; only ~3% of restaurants score above 3.5). Google Reviews in Japan are mostly from tourists with inflated ratings
  - Reviews by serious Japanese food critics who judge on technique, authenticity, and quality
  - Budget breakdowns (lunch vs dinner pricing), course meal details
  - Hyper-local neighborhood restaurants that have zero presence on Google
  - Reviewer credibility weighting (a 3.2 from a veteran reviewer with 500+ reviews carries weight)
- **Why it matters:** Japanese locals do NOT use Google Maps for restaurant discovery. If your planner only uses Google data, it's serving tourist traps. Tabelog is the ground truth for dining in Japan.
- **Scraping feasibility:**
  - **Apify:** Dedicated [Tabelog Japan Restaurant Scraper](https://apify.com/cloud9_ai/tabelog-scraper/api) actor available
  - **TinyFish:** Excellent fit -- send restaurant listing URLs with goal to extract ratings, reviews, budget, hours, genre. Use `stealth` browser profile and `country_code: "JP"` proxy
  - **Direct scraping:** Hobbo API offers a [Tabelog Reviews endpoint](https://docs.hobbo.ai/api-reference/scraper/tabelog-reviews); open-source [tabetree_api](https://github.com/chcliu/tabetree_api) also available
  - **Difficulty:** Medium. Site is server-rendered, anti-bot is moderate

### 2. Jalan (じゃらん)
- **URL:** https://www.jalan.net
- **Language:** Japanese
- **What it is:** Japan's largest accommodation booking site by Recruit, with 26,000+ accommodations and 140,000+ tourist spots
- **Unique data you CAN'T get from English sources:**
  - Ryokan-specific data (onsen types, kaiseki meal plans, room styles) that Booking.com barely captures
  - Domestic travel packages (rail + hotel combos) priced for Japanese consumers
  - Japanese user reviews of accommodations focused on hospitality quality, bath facilities, meal quality
  - Regional tourist spot rankings and seasonal event information
- **Why it matters:** Jalan dominates the ryokan/onsen booking space. If you want to recommend authentic Japanese inn experiences, this is the primary source.
- **Scraping feasibility:**
  - **Official API:** Jalan has an official API (via Recruit Web Services) for area search and facility data
  - **Bright Data:** [Jalan Scraper](https://brightdata.com/products/web-scraper/jalan) available with property details
  - **TinyFish:** Good fit for extracting search results, pricing, and reviews from listing pages
  - **Difficulty:** Medium. Dynamic content but well-structured pages

### 3. Rakuten Travel
- **URL:** https://travel.rakuten.co.jp
- **Language:** Japanese (English version exists but limited)
- **What it is:** Major hotel/travel booking platform with ~700K properties globally, strong domestic Japan focus
- **Unique data you CAN'T get from English sources:**
  - Rakuten Super Points deals and member-only pricing
  - Japanese domestic package tours and seasonal promotions
  - Detailed facility information for business hotels and budget accommodations popular with Japanese travelers
  - User reviews in Japanese with specific cultural context (room size in tatami mats, proximity to station in minutes)
- **Why it matters:** Complements Jalan with a different inventory. Rakuten's loyalty ecosystem drives significant booking volume in Japan.
- **Scraping feasibility:**
  - **Official API:** [Rakuten Web Service API](https://webservice.rakuten.co.jp/documentation) with Hotel Detail Search endpoint -- FREE developer access
  - **Rakuten Travel Xchange API:** B2B API for partners with JSON endpoints, requires X-Api-Key header
  - **MCP Server:** A [Rakuten Travel MCP Server](https://lobehub.com/mcp/yourusername-rakuten_travel_mcp) exists
  - **Difficulty:** Easy via official API. Best official API access among all Japan sources

### 4. Gurunavi (ぐるなび)
- **URL:** https://gurunavi.com
- **Language:** Japanese (English version available)
- **What it is:** Restaurant search platform with 50K+ restaurants, now merged with Rakuten
- **Unique data you CAN'T get from English sources:**
  - Foreign-tourist-friendly tagging (English menus, halal, vegetarian)
  - Coupon and deal information for restaurants
  - Course meal / party plan details with pricing
  - Station-based restaurant search (critical in Japan where stations define neighborhoods)
- **Why it matters:** Strong for group dining, business meals, and tourist-friendly filtering. Good complement to Tabelog.
- **Scraping feasibility:**
  - **Official API:** Gurunavi REST API available (requires API key from api.gnavi.co.jp). API specs changed Sept 2019
  - **RapidAPI:** [Gurunavi Restaurant Search](https://rapidapi.com/gurunaviws/api/gurunavi-restaurant-search/details) available
  - **TinyFish:** Works well for search result extraction
  - **Difficulty:** Easy via official API

### 5. Hot Pepper Gourmet (ホットペッパーグルメ)
- **URL:** https://www.hotpepper.jp
- **Language:** Japanese
- **What it is:** Restaurant reservation platform by Recruit (same parent as Jalan)
- **Unique data you CAN'T get from English sources:**
  - Real-time reservation availability
  - Discount coupons and special deals (Hot Pepper is known for coupons)
  - Private room availability, smoking/non-smoking sections
  - Party/banquet plan details (critical for Japanese dining culture)
- **Why it matters:** Huge for actionable booking data -- not just finding restaurants but actually securing reservations with deals.
- **Scraping feasibility:**
  - **Official API:** Available at `webservice.recruit.co.jp/hotpepper/gourmet/v1/` -- FREE with API key
  - **SDKs:** [Node.js SDK](https://github.com/airRnot1106/hotpepper-sdk-nodejs) and [Python wrapper](https://github.com/paperlefthand/hotpepper-gourmet)
  - **Difficulty:** Easy. One of the most accessible Japanese restaurant APIs

### 6. Ikyu (一休)
- **URL:** https://www.ikyu.com / https://restaurant.ikyu.com
- **Language:** Japanese (English version exists)
- **What it is:** Luxury hotel and high-end restaurant booking (~17,000 luxury properties)
- **Unique data you CAN'T get from English sources:**
  - Flash sales and time-limited deals on luxury properties (30-70% off)
  - High-end restaurant reservation availability with prix fixe menus
  - Luxury ryokan with exclusive room types not listed on international OTAs
  - Spa and experience packages bundled with accommodation
- **Why it matters:** For luxury travel planning, Ikyu has deals and inventory invisible to Booking.com or Expedia. A 5-star ryokan might be 40% cheaper on Ikyu.
- **Scraping feasibility:**
  - **No public API**
  - **Thunderbit:** [IKYU Scraper](https://thunderbit.com/template/ikyu-scraper) for hotel data extraction
  - **TinyFish:** Best approach -- navigate search results, extract pricing, availability, and deal information. Use `stealth` profile
  - **Difficulty:** Medium-Hard. No API, requires browser automation

### 7. Japan Guide Forums
- **URL:** https://www.japan-guide.com/forum/
- **Language:** English
- **What it is:** The most active English-language Japan travel forum
- **Unique data:** Crowd-sourced itinerary advice, real-time trip reports, seasonal recommendations. Not unique vs English sources per se, but serves as a bridge between Japanese local knowledge and English-speaking travelers.
- **Scraping feasibility:** Simple HTML scraping or TinyFish. Forum is mostly static HTML. Low difficulty.

### 8. Matcha / Tokyo Cheapo
- **URLs:** https://matcha-jp.com / https://tokyocheapo.com
- **Language:** English (Matcha: multilingual)
- **What it is:** English-language bridges to Japanese local knowledge
- **Unique data:** Curated budget tips, event calendars, seasonal guides. Content is editorial, not user-generated.
- **Scraping feasibility:** Standard web scraping. Simple HTML. TinyFish works easily. Low difficulty.

---

## KOREA

### 9. Naver Blog (네이버 블로그)
- **URL:** https://blog.naver.com
- **Language:** Korean
- **What it is:** THE dominant blogging/review platform in Korea. Blog content ranks heavily in Naver search.
- **Unique data you CAN'T get from English sources:**
  - Long-form experiential reviews with extensive photo documentation (interior, food photos, menus, receipts)
  - Most Korean businesses register on Naver, NOT Google -- so reviews, hours, menus, and photos live exclusively here
  - Receipt-verified reviews (look for the verification badge to filter out paid promotions)
  - Neighborhood-level dining/cafe/activity recommendations from locals
  - Seasonal and trending content driven by Korean cultural events
- **Why it matters:** Google Maps in Korea has limited business data and reviews. Naver Blog IS the review ecosystem. Without it, you are blind to what Koreans actually recommend.
- **Scraping feasibility:**
  - **Naver Open API:** Limited blog search API available (returns snippets, not full content)
  - **Apify:** [Naver Map Search Results Scraper](https://apify.com/delicious_zebu/naver-map-search-results-scraper/api) available
  - **Scrapfly:** [How to Scrape Naver guide](https://scrapfly.io/blog/posts/how-to-scrape-naver) with detailed walkthrough
  - **TinyFish:** Good fit with `stealth` profile and `country_code: "KR"` proxy (Naver blocks non-Korean IPs aggressively)
  - **Difficulty:** Hard. Sophisticated anti-bot (IP rate limiting, browser fingerprinting, behavioral analysis). Korean character encoding requires careful handling.

### 10. Naver Maps
- **URL:** https://map.naver.com
- **Language:** Korean (English support added for tourists)
- **What it is:** Dominant mapping platform in Korea, far more detailed than Google Maps for Korean locations
- **Unique data you CAN'T get from English sources:**
  - Accurate business hours, menus with prices, and real-time crowd levels
  - Indoor maps for Korean subway stations and malls
  - Walking/transit directions that are actually accurate in Korea (Google Maps is restricted to 1:25,000 scale)
  - Place reviews integrated from Naver Blog ecosystem
  - Bus arrival times, subway transfer guidance
- **Why it matters:** Google Maps in Korea is deliberately restricted by Korean government policy. Naver Maps has 10x the detail.
- **Scraping feasibility:**
  - **Naver Maps API:** Available through Naver Cloud Platform for geocoding, directions, and place search
  - **Apify:** [Naver Place Search scraper](https://apify.com/oxygenated_quagmire/naver-place-search/api) available
  - **TinyFish:** Works for extracting place details and reviews from Naver Place pages
  - **Difficulty:** Medium. API available but requires Naver developer account

### 11. Kakao Maps
- **URL:** https://map.kakao.com
- **Language:** Korean
- **What it is:** Second major mapping platform in Korea, integrated with KakaoTalk (95%+ penetration messaging app)
- **Unique data you CAN'T get from English sources:**
  - Place data with Kakao-specific reviews and ratings
  - Route planning with fare calculations for taxis and public transit
  - Integration with KakaoTalk for sharing locations and bookings
  - Category-based place discovery (cafes, restaurants by cuisine type)
- **Why it matters:** Complements Naver Maps. Some businesses are better represented on Kakao. The KakaoTalk integration makes it the practical navigation choice for many Koreans.
- **Scraping feasibility:**
  - **Official API:** [Kakao Developers REST API](https://developers.kakao.com/docs/latest/en/local/dev-guide) -- well-documented, English docs available. Free tier with registration
  - **Data includes:** Place name, address, coordinates, category, phone, URL to Kakao Map detail page
  - **Difficulty:** Easy. Best-documented Korean mapping API

### 12. MangoPlate (망고플레이트)
- **URL:** https://www.mangoplate.com
- **Language:** Korean and English
- **What it is:** Restaurant discovery platform with 200K+ restaurants, crowd-sourced reviews with editorial curation
- **Unique data you CAN'T get from English sources:**
  - Curated "Top Lists" by neighborhood and cuisine that reflect Korean dining preferences
  - User photos and reviews specifically focused on food quality (not ambiance-biased like Instagram)
  - Hidden gem small restaurants that don't appear on international platforms
  - English translations available, making it a bridge between Korean local data and international users
- **Why it matters:** More curated/editorial than Naver Blog, less noisy. Good for high-confidence recommendations.
- **Scraping feasibility:**
  - **No public API**
  - **GitHub:** [Selenium-based scraper](https://github.com/sehwaa/Mangoplate-Crawling) available
  - **TinyFish:** Good fit for extracting restaurant listings and reviews
  - **Difficulty:** Medium. Dynamic JS-rendered content requires browser automation

### 13. Daum Cafe (다음카페)
- **URL:** https://cafe.daum.net
- **Language:** Korean
- **What it is:** Korea's largest online community platform (10M+ daily visitors), topic-focused forums
- **Unique data you CAN'T get from English sources:**
  - Travel community forums with real itineraries, cost breakdowns, and real-time trip reports
  - Regional travel groups (e.g., Jeju Island, Busan) with hyper-local tips
  - Community-validated recommendations (upvoted by actual Korean travelers)
- **Why it matters:** Real Korean travelers sharing unfiltered experiences, costs, and warnings. More trustworthy than blog content which can be sponsored.
- **Scraping feasibility:**
  - **Official API:** [Daum Search API](https://developers.kakao.com/docs/latest/en/daum-search/dev-guide) via Kakao Developers -- searches Cafe posts by keyword
  - **TinyFish:** Works for extracting specific forum threads
  - **Difficulty:** Medium. API for search, but full content extraction requires scraping

### 14. Tistory Blogs
- **URL:** https://www.tistory.com
- **Language:** Korean
- **What it is:** Korean blogging platform (by Kakao) popular with tech-savvy users who want more customization than Naver Blog
- **Unique data you CAN'T get from English sources:**
  - More in-depth, technical travel content (detailed itineraries with maps, transit instructions, costs)
  - Less commercial/sponsored than Naver Blog (bloggers here tend to be more authentic)
  - Photography-heavy travel posts
- **Why it matters:** Higher signal-to-noise ratio than Naver Blog for genuine travel experiences.
- **Scraping feasibility:**
  - **Daum Search API:** Can search Tistory content via Kakao/Daum search endpoints
  - **Direct scraping:** Tistory blogs are standard HTML, relatively easy to scrape
  - **TinyFish:** Works well
  - **Difficulty:** Easy-Medium

### 15. Yanolja (야놀자)
- **URL:** https://www.yanolja.com
- **Language:** Korean
- **What it is:** Korea's largest accommodation/leisure booking platform. Recently expanded globally with AI/cloud solutions.
- **Unique data you CAN'T get from English sources:**
  - Budget accommodation (motels, guesthouses) that don't appear on Booking.com
  - Last-minute deals and flash sales for Korean domestic travel
  - Leisure activity bookings (theme parks, spas, activities)
  - Korean-style accommodation categories (pension, motel, guesthouse) with appropriate pricing
- **Why it matters:** International OTAs miss the huge Korean domestic budget accommodation market. Yanolja has the inventory.
- **Scraping feasibility:**
  - **No public API**
  - **Thunderbit:** [Yanolja Scraper](https://thunderbit.com/template/yanolja-scraper) available
  - **Legal note:** Korean Supreme Court ruled (2022) that scraping publicly available data is not per se illegal
  - **TinyFish:** Good fit with `stealth` profile and Korean proxy
  - **Difficulty:** Medium-Hard. Dynamic app-like web experience

### 16. Klook Korea
- **URL:** https://www.klook.com/ko/
- **Language:** Korean, English, and many others
- **What it is:** Activities, tours, and experiences booking platform
- **Unique data you CAN'T get from English sources:**
  - Korea-specific activity packages (hanbok rental, DMZ tours, K-pop experiences)
  - Korean-language reviews of activities from Korean domestic tourists
  - Pricing in KRW with local promotions
- **Why it matters:** Good for the "things to do" layer of trip planning. Activities are where trip planners often fall short.
- **Scraping feasibility:**
  - **Official API:** [Klook Partner API](https://klook.gitbook.io/) available for merchants/channel managers
  - **Apify:** [Klook Reviews Scraper](https://apify.com/knagymate/klook-reviews-scraper) available
  - **Difficulty:** Easy via Apify, Medium for official API (requires partner agreement)

---

## CHINA

### 17. Xiaohongshu / RED (小红书)
- **URL:** https://www.xiaohongshu.com
- **Language:** Chinese (Mandarin)
- **What it is:** 300M+ user social platform combining Instagram + Pinterest + TripAdvisor. THE travel discovery platform for Chinese travelers.
- **Unique data you CAN'T get from English sources:**
  - Visual travel guides with exact photo spots, outfit recommendations, and aesthetic itineraries
  - Hidden gem discovery -- Xiaohongshu has turned obscure locations across Southeast Asia into must-visit spots
  - Real-time trending destinations among Chinese youth (19-35, 77% female)
  - Photo-centric reviews with specific pricing, wait times, and practical tips
  - Travel content surged 273% in 2023 alone
  - Cultural immersion tips vs. traditional shopping-focused Chinese travel guides
- **Why it matters:** Over 80% of Chinese travelers research on Xiaohongshu before traveling. If you want to understand where Chinese tourists are going (and avoid/embrace those flows), this is essential. Also reveals genuinely undiscovered places that Western platforms miss.
- **Scraping feasibility:**
  - **Apify:** Multiple actors available -- [XiaoHongShu Scraper](https://apify.com/kuaima/xiaohongshu/api), [All-in-One RedNote Scraper](https://apify.com/easyapi/all-in-one-rednote-xiaohongshu-scraper), [Search Scraper with MCP support](https://apify.com/kuaima/xiaohongshu-search/api/mcp)
  - **GitHub:** Multiple open-source scrapers at [github.com/topics/xiaohongshu](https://github.com/topics/xiaohongshu)
  - **TinyFish:** Works with `stealth` profile and Chinese proxy. Great for extracting specific post content
  - **Difficulty:** Medium. Anti-bot measures exist but multiple proven scraping tools available

### 18. Douyin (Chinese TikTok)
- **URL:** https://www.douyin.com
- **Language:** Chinese (Mandarin)
- **What it is:** Chinese version of TikTok (separate platform, different content). Massive travel video content.
- **Unique data you CAN'T get from English sources:**
  - Short-form video travel guides showing real conditions (crowds, weather, food quality)
  - Viral destination trends driving Chinese domestic/outbound tourism
  - Restaurant and attraction walkthroughs with spoken commentary
  - Real-time location-tagged content showing current conditions
- **Why it matters:** Video content conveys information (crowd levels, actual food presentation, atmosphere) that text/photo reviews cannot. Douyin drives travel trends in China.
- **Scraping feasibility:**
  - **Apify:** [Douyin Scraper](https://apify.com/natanielsantos/douyin-scraper), [Douyin Search Scraper](https://apify.com/kuaima/douyin-search/api), [Douyin Transcripts Scraper](https://apify.com/apple_yang/douyin-transcripts-scraper)
  - **PyPI:** [douyin-tiktok-scraper](https://pypi.org/project/douyin-tiktok-scraper/) package
  - **RapidAPI:** [Douyin/China TikTok All API](https://rapidapi.com/dataapiman/api/douyin-china-tiktok-all-api)
  - **TinyFish:** Can extract video metadata and transcripts
  - **Difficulty:** Medium. Transcript extraction is the key value-add for a text-based trip planner

### 19. Dianping (大众点评)
- **URL:** https://www.dianping.com
- **Language:** Chinese (Mandarin)
- **What it is:** China's Yelp -- 300M+ user-generated reviews across 25M businesses in 2,300 cities
- **Unique data you CAN'T get from English sources:**
  - Granular restaurant ratings (taste, environment, service scored separately)
  - Per-dish ratings and photo reviews
  - Wait time estimates and queue information
  - Regional taste preference data and seasonal demand patterns
  - Covers tier-2 and tier-3 Chinese cities where no English review data exists
- **Why it matters:** For any trip involving eating in China (which is every trip), Dianping is the definitive source. Google has near-zero useful restaurant data in China.
- **Scraping feasibility:**
  - **API:** Dianping has/had an open API for merchant search (cityid, regionid, categoryid parameters)
  - **GitHub:** [dianping_crawler](https://github.com/SmileXie/dianping_crawler) and [Ruby gem](https://github.com/zires/dian-ping)
  - **TinyFish:** Good with `stealth` profile and `country_code: "CN"` proxy
  - **Difficulty:** Hard. Heavy anti-scraping measures, font encryption for ratings, requires Chinese phone for some features

### 20. Ctrip / Trip.com
- **URL:** https://www.ctrip.com (China) / https://www.trip.com (international)
- **Language:** Chinese (Ctrip), English (Trip.com)
- **What it is:** China's largest OTA -- 90M+ registered members, comprehensive flights/hotels/tours
- **Unique data you CAN'T get from English sources:**
  - Chinese domestic flight and rail pricing (often cheaper than international booking sites)
  - Chinese hotel inventory including budget chains (Hanting, 7Days, Jinjiang) with local pricing
  - User reviews in Chinese with travel tips specific to Chinese cultural context
  - Package tours designed for Chinese travelers
- **Why it matters:** Best source for booking logistics (flights, hotels, trains) within China. Trip.com international version has less content than the Chinese Ctrip.
- **Scraping feasibility:**
  - **API:** Ctrip provides API access with developer credentials. [API docs](https://apitracker.io/a/ctrip)
  - **XML Integration:** Available for hotel booking
  - **TinyFish:** Works for price extraction and availability checks
  - **Difficulty:** Medium. API available for partners; scraping requires stealth

### 21. Mafengwo (马蜂窝)
- **URL:** https://www.mafengwo.cn
- **Language:** Chinese (Mandarin)
- **What it is:** China's top travel content community -- 140M registered users, 700K+ long-form guides per month, 3TB daily data
- **Unique data you CAN'T get from English sources:**
  - Detailed, crowd-sourced travel itineraries with day-by-day breakdowns
  - Cost breakdowns from real travelers (transport, food, accommodation, activities)
  - Destination guides combining logistics + cultural tips + seasonal advice
  - User travel route data (actual paths taken, not theoretical)
  - Community Q&A for specific travel questions
- **Why it matters:** The closest Chinese equivalent to a comprehensive trip planning database. Itineraries here are battle-tested by millions of Chinese travelers.
- **Scraping feasibility:**
  - **Open API:** [Mafengwo Open Platform](https://open.mafengwo.cn/support/743.html) -- for merchants on the platform
  - **GitHub:** [Scrapy-based travel route scraper](https://github.com/eternal-flame-AD/mafengwo) (under 50 lines of core code)
  - **TinyFish:** Good for extracting specific guides and itineraries
  - **Difficulty:** Medium. Straightforward HTML structure but anti-bot protection exists

### 22. Qunar (去哪儿)
- **URL:** https://www.qunar.com
- **Language:** Chinese (Mandarin)
- **What it is:** Travel metasearch engine searching 700+ OTAs, 100K+ hotels, 12K+ flight routes
- **Unique data you CAN'T get from English sources:**
  - Comprehensive price comparison across Chinese OTAs (aggregates deals unavailable internationally)
  - Chinese domestic budget flight deals
  - Hotel pricing from Chinese-only booking platforms
  - Cache-based pricing data (6-hour default cache)
- **Why it matters:** Best for finding the cheapest option among Chinese booking platforms. A meta-layer above Ctrip and others.
- **Scraping feasibility:**
  - **Official API:** [Hotel API](https://open.hotel.qunar.com/doc/api_en_boot.html) with English documentation. Workflow: Search -> List -> Detail -> Booking
  - **TinyFish:** Works for flight/hotel price extraction
  - **Difficulty:** Medium. API available for hotel partners

### 23. Baidu Maps
- **URL:** https://map.baidu.com
- **Language:** Chinese (Mandarin)
- **What it is:** China's dominant mapping platform
- **Unique data you CAN'T get from English sources:**
  - Accurate POI data for China (Google Maps is severely limited in China)
  - Real-time traffic, transit directions, and walking routes within Chinese cities
  - Business listings, hours, and reviews for Chinese businesses
  - Indoor maps for Chinese shopping malls and transit stations
- **Why it matters:** Google Maps does not work in China. Baidu Maps is the mapping layer for any China travel planner.
- **Scraping feasibility:**
  - **Official API:** [Baidu Maps API v3.0](https://lbsyun.baidu.com/) -- geocoding, POI search, routing, weather, traffic. Free tier available
  - **Caveat:** Requires Chinese mobile number and business license for API key
  - **Python library:** [BaiduMapAPI](https://github.com/shikanon/BaiduMapAPI)
  - **MCP Server:** [Baidu Maps MCP](https://github.com/baidu-maps/mcp) available
  - **Difficulty:** Medium. API is comprehensive but registration requires Chinese credentials

### 24. Weibo Travel Content
- **URL:** https://weibo.com
- **Language:** Chinese (Mandarin)
- **What it is:** China's Twitter equivalent, with significant travel content from KOLs (influencers) and ordinary travelers
- **Unique data you CAN'T get from English sources:**
  - Real-time travel alerts, conditions, and trending destinations
  - KOL travel recommendations that drive Chinese tourist behavior
  - Geotagged posts showing where Chinese travelers actually go
  - Viral destination content and travel controversy discussions
- **Why it matters:** Weibo is the real-time pulse of Chinese travel sentiment. Useful for trend detection and current conditions.
- **Scraping feasibility:**
  - **API:** Sina Weibo API available (requires developer credentials)
  - **Apify:** [Weibo Scraper](https://apify.com/piotrv1001/weibo-scraper) available
  - **Piloterr:** [Weibo Search API](https://www.piloterr.com/library/weibo-search) with keyword search
  - **Bright Data:** Weibo scraper available for profiles, posts, location data
  - **TinyFish:** Works for extracting specific post content
  - **Difficulty:** Medium. API access requires Chinese developer account

---

## SOUTHEAST ASIA

### 25. Traveloka
- **URL:** https://www.traveloka.com
- **Language:** Indonesian, Thai, Vietnamese, English, Malay
- **What it is:** SEA's largest OTA, dominant in Indonesia. One-stop for flights, hotels, activities, transport.
- **Unique data you CAN'T get from English sources:**
  - Indonesian domestic flight/hotel pricing (often 20-40% cheaper than international OTAs)
  - Budget accommodation in SEA cities invisible to Booking.com
  - Local experience packages and activity bookings
  - Thai, Vietnamese, and Malay language reviews
- **Why it matters:** Traveloka is to Southeast Asia what Ctrip is to China. International OTAs miss significant local inventory and pricing.
- **Scraping feasibility:**
  - **Official API:** [Traveloka Partners Network](https://developer.travelokapartnersnetwork.com/) -- requires partner registration, 4-6 week integration
  - **GitHub:** [Selenium-based crawler](https://github.com/hhtrieu0108/Crawl_Traveloka) for hotels, coaches, flights
  - **TinyFish:** Good fit for price comparison and availability extraction
  - **Difficulty:** Medium-Hard. Heavy JS rendering, partner API requires business relationship

### 26. Grab
- **URL:** https://www.grab.com
- **Language:** English, Thai, Vietnamese, Indonesian, Malay, Filipino, Burmese
- **What it is:** SEA's super-app -- ride-hailing + food delivery + payments across 8 countries
- **Unique data you CAN'T get from English sources:**
  - Real-time food delivery menus and pricing for local restaurants
  - Transport pricing between any two points in SEA cities
  - Local restaurant discovery with ratings and reviews
  - GrabFood merchant data (small local restaurants that don't appear on Google)
- **Why it matters:** Grab IS the transport and food layer for SEA. Any trip planner needs Grab data for realistic cost estimates and restaurant discovery.
- **Scraping feasibility:**
  - **Official API:** [Grab Developer Portal](https://developer.grab.com/) with SDKs for [Python](https://github.com/grab/grabfood-api-sdk-python) and [Java](https://github.com/grab/grabfood-api-sdk-java)
  - **Apify:** [Grab Food Restaurants Scraper](https://apify.com/fatihtahta/grab-food-restaurants-scraper/api/python)
  - **TinyFish:** Good for extracting restaurant listings and pricing
  - **Difficulty:** Easy-Medium. Official SDKs available

### 27. Wongnai (วงใน)
- **URL:** https://www.wongnai.com
- **Language:** Thai
- **What it is:** Thailand's Yelp -- 5.7M+ users, 2.4M+ reviews, 84M photos, 1M+ locations. Now merged with LINE MAN for delivery.
- **Unique data you CAN'T get from English sources:**
  - Thai-language restaurant reviews from actual Thai diners (not tourists)
  - Street food stall listings and reviews (invisible to TripAdvisor)
  - Spa, beauty service, and local business reviews
  - Annual "Users' Choice" restaurant awards reflecting Thai preferences
- **Why it matters:** TripAdvisor Thailand is tourist-facing. Wongnai shows where Thai people actually eat, including the street food scene that makes Thailand special.
- **Scraping feasibility:**
  - **Data services:** Wongnai offers official data API access (contact directly)
  - **Dataset:** [Wongnai Reviews dataset](https://huggingface.co/datasets/Wongnai/wongnai_reviews) on HuggingFace (Thai text, 5-class ratings)
  - **GitHub:** [wongnai-corpus](https://github.com/wongnai/wongnai-corpus) -- official dataset collection
  - **TinyFish:** Works for extracting restaurant listings and reviews
  - **Difficulty:** Medium. Official datasets available, live scraping requires Thai-language handling

### 28. Foody.vn
- **URL:** https://www.foody.vn
- **Language:** Vietnamese
- **What it is:** Vietnam's dominant restaurant discovery platform covering HCMC, Hanoi, Da Nang, and other cities
- **Unique data you CAN'T get from English sources:**
  - Vietnamese street food stall listings and reviews
  - Neighborhood-level restaurant discovery in Vietnamese cities
  - Price points in VND reflecting actual local costs
  - Cafe culture recommendations (huge in Vietnam)
- **Why it matters:** Vietnam's food scene is one of its biggest draws, but TripAdvisor barely scratches the surface. Foody.vn is where Vietnamese people find food.
- **Scraping feasibility:**
  - **GitHub:** [foody-crawler (NodeJS)](https://github.com/huynhsamha/foody-crawler) and [FoodyCrawl (Scrapy)](https://github.com/quy-ng/FoodyCrawl) available
  - **Caveat:** Requires authentication for some API endpoints. Projects warn about unauthorized data collection risks
  - **TinyFish:** Good approach -- handles authentication flows and dynamic content
  - **Difficulty:** Medium. Authentication required, APIs have changed over time

---

## EUROPE

### 29. TheFork (formerly LaFourchette / ElTenedor)
- **URL:** https://www.thefork.com
- **Language:** French, Italian, Spanish, Portuguese, Dutch, and more
- **What it is:** Restaurant booking platform across 12 European countries, 55K+ restaurants. Owned by TripAdvisor.
- **Unique data you CAN'T get from English sources:**
  - Real-time table availability and booking
  - Discount deals (up to 50% off at partner restaurants)
  - Michelin-starred restaurant availability
  - Local ratings that differ from TripAdvisor English ratings (different reviewer demographics)
  - Restaurant menus with pricing in local currency
- **Why it matters:** For dining in France, Italy, Spain -- TheFork has the booking layer that Google/TripAdvisor lack. Actionable reservations, not just reviews.
- **Scraping feasibility:**
  - **Apify:** [TheFork Scraper](https://apify.com/clearpath/thefork-scraper/api/openapi) with OpenAPI definition, [TheFork Restaurant Intelligence Scraper](https://apify.com/jdtpnjtp/thefork-restaurant-scraper-advanced) with 100+ data fields
  - **Piloterr:** [TheFork Locations API](https://www.piloterr.com/library/thefork-locations) and [Search API](https://www.piloterr.com/library/thefork-search)
  - **GitHub:** [TheFork organization](https://github.com/lafourchette) has open-source projects
  - **Difficulty:** Easy-Medium. Multiple scraping tools available

### 30. Trainline
- **URL:** https://www.thetrainline.com
- **Language:** English, French, Italian, Spanish, German
- **What it is:** Europe's leading rail/coach booking platform -- 270+ operators across 45 countries
- **Unique data you CAN'T get from English sources:**
  - Unified search across fragmented European rail operators
  - Real-time delays, disruptions, and platform changes
  - Split-ticketing optimization for cheaper fares
  - Regional/local train schedules that don't appear on Google
  - Coach services (BlaBlaBus, FlixBus, etc.) integrated with rail
- **Why it matters:** European rail is the backbone of inter-city travel. Trainline aggregates what would otherwise require checking dozens of national rail websites.
- **Scraping feasibility:**
  - **Official API:** [Trainline Global Travel API](https://tps.thetrainline.com/our-products/global-api/) -- B2B, requires partnership. Powers major travel brands.
  - **Open source:** [node-api-trains](https://github.com/janchj/node-api-trains) wrapper
  - **TinyFish:** Works for price queries and schedule extraction
  - **Difficulty:** Hard for API (B2B partnership required). Medium for TinyFish scraping

### 31. BlaBlaCar
- **URL:** https://www.blablacar.com
- **Language:** French, Spanish, Italian, German, Portuguese, and more
- **What it is:** Europe's largest ridesharing platform
- **Unique data you CAN'T get from English sources:**
  - Intercity rideshare availability and pricing (often 50-70% cheaper than train)
  - Routes not served by rail or bus
  - Driver ratings and reliability scores
  - Real-time seat availability
- **Why it matters:** In Southern/Eastern Europe, BlaBlaCar fills massive gaps in public transport. Many popular routes (e.g., Lisbon-Algarve, Paris-Normandy) are better served by BlaBlaCar than trains.
- **Scraping feasibility:**
  - **Official API:** [BlaBlaCar Public API v3](https://public-api.blablacar.com/api/v3/) -- REST/JSON, 1000 queries/day free tier. Returns trips, distance, duration, price, savings
  - **Python client:** [BlaBlaCar-API on PyPI](https://pypi.org/project/BlaBlaCar-API/)
  - **Bus API:** [Separate BlaBlaCar Bus API](https://bus-api.blablacar.com/) available
  - **Difficulty:** Easy. Well-documented public API with generous free tier

### 32. Komoot
- **URL:** https://www.komoot.com
- **Language:** German, English, French, Italian, Spanish, and more
- **What it is:** Europe's leading outdoor navigation platform -- 200M+ routes for hiking, cycling, running
- **Unique data you CAN'T get from English sources:**
  - GPS-verified hiking and cycling routes with elevation profiles
  - Difficulty ratings based on actual user completions
  - Trail condition reports and seasonal recommendations
  - Waypoint-level details (water sources, viewpoints, rest areas)
  - User-generated trip reports with photos and timing data
- **Why it matters:** For outdoor/adventure travel planning, Komoot has route data that AllTrails and Google don't, especially for European trails.
- **Scraping feasibility:**
  - **API:** Limited partner API (not fully public). [Thryve integration](https://www.thryve.health/features/connections/komoot-integration) for fitness data
  - **Apify:** [Komoot API Actor](https://apify.com/creatormagic/komoot-api) for route extraction
  - **Python:** [Kompy wrapper](https://matteovillosio.com/post/kompy/) for personal data access
  - **Unofficial client:** [komoot-api-client](https://github.com/janthomas89/komoot-api-client) on GitHub
  - **TinyFish:** Good for extracting route details and reviews from listing pages
  - **Difficulty:** Medium. No public API but community tools exist

---

## LATIN AMERICA

### 33. Despegar
- **URL:** https://www.despegar.com
- **Language:** Spanish, Portuguese
- **What it is:** Latin America's largest OTA, operating in 20+ countries
- **Unique data you CAN'T get from English sources:**
  - Latin American domestic flight pricing (often significantly cheaper than international OTAs)
  - Regional hotel inventory invisible to Booking.com/Expedia
  - Bus/coach booking integration (critical for LatAm travel)
  - Package deals designed for Latin American travelers
  - Multi-country trip pricing in local currencies
- **Why it matters:** Latin American domestic travel pricing is opaque to English-language OTAs. Despegar surfaces deals and inventory that Kayak/Skyscanner miss.
- **Scraping feasibility:**
  - **Official API:** [Despegar Developer Portal](https://dev.despegar.com/) with REST/JSON endpoints for Flights, Hotels, Cars, Packages. [API v3 docs](https://api.despegar.com/v3/)
  - **Thunderbit:** [Despegar Scraper](https://thunderbit.com/template/despegar-scraper) for hotels and flights
  - **TinyFish:** Works for price extraction and availability
  - **Difficulty:** Easy. Official API with good documentation

### 34. Rappi
- **URL:** https://www.rappi.com
- **Language:** Spanish, Portuguese
- **What it is:** Latin America's leading delivery super-app, operating in 9 countries (Colombia, Mexico, Brazil, Argentina, Chile, Peru, Ecuador, Costa Rica, Uruguay)
- **Unique data you CAN'T get from English sources:**
  - Local restaurant menus and pricing across LatAm cities
  - Grocery/pharmacy availability (useful for long-term travelers)
  - Food delivery pricing as proxy for restaurant cost data
  - Local restaurant discovery in cities with poor Google coverage
- **Why it matters:** In LatAm cities, Rappi is often the best way to discover local restaurants, especially in neighborhoods where Google Maps data is sparse.
- **Scraping feasibility:**
  - **Official API:** [Rappi Developer Portal](https://dev-portal.rappi.com/) -- manage orders, menus, store data. Requires partner account
  - **API Reference:** [API docs in Spanish](https://dev-portal.rappi.com/api/es/)
  - **TinyFish:** Good for extracting restaurant listings and menu data
  - **Difficulty:** Easy-Medium. Official API available for registered developers

---

## SCRAPING STRATEGY SUMMARY

### Recommended Approach by Tool

| Tool | Best For | Sources |
|------|----------|---------|
| **TinyFish** | Sites without APIs, complex JS rendering, anti-bot bypass, stealth scraping of foreign-language sites | Tabelog, Ikyu, Naver Blog, Xiaohongshu, Dianping, Yanolja, Foody.vn, Traveloka |
| **Apify** | Pre-built actors with scheduling, Xiaohongshu, TheFork, Douyin, Grab, Weibo | Xiaohongshu (multiple actors), TheFork, Douyin, Naver Maps, Grab Food, Klook, Komoot, Weibo |
| **Official APIs** | Reliable, legal, structured data | Rakuten Travel, Hot Pepper, Gurunavi, Kakao Maps, Daum Search, BlaBlaCar, Despegar, Rappi, Grab, Qunar |
| **Direct Scraping** | Simple HTML sites, forums | Japan Guide, Matcha, Tokyo Cheapo, Tistory blogs |

### Priority Tiers for Implementation

**Tier 1 -- Highest unique value, feasible to access:**
1. Tabelog (Japan restaurants -- Apify actor exists)
2. Naver Blog/Maps (Korea everything -- API + Apify)
3. Xiaohongshu (Chinese travel discovery -- multiple Apify actors)
4. Dianping (China restaurants -- crawlers exist)
5. Rakuten Travel (Japan hotels -- official free API)
6. Hot Pepper Gourmet (Japan restaurants -- official free API)

**Tier 2 -- High value, moderate effort:**
7. Kakao Maps (Korea mapping -- official API with English docs)
8. Mafengwo (China itineraries -- Scrapy tools exist)
9. Wongnai (Thailand restaurants -- official datasets)
10. TheFork (Europe restaurants -- Apify actors)
11. BlaBlaCar (Europe transport -- public API)
12. Jalan (Japan ryokan -- official API)

**Tier 3 -- Valuable complement:**
13. Grab (SEA transport/food -- official SDKs)
14. Despegar (LatAm flights/hotels -- official API)
15. Ctrip/Trip.com (China booking -- API available)
16. Douyin (China video travel -- Apify actors)
17. Traveloka (SEA booking -- partner API)
18. Foody.vn (Vietnam food -- GitHub crawlers)
19. MangoPlate (Korea restaurants -- Selenium)
20. Komoot (Europe outdoors -- Apify actor)

**Tier 4 -- Nice to have:**
21-34. Remaining sources (Gurunavi, Ikyu, Daum Cafe, Tistory, Yanolja, Klook, Qunar, Baidu Maps, Weibo, Trainline, Rappi, Japan Guide, Matcha/Tokyo Cheapo)
