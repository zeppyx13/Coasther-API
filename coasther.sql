-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 24 Jan 2026 pada 22.36
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `coasther`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `body` text NOT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `body`, `start_at`, `end_at`, `is_active`, `created_at`) VALUES
(1, 'Pembersihan Rutin', 'Akan dilakukan pembersihan area kost hari Minggu.', NULL, NULL, 1, '2026-01-19 17:14:51');

-- --------------------------------------------------------

--
-- Struktur dari tabel `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `complaints`
--

INSERT INTO `complaints` (`id`, `user_id`, `room_id`, `title`, `description`, `status`, `created_at`, `closed_at`) VALUES
(1, 1, 1, 'Lampu kamar redup', 'Lampu kamar sering mati sendiri', 'open', '2026-01-19 17:15:02', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `facilities`
--

CREATE TABLE `facilities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `facilities`
--

INSERT INTO `facilities` (`id`, `name`) VALUES
(1, 'AC'),
(9, 'Akses Fingerprint'),
(6, 'CCTV'),
(8, 'Fully Furnished'),
(4, 'Kamar Mandi Dalam'),
(3, 'Meja Belajar'),
(5, 'Parkiran'),
(0, 'Parkiran Luas'),
(2, 'WiFi');

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lease_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `month` char(7) NOT NULL,
  `due_date` date NOT NULL,
  `rent_amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `water_used` decimal(12,3) NOT NULL DEFAULT 0.000,
  `water_cost` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `elec_used` decimal(12,3) NOT NULL DEFAULT 0.000,
  `elec_cost` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fine_amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `total_amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('unpaid','paid','overdue','cancelled') NOT NULL DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `invoices`
--

INSERT INTO `invoices` (`id`, `lease_id`, `room_id`, `user_id`, `month`, `due_date`, `rent_amount`, `water_used`, `water_cost`, `elec_used`, `elec_cost`, `fine_amount`, `discount_percent`, `discount_amount`, `total_amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-01', '2026-02-05', 1200000, 25.500, 30250, 70.200, 34320, 0, 0.00, 0, 1264570, 'unpaid', '2026-01-19 17:14:06', '2026-01-20 05:18:03');

-- --------------------------------------------------------

--
-- Struktur dari tabel `leases`
--

CREATE TABLE `leases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','ended') NOT NULL DEFAULT 'active',
  `monthly_rent_snapshot` int(10) UNSIGNED NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `leases`
--

INSERT INTO `leases` (`id`, `user_id`, `room_id`, `start_date`, `end_date`, `status`, `monthly_rent_snapshot`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-01-01', NULL, 'active', 1200000, NULL, '2026-01-19 17:13:12', NULL),
(2, 2, 10, '2026-01-01', NULL, 'active', 1200000, NULL, '2026-01-19 17:13:12', '2026-01-23 20:40:40');

-- --------------------------------------------------------

--
-- Struktur dari tabel `meters`
--

CREATE TABLE `meters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('water','electricity') NOT NULL,
  `device_uid` varchar(120) NOT NULL,
  `unit` enum('m3','kwh') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `installed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `meters`
--

INSERT INTO `meters` (`id`, `room_id`, `type`, `device_uid`, `unit`, `is_active`, `installed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'water', 'WTR-A01', 'm3', 1, '2026-01-01 00:00:00', '2026-01-19 17:13:28', NULL),
(2, 1, 'electricity', 'ELC-A01', 'kwh', 1, '2026-01-01 00:00:00', '2026-01-19 17:13:28', NULL),
(3, 2, 'water', 'WTR-A02', 'm3', 1, '2026-01-01 00:00:00', '2026-01-19 17:13:28', NULL),
(4, 2, 'electricity', 'ELC-A02', 'kwh', 1, '2026-01-01 00:00:00', '2026-01-19 17:13:28', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `meter_readings`
--

CREATE TABLE `meter_readings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meter_id` bigint(20) UNSIGNED NOT NULL,
  `reading_value` decimal(12,3) NOT NULL,
  `recorded_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `meter_readings`
--

INSERT INTO `meter_readings` (`id`, `meter_id`, `reading_value`, `recorded_at`, `created_at`) VALUES
(1, 1, 100.000, '2026-01-01 00:00:00', '2026-01-19 17:13:38'),
(2, 1, 125.500, '2026-01-31 23:59:00', '2026-01-19 17:13:38'),
(3, 2, 200.000, '2026-01-01 00:00:00', '2026-01-19 17:13:38'),
(4, 2, 270.200, '2026-01-31 23:59:00', '2026-01-19 17:13:38'),
(5, 3, 50.000, '2026-01-01 00:00:00', '2026-01-19 17:13:38'),
(6, 3, 60.000, '2026-01-31 23:59:00', '2026-01-19 17:13:38'),
(7, 4, 80.000, '2026-01-01 00:00:00', '2026-01-19 17:13:38'),
(8, 4, 95.000, '2026-01-31 23:59:00', '2026-01-19 17:13:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `method` enum('midtrans','manual') NOT NULL,
  `provider` varchar(40) DEFAULT NULL,
  `provider_order_id` varchar(100) DEFAULT NULL,
  `provider_transaction_id` varchar(120) DEFAULT NULL,
  `status` enum('pending','paid','failed','expired','cancelled') NOT NULL DEFAULT 'pending',
  `amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `paid_at` datetime DEFAULT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `payments`
--

INSERT INTO `payments` (`id`, `invoice_id`, `method`, `provider`, `provider_order_id`, `provider_transaction_id`, `status`, `amount`, `paid_at`, `metadata_json`, `created_at`, `updated_at`) VALUES
(1, 1, 'midtrans', 'midtrans', 'ORDER-INV-1-202601', 'TX-123456789', 'paid', 1264590, NULL, NULL, '2026-01-19 17:14:15', NULL),
(2, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769115627441', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"c7d03c7a-fe65-46dc-81a8-e732cf9bad95\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/c7d03c7a-fe65-46dc-81a8-e732cf9bad95\"}', '2026-01-22 21:00:27', '2026-01-22 21:00:27'),
(3, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769115977735', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"5e8c2412-12c2-4cbf-97f3-c1f893215b15\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/5e8c2412-12c2-4cbf-97f3-c1f893215b15\"}', '2026-01-22 21:06:17', '2026-01-22 21:06:18'),
(4, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769115997925', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"b91eaba6-1e14-4f7d-abc4-f35a182b7973\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/b91eaba6-1e14-4f7d-abc4-f35a182b7973\"}', '2026-01-22 21:06:37', '2026-01-22 21:06:38'),
(5, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769116048348', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"c712e72a-c056-4315-97cf-a1b8605e962e\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/c712e72a-c056-4315-97cf-a1b8605e962e\"}', '2026-01-22 21:07:28', '2026-01-22 21:07:28'),
(6, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769116132343', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"c6114365-5601-499b-9295-e9064b081785\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/c6114365-5601-499b-9295-e9064b081785\"}', '2026-01-22 21:08:52', '2026-01-22 21:08:52'),
(7, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769116207961', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"bf182cd0-9b8c-41ec-9de1-57fd12e7d93c\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/bf182cd0-9b8c-41ec-9de1-57fd12e7d93c\"}', '2026-01-22 21:10:07', '2026-01-22 21:10:08'),
(8, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769116473465', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"cf69d608-c5d9-48ab-ab49-34fcbcf07c37\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/cf69d608-c5d9-48ab-ab49-34fcbcf07c37\"}', '2026-01-22 21:14:33', '2026-01-22 21:14:33'),
(9, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769288703326', NULL, 'failed', 1264570, NULL, '{\"error\":\"Midtrans API request failed. HTTP response not found, likely connection failure, with message: \\\"getaddrinfo ENOTFOUND app.sandbox.midtrans.com\\\"\"}', '2026-01-24 21:05:03', '2026-01-24 21:05:14'),
(10, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769288720779', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"fd8eaf17-8139-41dc-add9-05b1846bee01\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/fd8eaf17-8139-41dc-add9-05b1846bee01\"}', '2026-01-24 21:05:20', '2026-01-24 21:05:21'),
(11, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769288772771', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"82ab3403-6ef6-42d3-95ae-68f416323fde\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/82ab3403-6ef6-42d3-95ae-68f416323fde\"}', '2026-01-24 21:06:12', '2026-01-24 21:06:12'),
(12, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769288837903', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"51b6777f-08ce-4a53-81d4-a5be77e64736\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/51b6777f-08ce-4a53-81d4-a5be77e64736\"}', '2026-01-24 21:07:17', '2026-01-24 21:07:18'),
(13, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769288916330', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"59e971b7-b17a-4844-ae34-44c15f36cdaf\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/59e971b7-b17a-4844-ae34-44c15f36cdaf\"}', '2026-01-24 21:08:36', '2026-01-24 21:08:36'),
(14, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769289358355', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"4dc33be7-b3eb-488d-bb88-0e064f422b2d\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/4dc33be7-b3eb-488d-bb88-0e064f422b2d\"}', '2026-01-24 21:15:58', '2026-01-24 21:15:58'),
(15, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769289853629', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"f9a5bf33-9c42-4cfc-a390-3e29cc24ba18\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/f9a5bf33-9c42-4cfc-a390-3e29cc24ba18\"}', '2026-01-24 21:24:13', '2026-01-24 21:24:13'),
(16, 1, 'midtrans', 'midtrans', 'INV-1-2026-01-1769290326473', NULL, 'pending', 1264570, NULL, '{\"snap_token\":\"7faa1144-05d1-4f4e-8590-6c4514f5dfb9\",\"redirect_url\":\"https://app.sandbox.midtrans.com/snap/v4/redirection/7faa1144-05d1-4f4e-8590-6c4514f5dfb9\"}', '2026-01-24 21:32:06', '2026-01-24 21:32:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment_events`
--

CREATE TABLE `payment_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(60) NOT NULL,
  `payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload_json`)),
  `received_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `payment_events`
--

INSERT INTO `payment_events` (`id`, `payment_id`, `event_type`, `payload_json`, `received_at`) VALUES
(1, 1, 'midtrans_notification', '{\"transaction_status\":\"settlement\",\"order_id\":\"ORDER-INV-1-202601\"}', '2026-01-20 01:14:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lease_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `reviews`
--

INSERT INTO `reviews` (`id`, `room_id`, `user_id`, `lease_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 1, 1, 5, 'Kamar nyaman, air dan listrik lancar', '2026-01-19 17:14:40'),
(56, 1, 1, 1, 5, 'Kamar nyaman, lokasi dekat kampus dan fasilitas lengkap.', '2026-01-23 20:40:57'),
(57, 1, 2, 2, 4, 'Fasilitas sesuai deskripsi, harga terjangkau.', '2026-01-23 20:40:57'),
(58, 1, 1, 2, 4, 'Kamarnya bersih tapi sedikit lembap di pagi hari.', '2026-01-23 20:40:57'),
(59, 2, 2, 1, 4, 'Pengelola ramah, area bersih, suasana tenang.', '2026-01-23 20:40:57'),
(60, 2, 1, 2, 3, 'Kamar cukup luas, cuma WiFi kadang lemot.', '2026-01-23 20:40:57'),
(61, 2, 2, 2, 4, 'Harga sesuai kualitas, lingkungan sekitar aman.', '2026-01-23 20:40:57'),
(62, 3, 1, 1, 5, 'Kamar rapi dan nyaman, AC dingin.', '2026-01-23 20:40:57'),
(63, 3, 2, 2, 3, 'Kebersihan oke, tapi kamar mandi agak sempit.', '2026-01-23 20:40:57'),
(64, 4, 1, 2, 4, 'Tempatnya tenang, cocok untuk mahasiswa.', '2026-01-23 20:40:57'),
(65, 4, 2, 1, 3, 'Dinding sedikit tipis, suara dari kamar sebelah terdengar.', '2026-01-23 20:40:57'),
(66, 4, 1, 1, 4, 'Harga murah, fasilitas standar tapi memadai.', '2026-01-23 20:40:57'),
(67, 5, 2, 2, 5, 'Kamarnya cantik dan wangi, sangat nyaman.', '2026-01-23 20:40:57'),
(68, 5, 1, 1, 3, 'Tempat parkir agak sempit, sisanya oke.', '2026-01-23 20:40:57'),
(69, 5, 2, 1, 4, 'Fasilitas lengkap dan sesuai deskripsi.', '2026-01-23 20:40:57'),
(70, 6, 1, 2, 5, 'Kamar bersih, cocok untuk kerja dan belajar.', '2026-01-23 20:40:57'),
(71, 6, 2, 1, 4, 'Lampu agak redup, tapi suasananya nyaman.', '2026-01-23 20:40:57'),
(72, 7, 1, 1, 3, 'Harga terjangkau tapi kamar perlu perbaikan kecil.', '2026-01-23 20:40:57'),
(73, 7, 2, 2, 4, 'AC kurang dingin, tapi pengelola cepat tanggap.', '2026-01-23 20:40:57'),
(74, 7, 1, 2, 4, 'Lumayan untuk jangka pendek, lokasi strategis.', '2026-01-23 20:40:57'),
(75, 8, 2, 1, 5, 'Kamar sangat bersih, suasana tenang.', '2026-01-23 20:40:57'),
(76, 8, 1, 2, 3, 'Tempat tidur nyaman, cuma sinyal agak jelek di dalam kamar.', '2026-01-23 20:40:57'),
(77, 8, 2, 2, 4, 'Overall puas, cocok untuk anak kuliahan.', '2026-01-23 20:40:57'),
(78, 9, 1, 1, 5, 'Lingkungan aman, kamar bagus buat jangka panjang.', '2026-01-23 20:40:57'),
(79, 9, 2, 2, 3, 'Kebersihan perlu ditingkatkan, tapi fasilitas sesuai harga.', '2026-01-23 20:40:57'),
(80, 10, 1, 2, 5, 'Desain interior modern, sangat nyaman.', '2026-01-23 20:40:57'),
(81, 10, 2, 1, 4, 'Kamar mandi bersih, cuma suara jalan raya agak terdengar.', '2026-01-23 20:40:57'),
(82, 10, 1, 1, 4, 'Worth it, pengelola responsif.', '2026-01-23 20:40:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rooms`
--

CREATE TABLE `rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `number` varchar(10) NOT NULL,
  `floor` int(11) NOT NULL DEFAULT 1,
  `price_monthly` int(10) UNSIGNED NOT NULL,
  `deposit` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `main_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `rooms`
--

INSERT INTO `rooms` (`id`, `number`, `floor`, `price_monthly`, `deposit`, `is_available`, `description`, `main_image_url`, `created_at`, `updated_at`) VALUES
(1, 'A01', 1, 1200000, 500000, 0, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room8.jpg', '2026-01-19 17:12:38', NULL),
(2, 'A02', 1, 1200000, 500000, 0, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room4.jpg', '2026-01-19 17:12:38', NULL),
(3, 'B02', 2, 1500000, 700000, 0, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room5.jpg', '2026-01-19 17:12:38', '2026-01-23 01:50:52'),
(4, 'B01', 2, 2400000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room1.jpg', '2026-01-23 01:45:47', NULL),
(5, 'B03', 2, 2700000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room2.jpg', '2026-01-23 01:45:47', '2026-01-23 01:50:36'),
(6, 'A03', 1, 2600000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room3.jpg', '2026-01-23 01:45:47', NULL),
(7, 'A04', 1, 2300000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room4.jpg', '2026-01-23 01:45:47', NULL),
(8, 'A05', 1, 2750000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room5.jpg', '2026-01-23 01:45:47', NULL),
(9, 'A06', 1, 2400000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room6.jpg', '2026-01-23 01:45:47', NULL),
(10, 'A07', 1, 2300000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room7.jpg', '2026-01-23 01:45:47', NULL),
(11, 'B04', 2, 2500000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room8.jpg', '2026-01-23 01:45:47', NULL),
(12, 'B05', 2, 2450000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room9.jpg', '2026-01-23 01:45:47', NULL),
(13, 'B06', 2, 2600000, 0, 1, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.', '/assets/images/Room/tinified/Room10.jpeg', '2026-01-23 01:45:47', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `room_facilities`
--

CREATE TABLE `room_facilities` (
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `room_facilities`
--

INSERT INTO `room_facilities` (`room_id`, `facility_id`) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 4),
(3, 5),
(3, 6),
(4, 1),
(4, 2),
(4, 3),
(4, 5),
(5, 1),
(5, 2),
(5, 4),
(5, 6),
(5, 8),
(6, 1),
(6, 2),
(6, 4),
(6, 5),
(6, 8),
(7, 1),
(7, 2),
(7, 3),
(7, 4),
(7, 8),
(8, 0),
(8, 1),
(8, 2),
(8, 4),
(8, 6),
(9, 1),
(9, 2),
(9, 4),
(9, 8),
(9, 9),
(10, 1),
(10, 2),
(10, 3),
(10, 4),
(10, 5),
(10, 6),
(10, 8),
(10, 9),
(11, 0),
(11, 1),
(11, 2),
(11, 3),
(11, 4),
(11, 6),
(11, 8),
(11, 9),
(12, 1),
(12, 2),
(12, 4),
(12, 5),
(12, 6),
(12, 8),
(12, 9),
(13, 0),
(13, 1),
(13, 2),
(13, 3),
(13, 4),
(13, 5),
(13, 6),
(13, 8),
(13, 9);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tariff_settings`
--

CREATE TABLE `tariff_settings` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `water_rate` int(10) UNSIGNED NOT NULL DEFAULT 5500,
  `water_free_quota` decimal(12,3) NOT NULL DEFAULT 20.000,
  `electricity_rate` int(10) UNSIGNED NOT NULL DEFAULT 1699,
  `electricity_free_quota` decimal(12,3) NOT NULL DEFAULT 50.000,
  `late_fee_flat` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `tariff_settings`
--

INSERT INTO `tariff_settings` (`id`, `water_rate`, `water_free_quota`, `electricity_rate`, `electricity_free_quota`, `late_fee_flat`, `updated_at`) VALUES
(1, 5500, 20.000, 1699, 50.000, 0, '2026-01-03 13:21:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `usage_monthly`
--

CREATE TABLE `usage_monthly` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `month` char(7) NOT NULL,
  `water_start` decimal(12,3) NOT NULL DEFAULT 0.000,
  `water_end` decimal(12,3) NOT NULL DEFAULT 0.000,
  `water_used` decimal(12,3) NOT NULL DEFAULT 0.000,
  `elec_start` decimal(12,3) NOT NULL DEFAULT 0.000,
  `elec_end` decimal(12,3) NOT NULL DEFAULT 0.000,
  `elec_used` decimal(12,3) NOT NULL DEFAULT 0.000,
  `computed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `usage_monthly`
--

INSERT INTO `usage_monthly` (`id`, `room_id`, `month`, `water_start`, `water_end`, `water_used`, `elec_start`, `elec_end`, `elec_used`, `computed_at`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-01', 100.000, 125.500, 25.500, 200.000, 270.200, 70.500, '2026-01-20 01:13:46', '2026-01-19 17:13:46', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('tenant','admin','manager') NOT NULL DEFAULT 'tenant',
  `phone` varchar(30) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `reset_otp_hash` varchar(64) DEFAULT NULL,
  `reset_otp_expires_at` datetime DEFAULT NULL,
  `reset_otp_attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `reset_otp_sent_at` datetime DEFAULT NULL,
  `delete_otp_hash` varchar(64) DEFAULT NULL,
  `delete_otp_expires_at` datetime DEFAULT NULL,
  `delete_otp_attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `delete_otp_sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `avatar_url`, `is_verified`, `created_at`, `updated_at`, `reset_otp_hash`, `reset_otp_expires_at`, `reset_otp_attempts`, `reset_otp_sent_at`, `delete_otp_hash`, `delete_otp_expires_at`, `delete_otp_attempts`, `delete_otp_sent_at`) VALUES
(1, 'Gung Nanda', 'gn.nanda0@gmail.com', '$2b$10$kn4xAOci3ccZbel3ckT.KOj.MFuXgHafmlpWWO7NNMxpAhbVwPpKG', 'tenant', '08975367222', NULL, 1, '2026-01-03 19:23:10', '2026-01-24 21:17:34', 'c20b0a219c493de77f393200f3c0fd1421373e40e9ac2eb6f22d242fe1648b9c', '2026-01-24 18:28:09', 0, '2026-01-25 02:18:09', NULL, NULL, 0, NULL),
(2, 'Dewa Dharma', 'dwdhr07@gmail.com', '$2b$10$OHW8sIRQ2ePjj4uwsvfPFOk/O45ZJf24l1qd7N2rbzFF6xjFxN7b.', 'tenant', NULL, NULL, 1, '2026-01-23 01:36:29', NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announce_active` (`is_active`),
  ADD KEY `idx_announce_period` (`start_at`,`end_at`);

--
-- Indeks untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_complaints_status` (`status`),
  ADD KEY `idx_complaints_user` (`user_id`),
  ADD KEY `idx_complaints_room` (`room_id`);

--
-- Indeks untuk tabel `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_facilities_name` (`name`);

--
-- Indeks untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_invoice_lease_month` (`lease_id`,`month`),
  ADD KEY `idx_invoices_user` (`user_id`),
  ADD KEY `idx_invoices_room` (`room_id`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `idx_invoices_due` (`due_date`);

--
-- Indeks untuk tabel `leases`
--
ALTER TABLE `leases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leases_user` (`user_id`),
  ADD KEY `idx_leases_room` (`room_id`),
  ADD KEY `idx_leases_status` (`status`);

--
-- Indeks untuk tabel `meters`
--
ALTER TABLE `meters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_meter_device_uid` (`device_uid`),
  ADD UNIQUE KEY `uq_meter_room_type` (`room_id`,`type`),
  ADD KEY `idx_meters_room` (`room_id`);

--
-- Indeks untuk tabel `meter_readings`
--
ALTER TABLE `meter_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_readings_meter_time` (`meter_id`,`recorded_at`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_provider_order` (`provider`,`provider_order_id`),
  ADD KEY `idx_payments_invoice` (`invoice_id`),
  ADD KEY `idx_payments_status` (`status`);

--
-- Indeks untuk tabel `payment_events`
--
ALTER TABLE `payment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_events_payment` (`payment_id`);

--
-- Indeks untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_room` (`room_id`),
  ADD KEY `idx_reviews_user` (`user_id`),
  ADD KEY `fk_reviews_lease` (`lease_id`);

--
-- Indeks untuk tabel `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_rooms_number` (`number`),
  ADD KEY `idx_rooms_available` (`is_available`),
  ADD KEY `idx_rooms_price` (`price_monthly`);

--
-- Indeks untuk tabel `room_facilities`
--
ALTER TABLE `room_facilities`
  ADD PRIMARY KEY (`room_id`,`facility_id`),
  ADD KEY `fk_room_facilities_facility` (`facility_id`);

--
-- Indeks untuk tabel `tariff_settings`
--
ALTER TABLE `tariff_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `usage_monthly`
--
ALTER TABLE `usage_monthly`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usage_room_month` (`room_id`,`month`),
  ADD KEY `idx_usage_month` (`month`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_reset_otp` (`reset_otp_hash`),
  ADD KEY `idx_users_reset_otp_exp` (`reset_otp_expires_at`),
  ADD KEY `idx_users_delete_otp_exp` (`delete_otp_expires_at`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `leases`
--
ALTER TABLE `leases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `meters`
--
ALTER TABLE `meters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `meter_readings`
--
ALTER TABLE `meter_readings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `payment_events`
--
ALTER TABLE `payment_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT untuk tabel `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `usage_monthly`
--
ALTER TABLE `usage_monthly`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaints_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_lease` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `leases`
--
ALTER TABLE `leases`
  ADD CONSTRAINT `fk_leases_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `meters`
--
ALTER TABLE `meters`
  ADD CONSTRAINT `fk_meters_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `meter_readings`
--
ALTER TABLE `meter_readings`
  ADD CONSTRAINT `fk_meter_readings_meter` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payment_events`
--
ALTER TABLE `payment_events`
  ADD CONSTRAINT `fk_payment_events_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_lease` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `room_facilities`
--
ALTER TABLE `room_facilities`
  ADD CONSTRAINT `fk_room_facilities_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_room_facilities_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `usage_monthly`
--
ALTER TABLE `usage_monthly`
  ADD CONSTRAINT `fk_usage_monthly_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
