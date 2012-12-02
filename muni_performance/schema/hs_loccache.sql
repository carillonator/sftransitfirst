-- no longer needed: only for caching to db
CREATE TABLE `hs_loccache` (
  `vehid` int unsigned NOT NULL,
  `line` varchar(12) DEFAULT NULL,
  `run` varchar(24) DEFAULT NULL,
  `reported` int DEFAULT NULL,
  `lat` float(10,6) DEFAULT NULL,
  `lon` float(10,6) DEFAULT NULL,
  PRIMARY KEY (`vehid`)
) ENGINE=memory DEFAULT CHARSET=latin1
