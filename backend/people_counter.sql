-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2025 at 07:51 AM
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
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL,
  `api_key` varchar(64) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `api_key`, `device_id`, `created_at`) VALUES
(1, 'dc5e84762dc94e97b211331f428842af', 'ESP32_VL53L1X_001', '2025-04-26 06:06:20');

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
(1, 'entry', '2025-04-28 13:47:07'),
(2, 'entry', '2025-04-28 13:47:14'),
(3, 'entry', '2025-04-28 13:47:22'),
(4, 'entry', '2025-04-28 13:50:11'),
(5, 'entry', '2025-04-28 13:50:25');

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
(1, 5, 5, 0, '2025-04-28 13:50:25');

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
(1, '2025-04-28', 0, 0, 0, '2025-04-28 11:54:24', '2025-04-28 11:54:24');

-- --------------------------------------------------------

--
-- Table structure for table `device_data`
--

CREATE TABLE `device_data` (
  `id` int(11) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `current_count` int(11) NOT NULL DEFAULT 0,
  `entries` int(11) NOT NULL DEFAULT 0,
  `exits` int(11) NOT NULL DEFAULT 0,
  `last_distance` int(11) DEFAULT NULL,
  `last_zone` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_logs`
--

CREATE TABLE `device_logs` (
  `id` int(11) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `event_type` enum('ENTRY','EXIT','STATUS') NOT NULL,
  `details` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `people_count`
--

CREATE TABLE `people_count` (
  `id` int(11) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `entries` int(11) NOT NULL DEFAULT 0,
  `exits` int(11) NOT NULL DEFAULT 0,
  `current_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD UNIQUE KEY `device_id` (`device_id`);

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
-- Indexes for table `device_data`
--
ALTER TABLE `device_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `device_logs`
--
ALTER TABLE `device_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `people_count`
--
ALTER TABLE `people_count`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `counter_events`
--
ALTER TABLE `counter_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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

--
-- AUTO_INCREMENT for table `device_data`
--
ALTER TABLE `device_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `device_logs`
--
ALTER TABLE `device_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `people_count`
--
ALTER TABLE `people_count`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
