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
    image varchar 
);

INSERT INTO "user"(firstname,lastname,phone_number,username,password,isAdmin,province,city,street_and_number) VALUES ('Arnaud','Berg','0498989898','arnaud_berg','1234',true,'Namur','Walonnie','Chatelet 96'),
                                                                                                                        ('Donny Samuel','Mboma','0498989898','donny_dsm','4321',true,'Flandre Occidentale','Opwijk','kinstraat 26'),
                                                                                                                        ('Emma','vdc','049888888','emma_manu','4444',false,'Namur','Namur','Namur 95'),
                                                                                                                        ('Christopher','Dubois','04987898','dubois_chris','12345',false,'Bruxelles','Bruxelles Uccle','Royaume 25'),
                                                                                                                        ('Cassy','Delambres','04987898','cassy_del','12345',false,'Bruxelles','Bruxelles Ixelles','Trone 44'),
                                                                                                                        ('Richard','Fontaine','02223568','riri_fofo','9978',false,'Namur','Namur','ISEN 66'),
                                                                                                                        ('Florent','Weiten','04987877','flo_weiten','4477',false,'Luxembourg','Luxembourg GD','Safir 25'),
                                                                                                                        ('Louis','Hermant','04987777','louisiane_01','662345',false,'Namur','IESN','Henallux 25'),
                                                                                                                        ('Boris','Clement','04987898','bobo_clems','72345',false,'Bruxelles','Bruxelles Ever','Prielstraat 12');
INSERT INTO category(name) VALUES('Burger'),
                                     ('Pizza'),
                                     ('Sushi'),
                                     ('Plat Belge'),
                                     ('Plat Espagnol');

INSERT INTO "order"(order_date,user_fk) VALUES ('2021-01-12',1),
                                                  ('2021-07-07',3),
                                                  ('2020-12-03',2),
                                                  ('2022-06-14',5),
                                                  ('2022-06-14',4),
                                                  ('2022-06-14',8),
                                                  ('2022-06-14',9),
                                                  ('2022-06-14',7),
                                                  ('2022-06-14',6),
                                                  ('2022-06-14',8);

INSERT INTO meal(name,description,portion_number,publication_date,user_fk,category_fk,order_fk,image)
 VALUES ('Pizza-Veggie','Plat frais à chauffer au four à une temperature ne depassant pas 200 degrés',2,'2021-01-01',1,2,1,null ),
('Carbonita-Do-Madrid','Plat chaud à manger le jour meme',1,'2020-12-01',2,5,3,null );

