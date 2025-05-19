create table if not exists watchlist (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  anime_id int not null,
  status text check (status in ('watched', 'want to watch')),
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_watchlist_user on watchlist(user_id);
create index if not exists idx_watchlist_anime on watchlist(anime_id);
