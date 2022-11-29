-- AlterTable
ALTER TABLE `api_keys` MODIFY `tournamentId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `bracket` MODIFY `tournamentId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `logs` MODIFY `userId` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `participants` MODIFY `userId` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `qualifier_scores` MODIFY `tournamentId` BIGINT NOT NULL,
    MODIFY `userId` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `roleassignment` MODIFY `userId` VARCHAR(20) NOT NULL;

-- Delete old data
-- Delete logs not related to a user
DELETE ak FROM logs ak 
LEFT JOIN users  t ON t.discordId  = ak.userId  
WHERE t.discordId  IS NULL;

-- Delete tournament settings not related to a tournament
DELETE ak FROM tournament_settings ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- Delete pool songs not in a map pool
DELETE ak FROM pool_link ak 
LEFT JOIN map_pools t ON t.id = ak.poolId  
WHERE t.poolName IS NULL;

-- Delete qual scores not related to a tournament
DELETE ak FROM qualifier_scores ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- Delete users not related to a tournament
DELETE ak FROM participants ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- Delete map pools not related to a tournament
DELETE ak FROM map_pools  ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- Delete Bracket matches not related to a tournament
DELETE ak FROM bracket ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- Delete API keys not related to a tournament
DELETE ak FROM api_keys ak 
LEFT JOIN tournaments t ON t.id = ak.tournamentId 
WHERE t.name IS NULL;

-- DropTable
DROP TABLE `matches`;

-- DropTable
DROP TABLE `userlink`;

-- CreateIndex
CREATE INDEX `bracket_FK` ON `bracket`(`tournamentId`);

-- CreateIndex
CREATE INDEX `logs_FK` ON `logs`(`userId`);

-- CreateIndex
CREATE INDEX `participants_FK_1` ON `participants`(`userId`);

-- CreateIndex
CREATE INDEX `pool_link_FK` ON `pool_link`(`poolId`);

-- CreateIndex
CREATE INDEX `qualifier_scores_FK` ON `qualifier_scores`(`userId`);

-- CreateIndex
CREATE INDEX `roleassignment_FK` ON `roleassignment`(`roleId`);

-- CreateIndex
CREATE INDEX `roleassignment_FK_1` ON `roleassignment`(`userId`);

-- AddForeignKey
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bracket` ADD CONSTRAINT `bracket_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `map_pools` ADD CONSTRAINT `map_pools_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_FK_1` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pool_link` ADD CONSTRAINT `pool_link_FK` FOREIGN KEY (`poolId`) REFERENCES `map_pools`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qualifier_scores` ADD CONSTRAINT `qualifier_scores_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qualifier_scores` ADD CONSTRAINT `qualifier_scores_FK_1` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roleassignment` ADD CONSTRAINT `roleassignment_FK` FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roleassignment` ADD CONSTRAINT `roleassignment_FK_1` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_settings` ADD CONSTRAINT `tournament_settings_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

