# Cookies и сессии
 ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'пароль';
при ошибке
'Client does not support authentication protocol requested by server; consider upgrading MySQL client'


DB

create database rocks

create table items (id int primary key auto_increment, title varchar(255),description varchar(255), image varchar(255));

create table users (id int primary key auto_increment, name varchar(255), password varchar(255));