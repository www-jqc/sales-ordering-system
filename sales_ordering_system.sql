-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2025 at 12:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sales_ordering_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `is_active`, `created_at`) VALUES
(1, 'dsadas', 'asdsad', 1, '2025-06-21 12:34:59'),
(2, 'ewqwqdsad', '', 1, '2025-06-21 12:42:49'),
(3, 'dasd', 'dasdasd', 1, '2025-06-22 10:59:19'),
(4, 'category1', '', 1, '2025-06-23 00:40:01'),
(5, 'dasd', 'dasd', 1, '2025-06-23 00:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_feedback`
--

CREATE TABLE `customer_feedback` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `position` varchar(50) NOT NULL,
  `hire_date` date NOT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `gender`, `position`, `hire_date`, `salary`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'asdasd', 'female', 'fsdfsd', '2025-06-21', 4343.00, 1, '2025-06-23 12:30:15', '2025-06-23 12:40:07'),
(2, 'dasd', 'male', 'dasdas', '2025-06-22', 43434.00, 1, '2025-06-23 12:30:33', '2025-06-23 12:40:02');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` enum('ORDER_READY','TABLE_STATUS','PAYMENT','DELIVERY','SYSTEM') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','COMPLETED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  `special_instructions` text DEFAULT NULL,
  `payment_method` enum('cash','gcash') DEFAULT 'cash',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `table_id`, `customer_id`, `customer_name`, `total_amount`, `status`, `special_instructions`, `payment_method`, `payment_status`, `notes`, `created_at`, `updated_at`, `paid_at`, `completed_at`, `delivered_at`) VALUES
(1, 14, NULL, 'Jsjdus', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 01:28:40', '2025-06-22 03:58:31', NULL, NULL, NULL),
(2, 14, NULL, 'Jian bayot ', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 01:29:39', '2025-06-22 03:58:27', NULL, NULL, NULL),
(3, 14, NULL, 'Tyy', 3423.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 02:46:02', '2025-06-22 03:58:29', NULL, NULL, NULL),
(4, 14, NULL, 'Gyy', 232.00, 'CANCELLED', NULL, 'cash', 'unpaid', NULL, '2025-06-22 02:49:02', '2025-06-22 03:25:16', NULL, NULL, NULL),
(5, 14, NULL, 'Jsjs', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:01:34', '2025-06-22 03:58:27', NULL, NULL, NULL),
(6, 14, NULL, 'Dydyd', 3655.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:02:28', '2025-06-22 03:26:42', NULL, NULL, NULL),
(7, 14, NULL, 'Fycyc', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:14:25', '2025-06-22 03:24:06', NULL, NULL, NULL),
(8, 14, NULL, 'Vugv', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:16:03', '2025-06-22 03:26:38', NULL, NULL, NULL),
(9, 14, NULL, 'Ufufu', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:19:33', '2025-06-22 03:26:24', NULL, NULL, NULL),
(10, 14, NULL, 'Jeje', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:22:05', '2025-06-22 03:24:32', NULL, NULL, NULL),
(11, 14, NULL, 'jhfghfg', 464.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:29:44', '2025-06-22 03:30:03', NULL, NULL, NULL),
(12, 14, NULL, 'fdsfsd', 3655.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:31:24', '2025-06-22 03:32:01', NULL, NULL, NULL),
(13, 14, NULL, 'dfhgdgfd', 3423.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:31:41', '2025-06-22 03:31:58', NULL, NULL, NULL),
(14, 14, NULL, 'dasdasd', 3655.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:32:14', '2025-06-22 03:33:28', NULL, NULL, NULL),
(15, 14, NULL, 'dsfsdfs', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:34:24', '2025-06-22 04:00:14', NULL, NULL, NULL),
(16, 14, NULL, 'dasdas', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:45:53', '2025-06-22 04:00:15', NULL, NULL, NULL),
(17, 14, NULL, 'gdfsgf', 3655.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:47:40', '2025-06-22 04:00:12', NULL, NULL, NULL),
(18, 14, NULL, 'fasdfas', 3423.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:48:48', '2025-06-22 04:00:16', NULL, NULL, NULL),
(19, 14, NULL, 'Hzjs', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:50:48', '2025-06-22 04:00:05', NULL, NULL, NULL),
(20, 14, NULL, 'bjbmnbnbnbnbn', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:53:46', '2025-06-22 03:59:45', NULL, NULL, NULL),
(21, 14, NULL, 'bjhgjgjjh', 464.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 03:59:08', '2025-06-22 03:59:36', NULL, NULL, NULL),
(22, 14, NULL, 'Jsjsjs', 232.00, '', NULL, 'cash', 'unpaid', NULL, '2025-06-22 09:16:06', '2025-06-22 09:16:46', NULL, NULL, NULL),
(23, 16, NULL, 'Hsjsjs', 464.00, 'CANCELLED', '', 'cash', 'paid', NULL, '2025-06-22 11:32:54', '2025-06-22 12:04:16', '2025-06-22 12:02:33', NULL, NULL),
(24, 16, NULL, 'Jsjsjjs', 464.00, 'CANCELLED', '', 'cash', 'paid', NULL, '2025-06-22 11:34:51', '2025-06-22 11:55:33', '2025-06-22 11:49:13', '2025-06-22 11:55:26', NULL),
(25, 16, NULL, 'Jsjs', 232.00, 'CANCELLED', '', 'cash', 'paid', NULL, '2025-06-22 11:41:44', '2025-06-22 11:55:30', '2025-06-22 11:46:51', '2025-06-22 11:55:23', NULL),
(26, 16, NULL, 'Hehdhdh', 22162.00, 'CANCELLED', '', 'cash', 'paid', NULL, '2025-06-22 11:50:40', '2025-06-22 11:55:32', '2025-06-22 11:52:20', '2025-06-22 11:55:20', NULL),
(27, 1, NULL, 'ewfsdf', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-22 11:53:06', '2025-06-22 12:21:43', '2025-06-22 12:02:55', '2025-06-22 12:03:33', '2025-06-22 12:21:43'),
(28, 16, NULL, 'Ninsmis', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-22 11:56:02', '2025-06-22 12:21:43', '2025-06-22 11:58:55', '2025-06-22 11:59:10', '2025-06-22 12:21:43'),
(29, 16, NULL, 'Jsjsjs', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-22 12:03:45', '2025-06-22 12:21:40', '2025-06-22 12:03:51', '2025-06-22 12:08:47', '2025-06-22 12:21:40'),
(30, 16, NULL, 'Isisis', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-22 12:11:23', '2025-06-23 02:39:06', '2025-06-22 12:11:37', '2025-06-23 02:11:36', '2025-06-23 02:39:06'),
(31, 1, NULL, 'gfdgfd', 3423.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-22 12:26:25', '2025-06-23 02:39:05', '2025-06-23 02:19:18', '2025-06-23 02:19:55', '2025-06-23 02:39:05'),
(32, 1, NULL, 'Cgt', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 02:00:37', '2025-06-23 02:39:01', '2025-06-23 02:18:59', '2025-06-23 02:20:41', '2025-06-23 02:39:01'),
(33, 1, NULL, 'Vg', 232.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 02:00:53', '2025-06-23 02:39:09', '2025-06-23 02:04:03', '2025-06-23 02:09:35', '2025-06-23 02:39:09'),
(34, 1, NULL, 'dasd', 3434.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 02:22:57', '2025-06-23 02:39:08', '2025-06-23 02:23:27', '2025-06-23 02:23:54', '2025-06-23 02:39:08'),
(35, 1, NULL, 'dsaedasdsa', 3434.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 03:16:27', '2025-06-23 09:58:08', '2025-06-23 03:16:38', '2025-06-23 03:16:48', '2025-06-23 09:58:08'),
(36, 1, NULL, 'dasdsadas', 3434.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 03:34:32', '2025-06-23 09:58:14', '2025-06-23 03:35:05', '2025-06-23 03:35:11', '2025-06-23 09:58:14'),
(37, 1, NULL, 'dsadasd', 7321.00, 'DELIVERED', '', 'cash', 'paid', NULL, '2025-06-23 03:39:53', '2025-06-23 09:58:18', '2025-06-23 03:40:02', '2025-06-23 03:41:31', '2025-06-23 09:58:18'),
(38, 11, NULL, 'Tgt', 232.00, 'PENDING', '', 'cash', 'unpaid', NULL, '2025-06-23 03:53:59', '2025-06-23 03:53:59', NULL, NULL, NULL),
(39, 1, NULL, 'dasdas', 232.00, 'PENDING', '', 'cash', 'unpaid', NULL, '2025-06-23 04:15:41', '2025-06-23 04:15:41', NULL, NULL, NULL),
(40, 1, NULL, 'das', 3434.00, 'PENDING', '', 'cash', 'unpaid', NULL, '2025-06-24 10:09:15', '2025-06-24 10:09:15', NULL, NULL, NULL),
(41, 1, NULL, 'fsdfsdf', 3434.00, 'PENDING', '', 'cash', 'unpaid', NULL, '2025-06-24 10:11:44', '2025-06-24 10:11:44', NULL, NULL, NULL),
(42, 1, NULL, 'das', 3434.00, 'PENDING', '', 'cash', 'unpaid', NULL, '2025-06-24 10:14:25', '2025-06-24 10:14:25', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `quantity`, `unit_price`, `subtotal`, `notes`, `created_at`) VALUES
(1, 1, 3, 1, 232.00, 232.00, NULL, '2025-06-22 01:28:40'),
(2, 2, 3, 1, 232.00, 232.00, NULL, '2025-06-22 01:29:39'),
(3, 3, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 02:46:02'),
(4, 4, 2, 1, 232.00, 232.00, NULL, '2025-06-22 02:49:02'),
(5, 5, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:01:34'),
(6, 6, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:02:28'),
(7, 6, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:02:28'),
(8, 7, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:14:25'),
(9, 8, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:16:03'),
(10, 9, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:19:33'),
(11, 10, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:22:05'),
(12, 11, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:29:44'),
(13, 11, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:29:44'),
(14, 12, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:31:24'),
(15, 12, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:31:24'),
(16, 13, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:31:41'),
(17, 14, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:32:14'),
(18, 14, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:32:14'),
(19, 15, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:34:24'),
(20, 16, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:45:53'),
(21, 17, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:47:40'),
(22, 17, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:47:40'),
(23, 18, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 03:48:48'),
(24, 19, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:50:48'),
(25, 20, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:53:46'),
(26, 21, 3, 1, 232.00, 232.00, NULL, '2025-06-22 03:59:08'),
(27, 21, 2, 1, 232.00, 232.00, NULL, '2025-06-22 03:59:08'),
(28, 22, 3, 1, 232.00, 232.00, NULL, '2025-06-22 09:16:06'),
(29, 23, 3, 1, 232.00, 232.00, NULL, '2025-06-22 11:32:54'),
(30, 23, 2, 1, 232.00, 232.00, NULL, '2025-06-22 11:32:54'),
(31, 24, 3, 1, 232.00, 232.00, NULL, '2025-06-22 11:34:51'),
(32, 24, 2, 1, 232.00, 232.00, NULL, '2025-06-22 11:34:51'),
(33, 25, 3, 1, 232.00, 232.00, NULL, '2025-06-22 11:41:44'),
(34, 26, 3, 2, 232.00, 464.00, NULL, '2025-06-22 11:50:40'),
(35, 26, 1, 6, 3423.00, 20538.00, NULL, '2025-06-22 11:50:40'),
(36, 26, 2, 5, 232.00, 1160.00, NULL, '2025-06-22 11:50:40'),
(37, 27, 3, 1, 232.00, 232.00, NULL, '2025-06-22 11:53:06'),
(38, 28, 3, 1, 232.00, 232.00, NULL, '2025-06-22 11:56:02'),
(39, 29, 3, 1, 232.00, 232.00, NULL, '2025-06-22 12:03:45'),
(40, 30, 2, 1, 232.00, 232.00, NULL, '2025-06-22 12:11:23'),
(41, 31, 1, 1, 3423.00, 3423.00, NULL, '2025-06-22 12:26:25'),
(42, 32, 3, 1, 232.00, 232.00, NULL, '2025-06-23 02:00:37'),
(43, 33, 3, 1, 232.00, 232.00, NULL, '2025-06-23 02:00:53'),
(44, 34, 5, 1, 3434.00, 3434.00, NULL, '2025-06-23 02:22:57'),
(45, 35, 5, 1, 3434.00, 3434.00, NULL, '2025-06-23 03:16:27'),
(46, 36, 5, 1, 3434.00, 3434.00, NULL, '2025-06-23 03:34:32'),
(47, 37, 5, 1, 3434.00, 3434.00, NULL, '2025-06-23 03:39:53'),
(48, 37, 3, 1, 232.00, 232.00, NULL, '2025-06-23 03:39:53'),
(49, 37, 2, 1, 232.00, 232.00, NULL, '2025-06-23 03:39:53'),
(50, 37, 1, 1, 3423.00, 3423.00, NULL, '2025-06-23 03:39:53'),
(51, 38, 3, 1, 232.00, 232.00, NULL, '2025-06-23 03:53:59'),
(52, 39, 3, 1, 232.00, 232.00, NULL, '2025-06-23 04:15:41'),
(53, 40, 5, 1, 3434.00, 3434.00, NULL, '2025-06-24 10:09:15'),
(54, 41, 5, 1, 3434.00, 3434.00, NULL, '2025-06-24 10:11:44'),
(55, 42, 5, 1, 3434.00, 3434.00, NULL, '2025-06-24 10:14:25');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `image_url`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 'john', 'dsadas', 3423.00, 1, '/uploads/1750643108011-5bdeb046-f836-4857-b5a5-cec383bd7c6e.jpg', 1, '2025-06-21 12:35:05', '2025-06-23 02:00:06'),
(2, 'dsa', 'dsa', 232.00, 1, '/uploads/1750643098727-mocha.jpg', 1, '2025-06-21 12:43:11', '2025-06-23 02:00:05'),
(3, 'dasd', 'dsadas', 232.00, 1, '/uploads/1750643079276-a7421990-9229-4e55-ba0b-e52e706e7c16.jpg', 1, '2025-06-21 13:29:35', '2025-06-23 03:49:13'),
(5, 'dasd', 'dasdas', 3434.00, 4, '/uploads/1750641516029-0ba067c0-dbbb-473b-b0b7-3da9bc714343.jpg', 1, '2025-06-23 01:18:37', '2025-06-24 10:14:46');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('CASH','CARD','DIGITAL_WALLET') NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `change_amount` decimal(10,2) DEFAULT 0.00,
  `cashier_id` int(11) DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `order_id`, `payment_method`, `amount_paid`, `change_amount`, `cashier_id`, `transaction_date`, `created_at`) VALUES
(1, 25, 'CASH', 3245343.00, 3245111.00, 2, '2025-06-22 11:46:51', '2025-06-22 11:46:51'),
(2, 24, 'CASH', 34343.00, 33879.00, 2, '2025-06-22 11:49:13', '2025-06-22 11:49:13'),
(3, 26, 'CASH', 323232.00, 301070.00, 2, '2025-06-22 11:52:20', '2025-06-22 11:52:20'),
(4, 28, 'CASH', 32233.00, 32001.00, 2, '2025-06-22 11:58:55', '2025-06-22 11:58:55'),
(5, 23, 'CASH', 343434.00, 342970.00, 2, '2025-06-22 12:02:33', '2025-06-22 12:02:33'),
(6, 27, 'CASH', 34343.00, 34111.00, 2, '2025-06-22 12:02:55', '2025-06-22 12:02:55'),
(7, 29, 'CASH', 3434.00, 3202.00, 2, '2025-06-22 12:03:51', '2025-06-22 12:03:51'),
(8, 30, 'CASH', 34324.00, 34092.00, 2, '2025-06-22 12:11:37', '2025-06-22 12:11:37'),
(9, 33, 'CASH', 85555.00, 85323.00, 2, '2025-06-23 02:04:03', '2025-06-23 02:04:03'),
(10, 32, 'CASH', 343.00, 111.00, 2, '2025-06-23 02:18:59', '2025-06-23 02:18:59'),
(11, 31, 'CASH', 34343.00, 30920.00, 2, '2025-06-23 02:19:18', '2025-06-23 02:19:18'),
(12, 34, 'CASH', 343434.00, 340000.00, 2, '2025-06-23 02:23:15', '2025-06-23 02:23:15'),
(13, 34, 'CASH', 434343.00, 430909.00, 2, '2025-06-23 02:23:23', '2025-06-23 02:23:23'),
(14, 34, 'CASH', 4343434.00, 4340000.00, 2, '2025-06-23 02:23:27', '2025-06-23 02:23:27'),
(15, 35, 'CASH', 3434.00, 0.00, 2, '2025-06-23 03:16:38', '2025-06-23 03:16:38'),
(16, 36, 'CASH', 32432432.00, 32428998.00, 2, '2025-06-23 03:35:05', '2025-06-23 03:35:05'),
(17, 37, 'CASH', 34343.00, 27022.00, 2, '2025-06-23 03:40:02', '2025-06-23 03:40:02');

-- --------------------------------------------------------

--
-- Table structure for table `shift_schedules`
--

CREATE TABLE `shift_schedules` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_shifts`
--

CREATE TABLE `staff_shifts` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `shift_schedule_id` int(11) NOT NULL,
  `work_date` date NOT NULL,
  `clock_in` timestamp NULL DEFAULT NULL,
  `clock_out` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `table_number` int(11) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 4,
  `status` enum('available','occupied','empty') DEFAULT 'available',
  `current_order_id` int(11) DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `table_number`, `capacity`, `status`, `current_order_id`, `qr_code`, `created_at`, `updated_at`) VALUES
(1, 1, 423, 'occupied', NULL, 'data:image/png;base64,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', '2025-06-21 12:39:33', '2025-06-23 10:20:33'),
(11, 2, 4, 'occupied', NULL, 'data:image/png;base64,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', '2025-06-22 00:12:34', '2025-06-23 03:53:59'),
(12, 16, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-22 00:18:42', '2025-06-22 00:23:05'),
(13, 3, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-22 00:34:29', '2025-06-22 00:34:52'),
(14, 19, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-22 01:03:04', '2025-06-22 01:03:08'),
(15, 123, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-22 10:09:18', '2025-06-23 10:18:30'),
(16, 232, 4, 'occupied', NULL, 'data:image/png;base64,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', '2025-06-22 10:28:50', '2025-06-23 10:18:32'),
(17, 4343, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-22 10:35:54', '2025-06-23 10:10:45'),
(18, 3232, 4, 'available', NULL, 'data:image/png;base64,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', '2025-06-23 10:06:09', '2025-06-23 10:06:09'),
(19, 323, 4, 'available', NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAAklEQVR4AewaftIAAAgASURBVO3BwXEkgQ0EwWrE+u9yiw5I4GM0sThWZvoDSTpgkKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTriw4OS8Fe15S9LwqYtT0jCpi3fJgl/VVueMEjSEYMkHTFI0hGDJB0xSNIRgyQdMUjSEYMkHfHhZW25JglPSMJvtGWThG/Slre05QlJeEpbntCWa5LwlkGSjhgk6YhBko4YJOmIQZKOGCTpiEGSjhgk6YgPXygJb2nLW9rylLY8IQmbtjwhCZu2vKUtv5GEb5KEt7TlmwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUd80NdJwqYtb0nCpi2btmyS8G3aou8wSNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRgyQd8UGvScK3acsmCde05SlJ2LRF/3+DJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRH75QW/5FbfmNJGySsGnLJgmbtmyScE0SLmrLXzVI0hGDJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB3x4WVJ+KuS8Btt2SThmrZskrBpyyYJm7b8RhLekgT9d4MkHTFI0hGDJB0xSNIRgyQdMUjSEYMkHTFI0hHpD/RVkrBpyzVJ2LRlk4Rv0xb9/w2SdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUd8eFASNm3ZJGHTlk0SNm3ZJGHTFv1vbdkkYdOWJyThoiRs2vKEJGza8pZBko4YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmIQZKO+PCgtmySsGnLN2nLJglPacs3ScKmLZskvCUJm7Y8JQlPaMumLZskbNqyacsmCZu2PGGQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSToi/cFDkrBpy1uS8Je1ZZOETVs2SdD/1pZNEp7Qlk0S3tKWJwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMQgSUd8eFkSNm3ZJGHTlk0SNm3ZJOEpbXlCEjZt2SThCW3ZJGHTlk0SntKWTRI2SXhCWzZJ2LRlk4RNW94ySNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRgyQd8eELJWHTlk0SNm3ZJOHbJOEJSdi0ZZOETRI2bXlLW34jCU9oyyYJmyRs2vKWJGza8oRBko4YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmIDy9ryyYJmyS8pS2bJGza8htJ2LTlCUn4q5LwG23ZJOGbJGHTlk1bNkl4yyBJRwySdMQgSUcMknTEIElHDJJ0xCBJRwySdMSHo9ryhCS8JQnfpi2bJGza8k3a8pQkPCEJb2nLJgnXDJJ0xCBJRwySdMQgSUcMknTEIElHDJJ0xCBJR3x4UFs2SXhLEp7Qlick4SlJ2LRlk4RNW56QhE1bNkl4U1uekIQntGWThLe05S2DJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRH75QW57QlickYdOWp7Rlk4QntOUtbdkkYdOWNyXhCW3ZJOEtbdkkYZOETVueMEjSEYMkHTFI0hGDJB0xSNIRgyQdMUjSEYMkHfHhZW15QhI2bXlCW57Qlt9IwluS8IS2bJLwTZLwG235JknYtOUJbdkk4S2DJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRHx6UhE1bntCWtyRh05ZNEt6UhE1bnpCEtyThCW25qC2bJGzasknCNxkk6YhBko4YJOmIQZKOGCTpiEGSjhgk6YhBko5If/CiJGza8oQkbNrybZKwacsmCd+kLZskbNqyScKmLb+RhE1b3pKETVs2SXhCW94ySNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRgyQdMUjSEekPHpKETVs2SXhCW56QhE1bNkn4jbZskrBpyyYJm7ZskvCWtjwhCf+qtvyLBkk6YpCkIwZJOmKQpCMGSTpikKQjBkk6YpCkIz48qC1PaMs3acu/qi3fpC2bJGzasmnLbyRh05a3JOEtSXhCW54wSNIRgyQdMUjSEYMkHTFI0hGDJB0xSNIRgyQd8eFBSfir2rJpy7dJwhPa8oQkbNryhCS8KQmbtjwhCZu2XDNI0hGDJB0xSNIRgyQdMUjSEYMkHTFI0hGDJB3x4WVtuSYJ36YtmyRs2vKWJGzasknCpi3fpi1vacsmCU9oy1sGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjPnyhJLylLW9Jwpva8k3asknCpi2bJLwpCd8kCZu2bJKwScKmLU8YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmIQZKO+KDXtOU3krBpyxOS8IS2bJLwhCRs2vKUJDyhLW9Jwlva8pZBko4YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmID3pNEp6ShLe05ZokPKUtT0jCW9ryhLZskrBpyxMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSTpikKQjPnyhtvyL2nJREjZteUJbNkl4Qlt+IwmbtmzasknCE5KwacsmCZu2vGWQpCMGSTpikKQjBkk6YpCkIwZJOmKQpCMGSToi/cFDkvBXtWWThKe05ZskYdOWf1USvklbNkl4S1ueMEjSEYMkHTFI0hGDJB0xSNIRgyQdMUjSEYMkHZH+QJIOGCTpiEGSjhgk6YhBko4YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmIQZKOGCTpiEGSjhgk6YhBko4YJOmI/wAhSWpsZs3SzgAAAABJRU5ErkJggg==', '2025-06-23 10:10:43', '2025-06-23 10:10:43');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier','kitchen','waiter') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `is_active`, `name`, `email`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$cdUllGslD2.bBZAeHX02feapfJ4fh5oy2lNH39gvRmWu7BI1TAcxO', 'admin', 1, 'Admin User', 'admin@restaurant.com', '2025-06-22 10:45:27', '2025-06-22 11:19:13'),
(2, 'cashier', '$2a$10$qgNRGJ0Ze8q.Jk/G3bJ.6.ANsDzmK5IgxALofc3EkA5OBRmmuzCnK', 'cashier', 1, 'Cashier Staff', 'cashier@restaurant.com', '2025-06-22 11:06:51', '2025-06-22 11:19:13'),
(3, 'kitchen', '$2a$10$xM6E0ynyT7R8ZlCkn4i3peBrywuovH6lpGIAHfl5JrlMmNCWR7Jyu', 'kitchen', 1, 'Kitchen Staff', 'kitchen@restaurant.com', '2025-06-22 11:06:51', '2025-06-22 11:19:13'),
(4, 'waiter', '$2a$10$mnOc32HC3kSkiGQ/ZxJ6P.fXMe/Pb/7vocTHzMV.gTrdaBhBuzZqO', 'waiter', 1, 'Waiter Staff', 'waiter@restaurant.com', '2025-06-22 11:06:51', '2025-06-22 11:19:13'),
(5, 'john', '$2a$10$qzpCS5/VMw7tiMHsahtxOeOqONwAcAS8EJ7Pcq.oCBJFSMnk/PLnG', 'cashier', 1, 'john', 'john@gmail.com', '2025-06-23 10:49:31', '2025-06-23 11:56:37'),
(6, 'clemenz', '$2a$10$PlLnWOtIDNb4WJuMilBm5.z6lx2rzJzDt8ne1l3lJsLho.Xfc7Q5m', 'admin', 1, 'clemens', 'clemenz@gmail.com', '2025-06-23 12:37:01', '2025-06-23 12:37:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `cashier_id` (`cashier_id`);

--
-- Indexes for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_shifts`
--
ALTER TABLE `staff_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `shift_schedule_id` (`shift_schedule_id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `table_number` (`table_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_shifts`
--
ALTER TABLE `staff_shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  ADD CONSTRAINT `customer_feedback_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_shifts`
--
ALTER TABLE `staff_shifts`
  ADD CONSTRAINT `staff_shifts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_shifts_ibfk_2` FOREIGN KEY (`shift_schedule_id`) REFERENCES `shift_schedules` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
