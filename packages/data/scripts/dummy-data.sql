-- Dummy data for Bing Scraper
-- Reference IDs:
-- uploaded_file_id: file_2a75e8db-9667-45b3-93ae-13d363d9c526
-- search_query_id: query_8e1bdf93-4fac-470e-8284-b669a2c31512
-- user_id: 1234567890 (from the context)

-- ============================================
-- SCRAPING TASKS
-- ============================================

-- Scraping task for the search query
INSERT INTO scraping_tasks (
    id,
    search_query_id,
    uploaded_file_id,
    user_id,
    status,
    workflow_id,
    queue_message_id,
    started_at,
    completed_at,
    duration_ms,
    error_message,
    retry_count,
    metadata,
    created_at,
    updated_at
) VALUES (
    'task_f4a2b1c3-8d7e-4f6a-9b2c-1e3d4f5a6b7c',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    'file_2a75e8db-9667-45b3-93ae-13d363d9c526',
    '1234567890',
    'completed',
    'workflow_abc123def456',
    'queue_msg_xyz789',
    1729036800,  -- 2024-10-16 00:00:00
    1729037100,  -- 2024-10-16 00:05:00 (5 minutes later)
    300000,      -- 5 minutes in milliseconds
    NULL,
    0,
    '{"browser":"chromium","version":"119.0","userAgent":"Mozilla/5.0"}',
    1729036800,
    1729037100
);

-- ============================================
-- SEARCH RESULTS
-- ============================================

-- Search result for the completed task
INSERT INTO search_results (
    id,
    task_id,
    query_id,
    user_id,
    query_text,
    total_results,
    page_title,
    search_url,
    scraped_at,
    r2_screenshot_key,
    r2_html_key,
    metadata,
    created_at,
    updated_at
) VALUES (
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'task_f4a2b1c3-8d7e-4f6a-9b2c-1e3d4f5a6b7c',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    '1234567890',
    'best coffee shops near me',
    10,
    'best coffee shops near me - Search',
    'https://www.bing.com/search?q=best+coffee+shops+near+me',
    1729037100,
    'screenshots/result_a1b2c3d4_1729037100.png',
    'html/result_a1b2c3d4_1729037100.html',
    '{"totalAds":2,"relatedSearches":5,"peopleAlsoAsk":3,"loadTime":2340}',
    1729037100,
    1729037100
);

-- ============================================
-- SEARCH RESULT ITEMS
-- ============================================

-- Organic result #1
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_001_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    1,
    'Best Coffee Shops in Your Area - Top Rated Cafes',
    'https://www.localcoffee.com/best-shops',
    'www.localcoffee.com/best-shops',
    'Discover the best coffee shops near you. We''ve curated a list of top-rated cafes with exceptional coffee, cozy atmosphere, and friendly service. Find your perfect spot today!',
    'organic',
    'localcoffee.com',
    0,
    '{"hasRating":true,"rating":4.8,"reviewCount":1250}',
    1729037100
);

-- Sponsored result #2
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_002_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    2,
    'Premium Coffee Delivery - Order Now & Save 20%',
    'https://ads.premiumcoffee.com/delivery?utm_source=bing',
    'www.premiumcoffee.com/delivery',
    'Get premium coffee delivered to your door. First order 20% off! Subscribe and save on the best artisan coffee beans from around the world.',
    'ad',
    'premiumcoffee.com',
    1,
    '{"adPosition":"top","bidAmount":"2.45","adExtensions":["sitelinks","callout"]}',
    1729037100
);

-- Organic result #3
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_003_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    3,
    'Coffee Shop Reviews 2025 - Local Guide',
    'https://www.cityguide.com/coffee-shops',
    'www.cityguide.com/coffee-shops',
    'Read honest reviews of local coffee shops. Our community has reviewed over 500 cafes, rating everything from espresso quality to ambiance. Find your new favorite spot!',
    'organic',
    'cityguide.com',
    0,
    '{"hasImages":true,"imageCount":12,"updatedDate":"2025-10-15"}',
    1729037100
);

-- Organic result #4
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_004_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    4,
    '10 Hidden Coffee Gems You Must Try - Coffee Insider',
    'https://www.coffeeinsider.com/hidden-gems',
    'www.coffeeinsider.com/hidden-gems',
    'Move over Starbucks! These 10 independent coffee shops serve the best brews in town. From cold brew to pour-over, discover where coffee enthusiasts really go.',
    'organic',
    'coffeeinsider.com',
    0,
    '{"articleDate":"2025-10-10","author":"Sarah Johnson","wordCount":1850}',
    1729037100
);

-- Organic result #5 (Featured snippet)
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_005_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    5,
    'What Makes a Great Coffee Shop? - Barista Magazine',
    'https://www.baristamagazine.com/great-coffee-shops',
    'www.baristamagazine.com',
    'A great coffee shop combines quality beans, skilled baristas, comfortable seating, and a welcoming atmosphere. Look for shops that roast their own beans, train their staff well, and create a community space.',
    'featured',
    'baristamagazine.com',
    0,
    '{"featuredSnippet":true,"snippetType":"paragraph","hasImage":true}',
    1729037100
);

-- Sponsored result #6
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_006_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    6,
    'Coffee Equipment Sale - Up to 50% Off Espresso Machines',
    'https://ads.coffeeequip.com/sale?ref=bing',
    'www.coffeeequip.com/sale',
    'Professional espresso machines at home prices! Shop our clearance sale and save big on top brands. Free shipping on orders over $100.',
    'ad',
    'coffeeequip.com',
    1,
    '{"adPosition":"middle","bidAmount":"1.89","promotion":"50% off"}',
    1729037100
);

-- Organic result #7 (Video)
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_007_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    7,
    'Coffee Shop Tour: Finding the Best Cafes in the City',
    'https://www.youtube.com/watch?v=abc123xyz',
    'www.youtube.com',
    'Join us as we visit 15 coffee shops in one day to find the absolute best! We rate each shop on coffee quality, atmosphere, price, and service.',
    'video',
    'youtube.com',
    0,
    '{"platform":"YouTube","duration":"15:42","views":125000,"uploadDate":"2025-10-12"}',
    1729037100
);

-- Organic result #8
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_008_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    8,
    'Coffee Shop Finder - Find Cafes Near You | MapCafe',
    'https://www.mapcafe.com/finder',
    'www.mapcafe.com/finder',
    'Use our interactive map to find coffee shops near you. Filter by ratings, price range, amenities, and more. See real-time availability and current wait times.',
    'organic',
    'mapcafe.com',
    0,
    '{"hasMap":true,"hasFilters":true,"listedShops":450}',
    1729037100
);

-- Organic result #9 (News)
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_009_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    9,
    'New Coffee Shop Opens Downtown, Promises Fair Trade Beans',
    'https://www.localnews.com/business/new-coffee-shop-opens',
    'www.localnews.com',
    'A new independent coffee shop opened its doors this week, featuring ethically sourced beans and a commitment to sustainability. The owner, a former barista champion, brings 15 years of experience.',
    'news',
    'localnews.com',
    0,
    '{"newsType":"local","publishDate":"2025-10-14","source":"Local News Daily"}',
    1729037100
);

-- Organic result #10
INSERT INTO search_result_items (
    id,
    search_result_id,
    query_id,
    position,
    title,
    url,
    display_url,
    snippet,
    type,
    domain,
    is_ad,
    metadata,
    created_at
) VALUES (
    'item_010_a1b2c3d4',
    'result_a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6g7h8',
    'query_8e1bdf93-4fac-470e-8284-b669a2c31512',
    10,
    'Reddit: Coffee Enthusiasts - Best Local Shops Discussion',
    'https://www.reddit.com/r/coffee/comments/bestshops2025',
    'www.reddit.com',
    'Discussion thread with over 500 comments sharing favorite local coffee shops. Community members share their top picks, hidden gems, and what makes each shop special.',
    'organic',
    'reddit.com',
    0,
    '{"forum":"reddit","subreddit":"coffee","comments":523,"upvotes":1840}',
    1729037100
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check scraping tasks
-- SELECT * FROM scraping_tasks WHERE uploaded_file_id = 'file_2a75e8db-9667-45b3-93ae-13d363d9c526';

-- Check search results
-- SELECT * FROM search_results WHERE query_id = 'query_8e1bdf93-4fac-470e-8284-b669a2c31512';

-- Check search result items
-- SELECT * FROM search_result_items WHERE query_id = 'query_8e1bdf93-4fac-470e-8284-b669a2c31512' ORDER BY position;

-- Get complete result set with all items
-- SELECT 
--     sr.query_text,
--     sr.total_results,
--     sri.position,
--     sri.title,
--     sri.url,
--     sri.type,
--     sri.is_ad
-- FROM search_results sr
-- JOIN search_result_items sri ON sr.id = sri.search_result_id
-- WHERE sr.query_id = 'query_8e1bdf93-4fac-470e-8284-b669a2c31512'
-- ORDER BY sri.position;
