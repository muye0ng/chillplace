-- NextAuth.js 테이블 생성
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  type varchar(255) not null,
  provider varchar(255) not null,
  provider_account_id varchar(255) not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type varchar(255),
  scope varchar(255),
  id_token text,
  session_state varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(provider, provider_account_id)
);

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  expires timestamp with time zone not null,
  session_token varchar(255) not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists users (
  id uuid references auth.users on delete cascade,
  name varchar(255),
  email varchar(255) unique,
  email_verified timestamp with time zone,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

create table if not exists verification_tokens (
  identifier text not null,
  expires timestamp with time zone not null,
  token text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (identifier, token)
);