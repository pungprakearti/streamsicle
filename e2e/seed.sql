-- E2E test seed data
-- ~80 titles across genres, types, statuses, and services

-- Services (same IDs as production for consistency)
INSERT INTO services (id, slug, name) VALUES
  ('svc-netflix',   'netflix',   'Netflix'),
  ('svc-prime',     'prime',     'Prime Video'),
  ('svc-disney',    'disney',    'Disney+'),
  ('svc-max',       'max',       'Max'),
  ('svc-apple',     'apple',     'Apple TV+'),
  ('svc-hulu',      'hulu',      'Hulu'),
  ('svc-paramount', 'paramount', 'Paramount+'),
  ('svc-peacock',   'peacock',   'Peacock');

-- Profiles
INSERT INTO profiles (id, name, avatar_id, created_at) VALUES
  ('prof-andrew', 'Andrew', 'rocket-launch', '2026-09-30 00:46:19.904'),
  ('prof-violet', 'Violet', 'flower',        '2026-10-01 12:00:00.000');

-- Helper: generate titles across genres, types, statuses
-- Films - CATALOG status (40 titles)
INSERT INTO titles (id, tmdb_id, title, type, logline, release_date, status, rating, content_rating, runtime, genres, tmdb_popularity, poster_path, credit, created_at, updated_at) VALUES
  ('t-film-01', 100001, 'The Dark Frontier',       'FILM',   'A lone sheriff faces an impossible choice.',         '2025-03-15', 'CATALOG', '7.2', 'PG-13', 118, '{Western,Drama}',       85.0, NULL, 'John Ford',       NOW(), NOW()),
  ('t-film-02', 100002, 'Neon Nights',              'FILM',   'Cyberpunk noir in a rain-soaked city.',              '2025-06-20', 'CATALOG', '8.1', 'R',     142, '{Action,Sci-Fi}',       92.0, NULL, 'Ridley Scott',    NOW(), NOW()),
  ('t-film-03', 100003, 'The Last Garden',          'FILM',   'A family rebuilds after loss.',                      '2024-11-08', 'CATALOG', '7.8', 'PG',    105, '{Drama,Romance}',       78.0, NULL, 'Greta Gerwig',    NOW(), NOW()),
  ('t-film-04', 100004, 'Velocity',                 'FILM',   'High-speed racing across continents.',               '2025-01-22', 'CATALOG', '6.9', 'PG-13', 130, '{Action,Adventure}',    88.0, NULL, 'Michael Bay',     NOW(), NOW()),
  ('t-film-05', 100005, 'Whispers in the Fog',      'FILM',   'A ghost story set in Victorian England.',            '2024-10-31', 'CATALOG', '7.5', 'PG-13', 98,  '{Horror,Mystery}',      72.0, NULL, 'James Wan',       NOW(), NOW()),
  ('t-film-06', 100006, 'Comedy Central Station',   'FILM',   'Chaos erupts at a small-town train station.',        '2025-04-01', 'CATALOG', '6.4', 'PG-13', 95,  '{Comedy}',              65.0, NULL,                  'Judd Apatow',     NOW(), NOW()),
  ('t-film-07', 100007, 'Ocean Deep',               'FILM',   'Divers discover an ancient underwater city.',        '2025-02-14', 'CATALOG', '7.0', 'PG',    112, '{Adventure,Sci-Fi}',    70.0, NULL, 'James Cameron',   NOW(), NOW()),
  ('t-film-08', 100008, 'The Algorithm',            'FILM',   'An AI becomes self-aware in a tech startup.',        '2025-05-10', 'CATALOG', '7.9', 'PG-13', 108, '{Sci-Fi,Drama}',        82.0, NULL, 'Denis Villeneuve',NOW(), NOW()),
  ('t-film-09', 100009, 'Painted Desert',           'FILM',   'Artists compete in the Utah badlands.',              '2024-09-15', 'CATALOG', '6.8', 'PG',    96,  '{Drama,Western}',       58.0, NULL, 'Wes Anderson',    NOW(), NOW()),
  ('t-film-10', 100010, 'Frozen Solid',             'FILM',   'Survival in the Arctic after a plane crash.',        '2025-07-04', 'CATALOG', '7.3', 'R',     125, '{Action,Drama}',        76.0, NULL, 'Alejandro Inarritu', NOW(), NOW()),
  ('t-film-11', 100011, 'Love in Paris',            'FILM',   'Two strangers meet on the Seine.',                   '2024-02-14', 'CATALOG', '6.5', 'PG',    100, '{Romance,Comedy}',      60.0, NULL, 'Nancy Meyers',    NOW(), NOW()),
  ('t-film-12', 100012, 'Deadline',                 'FILM',   'A journalist races to expose corruption.',           '2025-08-18', 'CATALOG', '7.7', 'R',     115, '{Drama,Crime}',         80.0, NULL, 'David Fincher',   NOW(), NOW()),
  ('t-film-13', 100013, 'Galaxy Run',               'FILM',   'Smugglers outrun an interstellar fleet.',            '2025-05-25', 'CATALOG', '7.1', 'PG-13', 138, '{Sci-Fi,Action}',       90.0, NULL, 'George Lucas',    NOW(), NOW()),
  ('t-film-14', 100014, 'The Baker Street Files',   'FILM',   'Modern-day Sherlock in Manhattan.',                  '2024-12-25', 'CATALOG', '7.4', 'PG-13', 110, '{Mystery,Crime}',       74.0, NULL, 'Guy Ritchie',     NOW(), NOW()),
  ('t-film-15', 100015, 'Sunflower Valley',         'FILM',   'A coming-of-age summer in rural France.',            '2025-06-01', 'CATALOG', '7.6', 'PG',    102, '{Drama,Romance}',       68.0, NULL, 'Sofia Coppola',   NOW(), NOW()),
  ('t-film-16', 100016, 'Riot Act',                 'FILM',   'A punk band takes on corporate greed.',              '2024-08-10', 'CATALOG', '6.7', 'R',     99,  '{Comedy,Drama}',        55.0, NULL, 'Edgar Wright',    NOW(), NOW()),
  ('t-film-17', 100017, 'Nightwatch',               'FILM',   'A security guard uncovers museum secrets.',          '2025-03-28', 'CATALOG', '7.0', 'PG-13', 104, '{Mystery,Horror}',      62.0, NULL, 'Jordan Peele',    NOW(), NOW()),
  ('t-film-18', 100018, 'Thunder Road',             'FILM',   'Storm chasers in Oklahoma tornado season.',          '2025-04-15', 'CATALOG', '6.6', 'PG-13', 108, '{Action,Adventure}',    71.0, NULL, 'Jan de Bont',     NOW(), NOW()),
  ('t-film-19', 100019, 'The Diplomat',             'FILM',   'Cold War spy thriller in Berlin.',                   '2024-11-22', 'CATALOG', '8.0', 'R',     135, '{Drama,Action}',        86.0, NULL, 'Steven Spielberg',NOW(), NOW()),
  ('t-film-20', 100020, 'Pixel Perfect',            'FILM',   'Animated adventure inside a video game.',            '2025-07-18', 'CATALOG', '7.2', 'G',     94,  '{Animation,Adventure}', 83.0, NULL, 'Pete Docter',     NOW(), NOW()),
  ('t-film-21', 100021, 'Silent Treatment',         'FILM',   'A couple in therapy unravels dark truths.',          '2024-06-14', 'CATALOG', '7.3', 'R',     110, '{Drama}',               64.0, NULL, 'Noah Baumbach',   NOW(), NOW()),
  ('t-film-22', 100022, 'Iron Canyon',              'FILM',   'Gold rush drama in 1849 California.',               '2025-09-05', 'CATALOG', '7.5', 'PG-13', 128, '{Western,Adventure}',   77.0, NULL, 'Quentin Tarantino', NOW(), NOW()),
  ('t-film-23', 100023, 'Echoes',                   'FILM',   'A musician loses hearing before the big concert.',   '2025-02-28', 'CATALOG', '7.8', 'PG-13', 106, '{Drama,Music}',         73.0, NULL, 'Damien Chazelle', NOW(), NOW()),
  ('t-film-24', 100024, 'Tidal Wave',               'FILM',   'A coastal town braces for a mega-tsunami.',          '2024-07-22', 'CATALOG', '6.3', 'PG-13', 116, '{Action,Drama}',        69.0, NULL, 'Roland Emmerich', NOW(), NOW()),
  ('t-film-25', 100025, 'Homebound',                'FILM',   'An astronaut struggles to return to Earth.',         '2025-10-01', 'CATALOG', '8.2', 'PG-13', 144, '{Sci-Fi,Drama}',        95.0, NULL, 'Christopher Nolan', NOW(), NOW());

-- Series - CATALOG status (15 titles)
INSERT INTO titles (id, tmdb_id, title, type, logline, release_date, status, rating, content_rating, runtime, genres, tmdb_popularity, poster_path, credit, created_at, updated_at) VALUES
  ('t-series-01', 200001, 'The Compound',            'SERIES', 'Families survive in a post-apocalyptic bunker.',     '2024-03-10', 'CATALOG', '8.3', 'TV-MA', NULL, '{Sci-Fi,Drama}',        91.0, NULL, 'Created by Damon Lindelof', NOW(), NOW()),
  ('t-series-02', 200002, 'Badge & Gun',             'SERIES', 'Rookie cops navigate a corrupt precinct.',           '2025-01-15', 'CATALOG', '7.6', 'TV-14', NULL, '{Crime,Drama}',         79.0, NULL, 'Created by Dick Wolf',      NOW(), NOW()),
  ('t-series-03', 200003, 'Kitchen Wars',            'SERIES', 'Chefs compete in extreme culinary challenges.',      '2024-09-01', 'CATALOG', '6.8', 'TV-PG', NULL, '{Comedy,Reality}',      67.0, NULL, 'Created by Gordon Ramsay',  NOW(), NOW()),
  ('t-series-04', 200004, 'The Hollow Crown',        'SERIES', 'Medieval politics and betrayal.',                    '2025-04-20', 'CATALOG', '8.5', 'TV-MA', NULL, '{Drama,History}',       87.0, NULL, 'Created by Peter Morgan',   NOW(), NOW()),
  ('t-series-05', 200005, 'Starbound',               'SERIES', 'Colonists on a distant planet face alien threats.',  '2024-06-30', 'CATALOG', '7.9', 'TV-14', NULL, '{Sci-Fi,Adventure}',    84.0, NULL, 'Created by Ronald D. Moore',NOW(), NOW()),
  ('t-series-06', 200006, 'Laugh Track',             'SERIES', 'Behind the scenes of a failing sitcom.',             '2025-03-01', 'CATALOG', '7.1', 'TV-14', NULL, '{Comedy}',              61.0, NULL, 'Created by Tina Fey',       NOW(), NOW()),
  ('t-series-07', 200007, 'Shadow Line',             'SERIES', 'A spy network unravels across Europe.',              '2024-11-15', 'CATALOG', '8.0', 'TV-MA', NULL, '{Action,Drama}',        81.0, NULL, 'Created by John le Carre',  NOW(), NOW()),
  ('t-series-08', 200008, 'Greenfield',              'SERIES', 'Small-town secrets in the American Midwest.',        '2025-02-10', 'CATALOG', '7.4', 'TV-14', NULL, '{Drama,Mystery}',       66.0, NULL, 'Created by David Lynch',    NOW(), NOW()),
  ('t-series-09', 200009, 'Wildfire',                'SERIES', 'Firefighters battle California blazes.',             '2024-08-20', 'CATALOG', '7.2', 'TV-14', NULL, '{Action,Drama}',        75.0, NULL, 'Created by Ryan Murphy',    NOW(), NOW()),
  ('t-series-10', 200010, 'The Anchor Desk',         'SERIES', 'Drama inside a 24-hour news network.',               '2025-05-15', 'CATALOG', '7.7', 'TV-MA', NULL, '{Drama}',               70.0, NULL, 'Created by Aaron Sorkin',   NOW(), NOW()),
  ('t-series-11', 200011, 'Outlaw Trail',            'SERIES', 'A western saga across three generations.',           '2024-04-12', 'CATALOG', '7.9', 'TV-MA', NULL, '{Western,Drama}',       82.0, NULL, 'Created by Taylor Sheridan',NOW(), NOW()),
  ('t-series-12', 200012, 'Codebreakers',            'SERIES', 'WWII codebreakers race against time.',               '2025-06-08', 'CATALOG', '8.1', 'TV-14', NULL, '{Drama,History}',       78.0, NULL, 'Created by Graham Moore',   NOW(), NOW()),
  ('t-series-13', 200013, 'Fright Night Live',       'SERIES', 'A haunted house reality show goes wrong.',           '2024-10-15', 'CATALOG', '6.5', 'TV-MA', NULL, '{Horror,Comedy}',       59.0, NULL, 'Created by Sam Raimi',      NOW(), NOW()),
  ('t-series-14', 200014, 'Coast to Coast',          'SERIES', 'Road trip comedy across America.',                   '2025-07-01', 'CATALOG', '6.9', 'TV-14', NULL, '{Comedy,Adventure}',    63.0, NULL, 'Created by Lena Waithe',    NOW(), NOW()),
  ('t-series-15', 200015, 'Deep State',              'SERIES', 'Political thriller inside the intelligence community.', '2024-12-01', 'CATALOG', '8.4', 'TV-MA', NULL, '{Drama,Action}',     89.0, NULL, 'Created by Alex Garland',   NOW(), NOW());

-- NEW status titles (8 - need enough for hero + "also new")
INSERT INTO titles (id, tmdb_id, title, type, logline, release_date, status, rating, content_rating, runtime, genres, tmdb_popularity, poster_path, credit, created_at, updated_at) VALUES
  ('t-new-01', 300001, 'Starfall',                 'FILM',   'Meteors bring alien life to a small town.',          '2026-10-10', 'NEW', '7.8', 'PG-13', 120, '{Sci-Fi,Action}',       93.0, NULL, 'Denis Villeneuve', NOW(), NOW()),
  ('t-new-02', 300002, 'The Memory Thief',         'FILM',   'A detective steals memories to solve crimes.',       '2026-10-05', 'NEW', '8.0', 'PG-13', 115, '{Sci-Fi,Mystery}',      88.0, NULL, 'Christopher Nolan', NOW(), NOW()),
  ('t-new-03', 300003, 'Breaking Point',           'SERIES', 'Athletes push past limits in extreme sports.',       '2026-10-01', 'NEW', '7.2', 'TV-14', NULL, '{Drama,Action}',        75.0, NULL, 'Created by Taylor Sheridan', NOW(), NOW()),
  ('t-new-04', 300004, 'Last Light',               'FILM',   'A family survives global power failure.',            '2026-09-28', 'NEW', '7.5', 'PG-13', 108, '{Drama,Sci-Fi}',        80.0, NULL, 'Steven Spielberg', NOW(), NOW()),
  ('t-new-05', 300005, 'Harmony Lane',             'SERIES', 'Neighbors on a suburban street hide dark secrets.',  '2026-09-25', 'NEW', '7.0', 'TV-14', NULL, '{Drama,Mystery}',       70.0, NULL, 'Created by David Lynch', NOW(), NOW()),
  ('t-new-06', 300006, 'The Iron Fist',            'FILM',   'A boxer makes one last comeback.',                   '2026-10-12', 'NEW', '7.6', 'PG-13', 112, '{Drama,Action}',        85.0, NULL, 'Ryan Coogler', NOW(), NOW()),
  ('t-new-07', 300007, 'Wild Kingdom',             'SERIES', 'Nature documentary in uncharted territories.',       '2026-10-08', 'NEW', '8.3', 'TV-G',  NULL, '{Documentary}',         78.0, NULL, 'Created by David Attenborough', NOW(), NOW()),
  ('t-new-08', 300008, 'Crossroads Diner',         'FILM',   'Strangers connect in a 24-hour diner.',              '2026-10-03', 'NEW', '7.1', 'PG',    96,  '{Drama,Comedy}',        65.0, NULL, 'Greta Gerwig', NOW(), NOW());

-- UPCOMING status titles (5)
INSERT INTO titles (id, tmdb_id, title, type, logline, release_date, status, rating, content_rating, runtime, genres, tmdb_popularity, poster_path, credit, created_at, updated_at) VALUES
  ('t-upcoming-01', 400001, 'Nova Rising',           'FILM',   'A new hero emerges from the ashes.',                 '2026-12-20', 'UPCOMING', NULL, 'PG-13', 140, '{Action,Sci-Fi}',       96.0, NULL, 'James Gunn', NOW(), NOW()),
  ('t-upcoming-02', 400002, 'The Silver Line',       'SERIES', 'A luxury train hides dangerous passengers.',          '2026-11-15', 'UPCOMING', NULL, 'TV-MA', NULL, '{Mystery,Drama}',       80.0, NULL, 'Created by Rian Johnson', NOW(), NOW()),
  ('t-upcoming-03', 400003, 'Arctic Bloom',          'FILM',   'Scientists find life under the ice caps.',            '2027-01-10', 'UPCOMING', NULL, 'PG',    110, '{Sci-Fi,Drama}',        72.0, NULL, 'James Cameron', NOW(), NOW()),
  ('t-upcoming-04', 400004, 'Concrete Jungle',       'SERIES', 'Urban wildlife documentary in major cities.',         '2026-11-28', 'UPCOMING', NULL, 'TV-PG', NULL, '{Documentary}',         68.0, NULL, 'Created by Werner Herzog', NOW(), NOW()),
  ('t-upcoming-05', 400005, 'Midnight Rider',        'FILM',   'A motorcycle courier takes on the underworld.',       '2027-02-14', 'UPCOMING', NULL, 'R',     118, '{Action,Crime}',        74.0, NULL, 'Chad Stahelski', NOW(), NOW());

-- Title-Service mappings (spread across all 8 services)
INSERT INTO title_services (title_id, service_id, availability) VALUES
  -- Netflix
  ('t-film-01', 'svc-netflix', 'STREAM'), ('t-film-02', 'svc-netflix', 'STREAM'),
  ('t-film-10', 'svc-netflix', 'STREAM'), ('t-film-12', 'svc-netflix', 'STREAM'),
  ('t-film-19', 'svc-netflix', 'STREAM'), ('t-series-01', 'svc-netflix', 'STREAM'),
  ('t-series-07', 'svc-netflix', 'STREAM'), ('t-series-15', 'svc-netflix', 'STREAM'),
  ('t-new-01', 'svc-netflix', 'STREAM'), ('t-new-06', 'svc-netflix', 'STREAM'),
  -- Prime Video
  ('t-film-03', 'svc-prime', 'STREAM'), ('t-film-04', 'svc-prime', 'STREAM'),
  ('t-film-13', 'svc-prime', 'STREAM'), ('t-film-18', 'svc-prime', 'STREAM'),
  ('t-series-02', 'svc-prime', 'STREAM'), ('t-series-09', 'svc-prime', 'STREAM'),
  ('t-new-02', 'svc-prime', 'STREAM'), ('t-new-03', 'svc-prime', 'STREAM'),
  ('t-film-05', 'svc-prime', 'RENT'),
  -- Disney+
  ('t-film-07', 'svc-disney', 'STREAM'), ('t-film-20', 'svc-disney', 'STREAM'),
  ('t-series-05', 'svc-disney', 'STREAM'), ('t-series-11', 'svc-disney', 'STREAM'),
  ('t-new-07', 'svc-disney', 'STREAM'), ('t-upcoming-01', 'svc-disney', 'STREAM'),
  -- Max
  ('t-film-05', 'svc-max', 'STREAM'), ('t-film-08', 'svc-max', 'STREAM'),
  ('t-film-14', 'svc-max', 'STREAM'), ('t-series-04', 'svc-max', 'STREAM'),
  ('t-series-10', 'svc-max', 'STREAM'), ('t-new-04', 'svc-max', 'STREAM'),
  ('t-upcoming-02', 'svc-max', 'STREAM'),
  -- Apple TV+
  ('t-film-06', 'svc-apple', 'STREAM'), ('t-film-09', 'svc-apple', 'STREAM'),
  ('t-film-15', 'svc-apple', 'STREAM'), ('t-film-23', 'svc-apple', 'STREAM'),
  ('t-series-03', 'svc-apple', 'STREAM'), ('t-series-06', 'svc-apple', 'STREAM'),
  ('t-series-12', 'svc-apple', 'STREAM'), ('t-new-05', 'svc-apple', 'STREAM'),
  ('t-new-08', 'svc-apple', 'STREAM'), ('t-upcoming-03', 'svc-prime', 'STREAM'),
  -- Hulu
  ('t-film-11', 'svc-hulu', 'STREAM'), ('t-film-16', 'svc-hulu', 'STREAM'),
  ('t-film-21', 'svc-hulu', 'STREAM'), ('t-series-08', 'svc-hulu', 'STREAM'),
  ('t-series-13', 'svc-hulu', 'STREAM'), ('t-upcoming-04', 'svc-hulu', 'STREAM'),
  -- Paramount+
  ('t-film-17', 'svc-paramount', 'STREAM'), ('t-film-22', 'svc-paramount', 'STREAM'),
  ('t-film-24', 'svc-paramount', 'STREAM'), ('t-series-14', 'svc-paramount', 'STREAM'),
  ('t-upcoming-05', 'svc-paramount', 'STREAM'),
  -- Peacock
  ('t-film-25', 'svc-peacock', 'STREAM'), ('t-series-03', 'svc-peacock', 'STREAM'),
  ('t-series-09', 'svc-peacock', 'STREAM'),
  -- BUY availability
  ('t-film-19', 'svc-apple', 'BUY'), ('t-film-25', 'svc-prime', 'BUY');

-- Cast members (for title detail tests)
INSERT INTO cast_members (id, title_id, name, role, photo_path, sort_order) VALUES
  ('cast-01', 't-film-01', 'John Wayne',      'Sheriff Cole',     NULL, 0),
  ('cast-02', 't-film-01', 'Clint Eastwood',  'Deputy Briggs',    NULL, 1),
  ('cast-03', 't-film-01', 'Meryl Streep',    'Mayor Anderson',   NULL,           2),
  ('cast-04', 't-film-02', 'Keanu Reeves',    'Detective Kai',    NULL, 0),
  ('cast-05', 't-film-02', 'Ana de Armas',    'Agent Mora',       NULL, 1),
  ('cast-06', 't-series-01', 'Oscar Isaac',   'Dr. Marcus Wells', NULL, 0),
  ('cast-07', 't-series-01', 'Zendaya',       'Luna Reyes',       NULL, 1),
  ('cast-08', 't-film-23',   'Ryan Gosling',  'Marcus Cole',      NULL, 0),
  ('cast-09', 't-film-23',   'Saoirse Ronan', 'Emma Lane',        NULL, 1),
  ('cast-10', 't-film-15',   'Timothee Chalamet', 'Pierre',       NULL, 0);

-- Crew members (for directed-by / created-by tests)
INSERT INTO crew_members (id, title_id, name, department, sort_order) VALUES
  ('crew-01', 't-film-01', 'John Ford',       'Directing', 0),
  ('crew-02', 't-film-01', 'Roger Deakins',   'Camera',    1),
  ('crew-03', 't-film-02', 'Ridley Scott',    'Directing', 0),
  ('crew-04', 't-series-01', 'Damon Lindelof','Directing', 0),
  ('crew-05', 't-film-23',   'Damien Chazelle','Directing', 0),
  ('crew-06', 't-film-15',   'Sofia Coppola', 'Directing', 0);

-- Seasons (for series detail tests)
INSERT INTO seasons (id, title_id, season_number, episode_count, air_date) VALUES
  ('season-01', 't-series-01', 1, 10, '2024-03-10'),
  ('season-02', 't-series-01', 2, 8,  '2024-09-15'),
  ('season-03', 't-series-04', 1, 6,  '2025-04-20'),
  ('season-04', 't-series-03', 1, 12, '2024-09-01'),
  ('season-05', 't-series-06', 1, 8,  '2025-03-01'),
  ('season-06', 't-series-12', 1, 10, '2025-06-08');

-- Episodes (a few for completeness)
INSERT INTO episodes (id, season_id, episode_number, title, overview, air_date, runtime) VALUES
  ('ep-01', 'season-01', 1, 'The Descent', 'The bunker doors close for the last time.', '2024-03-10', 52),
  ('ep-02', 'season-01', 2, 'Rations',     'Food supply runs dangerously low.',          '2024-03-17', 48);

-- Watchlist items (for Andrew profile)
INSERT INTO watchlist (id, title_id, profile_id, added_at) VALUES
  ('wl-01', 't-film-02',    'prof-andrew', '2026-10-05'),
  ('wl-02', 't-series-01',  'prof-andrew', '2026-10-06'),
  ('wl-03', 't-film-19',    'prof-andrew', '2026-10-07'),
  ('wl-04', 't-new-01',     'prof-andrew', '2026-10-10');
