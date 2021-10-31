CREATE SCHEMA IF NOT EXISTS donationdb;

DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS meal CASCADE;

create table "user"(
    id integer primary key generated always as identity,
    firstname varchar not null,
    lastname varchar not null,
    phone_number varchar,
    username varchar not null unique,
    password varchar not null,
    isAdmin boolean not null,
    province varchar not null,
    city varchar not null,
    street_and_number varchar not null
);

create table "order"(
    id integer primary key generated always as identity,
    order_date date not null,
    user_fk integer references "user"(id) DEFERRABLE INITIALLY IMMEDIATE not null
);

create table category(
    id integer primary key generated always as identity,
    name varchar not null unique
);

create table meal(
    id integer primary key generated always as identity,
    name varchar not null,
    description varchar not null,
    portion_number integer not null,
    publication_date date not null,
    user_fk integer references "user"(id) DEFERRABLE INITIALLY IMMEDIATE not null ,
    category_fk integer references category(id) DEFERRABLE INITIALLY IMMEDIATE not null,
    order_fk integer references "order"(id) DEFERRABLE INITIALLY IMMEDIATE,
    image bytea 
);

