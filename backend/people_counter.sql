-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 11, 2025 at 10:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `people_counter`
--

-- --------------------------------------------------------

--
-- Table structure for table `counter_events`
--

CREATE TABLE `counter_events` (
  `id` int(11) NOT NULL,
  `event_type` enum('entry','exit') NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counter_events`
--

INSERT INTO `counter_events` (`id`, `event_type`, `timestamp`) VALUES
(1922, 'exit', '2025-05-11 15:47:09'),
(1923, 'exit', '2025-05-11 15:47:15'),
(1924, 'entry', '2025-05-11 15:47:27'),
(1925, 'entry', '2025-05-11 15:47:39'),
(1926, 'exit', '2025-05-11 15:47:51'),
(1927, 'exit', '2025-05-11 15:47:51'),
(1928, 'exit', '2025-05-11 15:53:09'),
(1929, 'entry', '2025-05-11 15:53:18'),
(1930, 'exit', '2025-05-11 15:53:22'),
(1931, 'entry', '2025-05-11 15:53:33'),
(1932, 'exit', '2025-05-11 15:56:40'),
(1933, 'entry', '2025-05-11 15:58:57');

-- --------------------------------------------------------

--
-- Table structure for table `counter_stats`
--

CREATE TABLE `counter_stats` (
  `id` int(11) NOT NULL,
  `current_count` int(11) NOT NULL DEFAULT 0,
  `total_entries` int(11) NOT NULL DEFAULT 0,
  `total_exits` int(11) NOT NULL DEFAULT 0,
  `last_updated` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counter_stats`
--

INSERT INTO `counter_stats` (`id`, `current_count`, `total_entries`, `total_exits`, `last_updated`) VALUES
(1, 0, 20, 20, '2025-05-11 15:58:57');

-- --------------------------------------------------------

--
-- Table structure for table `daily_stats`
--

CREATE TABLE `daily_stats` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `total_entries` int(11) NOT NULL DEFAULT 0,
  `total_exits` int(11) NOT NULL DEFAULT 0,
  `peak_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_stats`
--

INSERT INTO `daily_stats` (`id`, `date`, `total_entries`, `total_exits`, `peak_count`, `created_at`, `updated_at`) VALUES
(1, '2025-05-11', 0, 0, 0, '2025-05-11 11:54:24', '2025-05-11 16:01:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `counter_events`
--
ALTER TABLE `counter_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- Indexes for table `counter_stats`
--
ALTER TABLE `counter_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `daily_stats`
--
ALTER TABLE `daily_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `counter_events`
--
ALTER TABLE `counter_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1934;

--
-- AUTO_INCREMENT for table `counter_stats`
--
ALTER TABLE `counter_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `daily_stats`
--
ALTER TABLE `daily_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
