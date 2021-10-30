CREATE SCHEMA IF NOT EXISTS donationdb;

DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS "order";
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS meal;

create table "user"(
    user_id integer primary key generated always as identity,
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
    order_id integer primary key generated always as identity,
    order_date date not null,
    user_fk integer references "user"(user_id) DEFERRABLE INITIALLY IMMEDIATE
);

create table category(
    category_id integer primary key generated always as identity,
    category_name varchar not null
);

create table meal(
    meal_id integer primary key generated always as identity,
    meal_name varchar not null,
    description varchar not null,
    portion_number integer not null,
    publication_date date not null,
    user_fk integer references "user"(user_id)  DEFERRABLE INITIALLY IMMEDIATE,
    category_fk integer references category(category_id) DEFERRABLE INITIALLY IMMEDIATE,
    order_fk integer references "order"(order_id) DEFERRABLE INITIALLY IMMEDIATE,
    meal_image bytea 
);

