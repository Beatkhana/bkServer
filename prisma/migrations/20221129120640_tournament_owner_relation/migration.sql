-- AlterTable
ALTER TABLE `tournaments` MODIFY `owner` VARCHAR(20) NULL;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_owner_fkey` FOREIGN KEY (`owner`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
