/*
  Warnings:

  - You are about to alter the column `tournamentId` on the `qual_sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE `qual_sessions` MODIFY `tournamentId` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `qual_sessions` ADD CONSTRAINT `qual_sessions_FK` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
