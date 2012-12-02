CREATE TABLE `hs_speeds` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `line` varchar(12) DEFAULT NULL,
  `run` varchar(24) DEFAULT NULL,
  `reported` int DEFAULT NULL,
  `lat` float(10,6) DEFAULT NULL,
  `lon` float(10,6) DEFAULT NULL,
  `speed` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
