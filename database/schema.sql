CREATE DATABASE szeyapdb;

CREATE TABLE Guilds
(
  guildId VARCHAR(100) NOT NULL PRIMARY KEY,
  guildOwnerId VARCHAR(100) NOT NULL,
  cmdPrefix VARCHAR(10) NOT NULL DEFAULT '+',
  welcomeMessage BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE Users
(
  userId VARCHAR(100) NOT NULL PRIMARY KEY,
  favRomanType VARCHAR(10)
);

