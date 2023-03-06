-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2023 at 12:57 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `secure-attached-db`
--
CREATE DATABASE IF NOT EXISTS `secure-attached-db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `secure-attached-db`;

-- --------------------------------------------------------

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
  `file_id` int(11) NOT NULL,
  `file_content` varchar(255) NOT NULL COMMENT 'filepath pada server',
  `file_type` varchar(50) NOT NULL,
  `fk_history` int(11) NOT NULL,
  `file_status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `history_link` varchar(255) NOT NULL COMMENT 'http link untuk download',
  `history_fk_sender` int(11) NOT NULL,
  `history_fk_receiver` int(11) NOT NULL,
  `history_time` datetime NOT NULL,
  `history_status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kunci`
--

DROP TABLE IF EXISTS `kunci`;
CREATE TABLE `kunci` (
  `kunci_id` int(11) NOT NULL,
  `kunci_content` varchar(1024) NOT NULL,
  `fk_pengguna` int(11) NOT NULL,
  `kunci_status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kunci`
--

INSERT INTO `kunci` (`kunci_id`, `kunci_content`, `fk_pengguna`, `kunci_status`) VALUES
(29, 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4ak1FWS9vd0RCWUpLd1lCQkFIYVJ3OEJBUWRBR25DVmFUMTZJWklrdlgxYXFEYjVjNUtJM1JwS2xFbzgKbW9MWGhNRW1FZ3JOR1dSMWJXMTVNU0E4WkhWdGJYa3hRR2R0WVdsc0xtTnZiVDdDakFRUUZnb0FQZ1dDClkvb3dEQVFMQ1FjSUNaRG9Ca2NzYlZYRFB3TVZDQW9FRmdBQ0FRSVpBUUtiQXdJZUFSWWhCTFFXdlFHYgpXdGc0S25HMWhPZ0dSeXh0VmNNL0FBQm1tZ0QrSXQ2bE1PUVNpYldmY3BIbHB1dTlZTm5yVUl4WU5jMTgKWW1rVGp1ZCs5eG9CQUtKUGNWYUd5VzZ1UUg3Y2dHRU1qQjFzQlpwU0ZtL0ZWZFp6Ly9yd2dpWUZ6amdFClkvb3dEQklLS3dZQkJBR1hWUUVGQVFFSFFEUkhVTUdXcEZKRHhjRHE2Vk9VeHhNNXlHaC9ocHNRVWdORQp4c1dUbTh4UUF3RUlCOEo0QkJnV0NBQXFCWUpqK2pBTUNaRG9Ca2NzYlZYRFB3S2JEQlloQkxRV3ZRR2IKV3RnNEtuRzFoT2dHUnl4dFZjTS9BQUM3amdEL2VwSG15cWhXSllTdVVmNjNITVF0R2d6STVDbWVhdU1BCmg3T05KOUFYOWRjQS9pUmxYZ2dpUG10Ulo2ZHpwWUlST2ZDR3Ywek9vRXFIWm94NVZBbit4ZjhECj0wcG1rCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K', 19, 1),
(30, 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4ak1FWS9veVRoWUpLd1lCQkFIYVJ3OEJBUWRBTGFReXZnYnArR0tnYnlGWmpUQXVtNHNLZnlMZ1d3UzcKUkE2V21RUU9GeTdOR1dSMWJXMTVNaUE4WkhWdGJYa3lRR2R0WVdsc0xtTnZiVDdDakFRUUZnb0FQZ1dDClkvb3lUZ1FMQ1FjSUNaQ3JoT0dRcVJwMm5RTVZDQW9FRmdBQ0FRSVpBUUtiQXdJZUFSWWhCQk5mVlpxNApGeUVGY2MrRng2dUU0WkNwR25hZEFBQVNJZ0Q5RTExSW9NbnN1U1I3WFVqMlVNeDJudmxqRUxkNFpEWEwKejdmR2tHQWJRV0FBLzFkVDl3OU1scUtFc24xWjR1c1psU0gxaVM0aFBhVzVMRGdRUFVVSmdvNEd6amdFClkvb3lUaElLS3dZQkJBR1hWUUVGQVFFSFFLWVpsbURaUjRoQWkzZlIxQ2JhN0dJY3BwZ0NkSGVSSmRNWApFT3l4cDlBTUF3RUlCOEo0QkJnV0NBQXFCWUpqK2pKT0NaQ3JoT0dRcVJwMm5RS2JEQlloQkJOZlZacTQKRnlFRmNjK0Z4NnVFNFpDcEduYWRBQURjaXdEOUhqUmNhQUtneEpsMGVCd2I2ODRXeE9icVdVRExnZkZDCjNaQkFyaGxKYXlFQS9pdTEzbmh0dDNlOW1kcUtzNXlXWHBuN0lwQWF4MjhPaHhEVGs1c0ZkK29BCj00b0trCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K', 20, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

DROP TABLE IF EXISTS `pengguna`;
CREATE TABLE `pengguna` (
  `pengguna_id` int(11) NOT NULL,
  `pengguna_email` varchar(100) NOT NULL,
  `pengguna_password` varchar(50) NOT NULL,
  `pengguna_username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengguna`
--

INSERT INTO `pengguna` (`pengguna_id`, `pengguna_email`, `pengguna_password`, `pengguna_username`) VALUES
(19, 'dummy1@gmail.com', '8c2753548775b4161e531c323ea24c08', 'dummy1'),
(20, 'dummy2@gmail.com', 'c0c40e7a94eea7e2c238b75273087710', 'dummy2'),
(21, 'dummy3@gmail.com', 'ffdc12d8d601ae40f258acf3d6e7e1fb', 'dummy3');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `file`
--
ALTER TABLE `file`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `fk_history` (`fk_history`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `fk_receiver` (`history_fk_receiver`),
  ADD KEY `fk_sender` (`history_fk_sender`);

--
-- Indexes for table `kunci`
--
ALTER TABLE `kunci`
  ADD PRIMARY KEY (`kunci_id`),
  ADD KEY `fk_pengguna` (`fk_pengguna`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`pengguna_id`),
  ADD UNIQUE KEY `user_email` (`pengguna_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `file`
--
ALTER TABLE `file`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `kunci`
--
ALTER TABLE `kunci`
  MODIFY `kunci_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `pengguna_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `file`
--
ALTER TABLE `file`
  ADD CONSTRAINT `fk_history` FOREIGN KEY (`fk_history`) REFERENCES `history` (`history_id`);

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `fk_receiver` FOREIGN KEY (`history_fk_receiver`) REFERENCES `pengguna` (`pengguna_id`),
  ADD CONSTRAINT `fk_sender` FOREIGN KEY (`history_fk_sender`) REFERENCES `pengguna` (`pengguna_id`);

--
-- Constraints for table `kunci`
--
ALTER TABLE `kunci`
  ADD CONSTRAINT `fk_pengguna` FOREIGN KEY (`fk_pengguna`) REFERENCES `pengguna` (`pengguna_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
