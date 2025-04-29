-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2025 at 11:13 AM
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
(1527, 'entry', '2025-04-29 11:50:03'),
(1528, 'entry', '2025-04-29 11:50:05'),
(1529, 'exit', '2025-04-29 11:50:09'),
(1530, 'exit', '2025-04-29 11:50:13'),
(1531, 'entry', '2025-04-29 11:50:35'),
(1532, 'exit', '2025-04-29 11:50:37'),
(1533, 'exit', '2025-04-29 13:55:13'),
(1534, 'entry', '2025-04-29 13:55:15'),
(1535, 'exit', '2025-04-29 13:55:23'),
(1536, 'entry', '2025-04-29 13:55:27'),
(1537, 'exit', '2025-04-29 13:55:29'),
(1538, 'entry', '2025-04-29 13:55:30'),
(1539, 'exit', '2025-04-29 13:55:32'),
(1540, 'entry', '2025-04-29 13:55:34'),
(1541, 'exit', '2025-04-29 13:55:35'),
(1542, 'entry', '2025-04-29 13:55:37'),
(1543, 'exit', '2025-04-29 13:55:39'),
(1544, 'entry', '2025-04-29 13:55:40'),
(1545, 'exit', '2025-04-29 13:55:41'),
(1546, 'entry', '2025-04-29 13:55:43'),
(1547, 'exit', '2025-04-29 13:55:45'),
(1548, 'entry', '2025-04-29 13:55:47'),
(1549, 'exit', '2025-04-29 13:55:49'),
(1550, 'entry', '2025-04-29 13:55:51'),
(1551, 'exit', '2025-04-29 13:55:53'),
(1552, 'entry', '2025-04-29 13:55:55'),
(1553, 'exit', '2025-04-29 13:55:57'),
(1554, 'entry', '2025-04-29 13:56:00'),
(1555, 'exit', '2025-04-29 13:56:01'),
(1556, 'entry', '2025-04-29 13:56:03'),
(1557, 'exit', '2025-04-29 13:56:04'),
(1558, 'entry', '2025-04-29 13:56:06'),
(1559, 'exit', '2025-04-29 13:56:08'),
(1560, 'entry', '2025-04-29 13:56:10'),
(1561, 'exit', '2025-04-29 13:56:12'),
(1562, 'entry', '2025-04-29 13:56:15'),
(1563, 'exit', '2025-04-29 13:56:16'),
(1564, 'entry', '2025-04-29 13:56:19'),
(1565, 'exit', '2025-04-29 13:56:26'),
(1566, 'exit', '2025-04-29 13:56:32'),
(1567, 'entry', '2025-04-29 13:56:34'),
(1568, 'exit', '2025-04-29 13:56:35'),
(1569, 'entry', '2025-04-29 13:56:37'),
(1570, 'exit', '2025-04-29 13:56:39'),
(1571, 'entry', '2025-04-29 13:56:40'),
(1572, 'exit', '2025-04-29 13:56:42'),
(1573, 'entry', '2025-04-29 13:56:44'),
(1574, 'exit', '2025-04-29 13:56:46'),
(1575, 'entry', '2025-04-29 13:56:48'),
(1576, 'exit', '2025-04-29 13:57:02'),
(1577, 'entry', '2025-04-29 13:57:05'),
(1578, 'exit', '2025-04-29 13:57:07'),
(1579, 'entry', '2025-04-29 13:57:09'),
(1580, 'exit', '2025-04-29 13:57:11'),
(1581, 'entry', '2025-04-29 13:57:13'),
(1582, 'exit', '2025-04-29 13:57:15'),
(1583, 'exit', '2025-04-29 14:10:18'),
(1584, 'entry', '2025-04-29 14:13:14'),
(1585, 'exit', '2025-04-29 14:14:20'),
(1586, 'entry', '2025-04-29 14:15:19'),
(1587, 'entry', '2025-04-29 14:15:35'),
(1588, 'entry', '2025-04-29 14:15:36'),
(1589, 'exit', '2025-04-29 14:15:44'),
(1590, 'exit', '2025-04-29 14:15:44'),
(1591, 'exit', '2025-04-29 14:15:44'),
(1592, 'entry', '2025-04-29 14:30:13'),
(1593, 'exit', '2025-04-29 14:30:15'),
(1594, 'entry', '2025-04-29 14:30:18'),
(1595, 'exit', '2025-04-29 14:30:19'),
(1596, 'exit', '2025-04-29 14:36:22'),
(1597, 'entry', '2025-04-29 14:36:24'),
(1598, 'exit', '2025-04-29 14:36:26'),
(1599, 'entry', '2025-04-29 14:36:28'),
(1600, 'exit', '2025-04-29 14:36:29'),
(1601, 'entry', '2025-04-29 14:36:31'),
(1602, 'exit', '2025-04-29 14:36:32'),
(1603, 'entry', '2025-04-29 14:36:33'),
(1604, 'exit', '2025-04-29 14:36:35'),
(1605, 'entry', '2025-04-29 14:36:36'),
(1606, 'exit', '2025-04-29 14:36:38'),
(1607, 'entry', '2025-04-29 14:36:39'),
(1608, 'exit', '2025-04-29 14:36:41'),
(1609, 'entry', '2025-04-29 14:36:42'),
(1610, 'exit', '2025-04-29 14:36:43'),
(1611, 'entry', '2025-04-29 14:36:45'),
(1612, 'exit', '2025-04-29 14:36:46'),
(1613, 'entry', '2025-04-29 14:36:50'),
(1614, 'exit', '2025-04-29 14:36:51'),
(1615, 'entry', '2025-04-29 14:36:53'),
(1616, 'exit', '2025-04-29 14:36:54'),
(1617, 'entry', '2025-04-29 14:36:56'),
(1618, 'exit', '2025-04-29 14:36:57'),
(1619, 'exit', '2025-04-29 14:36:59'),
(1620, 'entry', '2025-04-29 14:37:01'),
(1621, 'exit', '2025-04-29 14:37:07'),
(1622, 'exit', '2025-04-29 14:37:09'),
(1623, 'exit', '2025-04-29 14:37:11'),
(1624, 'entry', '2025-04-29 14:37:13'),
(1625, 'entry', '2025-04-29 14:37:14'),
(1626, 'entry', '2025-04-29 14:37:16'),
(1627, 'exit', '2025-04-29 14:37:17'),
(1628, 'entry', '2025-04-29 14:37:23'),
(1629, 'entry', '2025-04-29 14:37:26'),
(1630, 'entry', '2025-04-29 14:37:28'),
(1631, 'exit', '2025-04-29 14:37:30'),
(1632, 'exit', '2025-04-29 14:37:33'),
(1633, 'exit', '2025-04-29 14:37:34'),
(1634, 'exit', '2025-04-29 14:37:36'),
(1635, 'exit', '2025-04-29 14:37:38'),
(1636, 'entry', '2025-04-29 14:37:42'),
(1637, 'exit', '2025-04-29 14:37:43'),
(1638, 'entry', '2025-04-29 14:37:45'),
(1639, 'exit', '2025-04-29 14:37:46'),
(1640, 'entry', '2025-04-29 14:37:48'),
(1641, 'exit', '2025-04-29 14:37:50'),
(1642, 'entry', '2025-04-29 14:37:51'),
(1643, 'exit', '2025-04-29 14:37:53'),
(1644, 'entry', '2025-04-29 14:37:54'),
(1645, 'exit', '2025-04-29 14:38:10'),
(1646, 'entry', '2025-04-29 14:38:12'),
(1647, 'entry', '2025-04-29 14:38:19'),
(1648, 'exit', '2025-04-29 14:38:20'),
(1649, 'exit', '2025-04-29 14:38:23'),
(1650, 'exit', '2025-04-29 14:38:31'),
(1651, 'entry', '2025-04-29 14:38:32'),
(1652, 'entry', '2025-04-29 14:38:35'),
(1653, 'exit', '2025-04-29 14:38:36'),
(1654, 'entry', '2025-04-29 14:38:38'),
(1655, 'exit', '2025-04-29 14:38:47'),
(1656, 'entry', '2025-04-29 14:38:48'),
(1657, 'exit', '2025-04-29 14:38:54'),
(1658, 'exit', '2025-04-29 14:38:56'),
(1659, 'entry', '2025-04-29 14:38:58'),
(1660, 'exit', '2025-04-29 14:38:59'),
(1661, 'entry', '2025-04-29 14:39:01'),
(1662, 'exit', '2025-04-29 14:39:02'),
(1663, 'entry', '2025-04-29 14:39:04'),
(1664, 'exit', '2025-04-29 14:39:05'),
(1665, 'entry', '2025-04-29 14:39:07'),
(1666, 'exit', '2025-04-29 14:39:12'),
(1667, 'entry', '2025-04-29 14:39:14'),
(1668, 'exit', '2025-04-29 14:39:15'),
(1669, 'entry', '2025-04-29 14:39:17'),
(1670, 'entry', '2025-04-29 15:01:46'),
(1671, 'exit', '2025-04-29 15:01:51'),
(1672, 'entry', '2025-04-29 15:01:53'),
(1673, 'exit', '2025-04-29 15:01:54'),
(1674, 'exit', '2025-04-29 15:01:56');

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
(1, 0, 88, 96, '2025-04-29 15:01:56');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1675;

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
