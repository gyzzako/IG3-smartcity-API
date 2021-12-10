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
    order_fk integer references "order"(id) ON DELETE SET null,
    image varchar 
);

INSERT INTO "user"(firstname,lastname,phone_number,username,password,isAdmin,province,city,street_and_number) VALUES 
    ('Arnaud','Berg','0498989898','arnaud_berg','$2a$12$Ug1GMpPHaY.kzU6cOcRWquZ1DeNNgfJ6aqmJS4oh5Nv6ZfVPfUZ8e',true,'Namur','Walonnie','Chatelet 96'), --password
    ('Donny Samuel','Mboma','0498989898','donny_dsm','$2a$12$4o/3cuI3gw87Bx9EHdQR4eWjoB03YYQDV/Ztkr3am2Cp/.z3gTOtG',true,'Flandre Occidentale','Opwijk','kinstraat 26'), --motdepasse
    ('Emma','manu','049888888','emma_manu','$2a$12$Ser/ba7ePVKDHG4uAH/WKeIPZeEGoIzRm7WgJ3jLdrH0jvOAWDnKa',false,'Namur','Namur','Namur 95'), --mot
    ('Christopher','Dubois','04987898','dubois_chris','$2a$12$IbwxNje7QiEvaH/JG5Ji3OTeoTU.RxZa2UBzpAD50q1pLxffyDo6O',false,'Bruxelles','Bruxelles Uccle','Royaume 25'), --bois
    ('Cassy','Delambres','04987898','cassy_del','$2a$12$LTVUqQkkNSUp.JTqvXmlquUBOQNX4B2BSQ5mKE6sOP34wuQ1/MczO',false,'Bruxelles','Bruxelles Ixelles','Trone 44'), --eau
    ('Richard','Fontaine','02223568','riri_fofo','$2a$12$cuAqImEMf7GA1bS388gHNOJGOYKrWeIfuIcb50GwLf./N8MOz36Q2',false,'Namur','Namur','ISEN 66'), --orange
    ('Florent','Weiten','04987877','flo_weiten','$2a$12$il9pEPBNZi4qVY0TeTOjIeoPjSBi/pgY7IyLAYgRNa8VzV1LITQC2',false,'Luxembourg','Luxembourg GD','Safir 25'), --bleu
    ('Louis','Hermant','04987777','louisiane_01','$2a$12$Bkq68Pd51REROhnbue7fxuuLpNgvH5PJi8pnvOvqYdMOM5U6neRqS',false,'Namur','IESN','Henallux 25'), --jaune
    ('Boris','Clement','04987898','bobo_clems','$2a$12$TDKNXvMkeCV/.Q0e6ZPRE.qc1R7LcEsUu/wdOUuWnVjahSxqlX7DK',false,'Bruxelles','Bruxelles Ever','Prielstraat 12'); --gris

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
VALUES ('Pizza-Veggie ','Plat frais à chauffer au four à une temperature ne depassant pas 200 degrés',2,'2021-01-01',1,2,1,'https://assets.afcdn.com/recipe/20170427/39421_w1024h768c1cx831cy571.jpg' ),
       ('Carbonita-Do-Madrid','Plat chaud à manger le jour meme',1,'2020-12-01',2,5,3,'https://backend.panzani.fr/app/uploads/2021/05/recette-linguine-carbonara-italienne_mobile.jpg'),
       ('Moules Belge','Plat chaud à consommer de préférence le meme jour et avec des frites ou autres choses',3,'2021-12-03',8,4,10,'https://sf1.viepratique.fr/wp-content/uploads/sites/2/2014/02/shutterstock_115952584.jpg'),
       ('Bicky Burger','Burger Belge au boeuf ,salades et fromage à consommer de préférence le meme jour et chaud et avec un bon paquet des frites',7,'2021-12-10',7,1,9,'https://bicky.be/wp-content/uploads/2021/04/146430-Bicky-Crunchy-Chicken_508x306.png'),
       ('Bicky nature','Parfait pour ceux qui ne consomment trop epcié, Pain, Fromage et viande de poulet ',8,'2021-12-24',3,1,2,'https://static.solucious.be/images/V0000524352_large.JPG'),
       ('Sushi','Riz, saumon,concombre,gengembre mariné,sel et Wasabi',14,'2021-12-24',3,3,2,'https://media-cdn.tripadvisor.com/media/photo-s/17/e8/57/1d/um-dos-nossos-menus-de.jpg'),
       ('Maki Sushi','Riz, saumon, oeuf,sel,et soja',4,'2022-01-01',4,3,4,'https://www3.nhk.or.jp/nhkworld/en/radio/cooking/update/meal_160408_l.jpg');

