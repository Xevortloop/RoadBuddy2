-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for roadbuddy
CREATE DATABASE IF NOT EXISTS `roadbuddy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `roadbuddy`;

-- Dumping structure for table roadbuddy.mechanic
CREATE TABLE IF NOT EXISTS `mechanic` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email_user` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `ktp_nik` varchar(255) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `balance` decimal(20,6) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table roadbuddy.mechanic: ~2 rows (approximately)
INSERT INTO `mechanic` (`id_user`, `full_name`, `username`, `email_user`, `phone_number`, `ktp_nik`, `license_plate`, `password`, `role`, `created_at`, `balance`) VALUES
	(4, 'Christian Widyadmaja ', 'widy', 'widyadmaja.biz@gmail.com', '085721176814', '3275021136987521', 'B 4555 RFP', '$2b$10$I1.7c5J/usAJm0HB7DQHR.gdzIxeou/m2m2HF8OvYu/DPv1Qfamv6', 'mechanic', '2024-12-18 19:05:41', 20000.000000),
	(5, 'Rudi', 'rudi', 'rudi@gmail.com', '0813915834921', '1234567890', 'AD 1234 CD', '$2b$10$nCwD2oc/lLJyyQlG4VvHoO6OxecrqbFdlVcDj3LNperQL6S7yZJDe', 'mechanic', '2024-12-18 19:11:01', NULL);

-- Dumping structure for table roadbuddy.transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `status` enum('pending','verified','in_progress','completed') DEFAULT 'pending',
  `plat_nomor` varchar(20) NOT NULL,
  `kendala` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_mechanic` int(11) DEFAULT NULL,
  `deskripsi` varchar(50) DEFAULT NULL,
  `total_biaya` decimal(20,6) DEFAULT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `user_id` (`user_id`),
  KEY `id_mechanic` (`id_mechanic`),
  CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table roadbuddy.transaksi: ~1 rows (approximately)
INSERT INTO `transaksi` (`id_transaksi`, `user_id`, `lokasi`, `latitude`, `longitude`, `status`, `plat_nomor`, `kendala`, `created_at`, `updated_at`, `id_mechanic`, `deskripsi`, `total_biaya`) VALUES
	(11, 45, 'Lokasi Terpilih', -7.781657, 110.416815, 'completed', 'AD 2995 PU', 'Mogok', '2024-12-18 19:20:26', '2024-12-18 19:21:36', 4, 'Kehabisan Bensin', 20000.000000);

-- Dumping structure for table roadbuddy.user
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email_user` varchar(255) NOT NULL,
  `phone_user` varchar(20) DEFAULT NULL,
  `password_user` varchar(255) NOT NULL,
  `role_user` enum('user','mechanic') DEFAULT 'user',
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email_user` (`email_user`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table roadbuddy.user: ~1 rows (approximately)
INSERT INTO `user` (`id_user`, `full_name`, `username`, `email_user`, `phone_user`, `password_user`, `role_user`, `balance`, `created_at`, `updated_at`, `email_verified`, `verification_code`) VALUES
	(45, 'Stanislaus Andri Sih Pamungkas', 'Stanislauz', 'andrisihpamungkas@gmail.com', '081391589452', '$2b$10$K4cSIAJH8ofq6VgWw3dY1OB2Xk0ELm.WmB6QNrU3m/t1vEwB4Q9ea', 'user', 30000.00, '2024-12-18 19:03:21', '2024-12-18 19:21:36', 1, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
