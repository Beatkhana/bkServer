-- DropForeignKey
ALTER TABLE `api_keys` DROP FOREIGN KEY `api_keys_FK`;

-- DropForeignKey
ALTER TABLE `badge_assignment` DROP FOREIGN KEY `badge_assignment_FK`;

-- DropForeignKey
ALTER TABLE `bracket` DROP FOREIGN KEY `bracket_FK`;

-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_FK`;

-- DropForeignKey
ALTER TABLE `map_pools` DROP FOREIGN KEY `map_pools_FK`;

-- DropForeignKey
ALTER TABLE `participants` DROP FOREIGN KEY `participants_FK`;

-- DropForeignKey
ALTER TABLE `participants` DROP FOREIGN KEY `participants_FK_1`;

-- DropForeignKey
ALTER TABLE `pool_link` DROP FOREIGN KEY `pool_link_FK`;

-- DropForeignKey
ALTER TABLE `qualifier_scores` DROP FOREIGN KEY `qualifier_scores_FK`;

-- DropForeignKey
ALTER TABLE `qualifier_scores` DROP FOREIGN KEY `qualifier_scores_FK_1`;

-- DropForeignKey
ALTER TABLE `roleassignment` DROP FOREIGN KEY `roleassignment_FK`;

-- DropForeignKey
ALTER TABLE `roleassignment` DROP FOREIGN KEY `roleassignment_FK_1`;

-- DropForeignKey
ALTER TABLE `tournament_settings` DROP FOREIGN KEY `tournament_settings_FK`;

-- AddForeignKey
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `badge_assignment` ADD CONSTRAINT `badge_assignment_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bracket` ADD CONSTRAINT `bracket_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `map_pools` ADD CONSTRAINT `map_pools_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_FK_1` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pool_link` ADD CONSTRAINT `pool_link_FK` FOREIGN KEY (`poolId`) REFERENCES `map_pools`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qualifier_scores` ADD CONSTRAINT `qualifier_scores_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qualifier_scores` ADD CONSTRAINT `qualifier_scores_FK_1` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roleassignment` ADD CONSTRAINT `roleassignment_FK` FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roleassignment` ADD CONSTRAINT `roleassignment_FK_1` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_settings` ADD CONSTRAINT `tournament_settings_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
