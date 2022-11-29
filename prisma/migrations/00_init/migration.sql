-- CreateTable
CREATE TABLE `api_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` VARCHAR(45) NOT NULL,
    `api_key` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `tournamentId_UNIQUE`(`tournamentId`),
    UNIQUE INDEX `api_keys_UN`(`api_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badge_assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(20) NOT NULL,
    `badgeId` INTEGER NOT NULL,

    INDEX `badge_assignment_FK_1`(`badgeId`),
    UNIQUE INDEX `badge_assignment_UN`(`userId`, `badgeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(100) NOT NULL,
    `description` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `badges_UN`(`image`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bracket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` VARCHAR(45) NOT NULL,
    `round` INTEGER NOT NULL,
    `matchNum` INTEGER NOT NULL,
    `p1` VARCHAR(45) NULL,
    `p2` VARCHAR(45) NULL,
    `p1Score` INTEGER NOT NULL DEFAULT 0,
    `p2Score` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(45) NOT NULL DEFAULT 'awaiting_start',
    `bye` TINYINT NOT NULL,
    `time` DATETIME(0) NULL,
    `best_of` INTEGER NULL DEFAULT 3,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_map_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` BIGINT NOT NULL,
    `map_id` INTEGER NOT NULL,
    `flags` INTEGER NOT NULL DEFAULT 0,
    `playerOptions` INTEGER NOT NULL DEFAULT 0,
    `selCharacteristic` VARCHAR(100) NULL,
    `difficulty` INTEGER NULL,

    INDEX `event_map_options_FK`(`map_id`),
    INDEX `event_map_options_FK_1`(`tournament_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(45) NOT NULL,
    `log` TEXT NOT NULL,
    `time` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_pools` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` BIGINT NOT NULL,
    `poolName` VARCHAR(45) NOT NULL,
    `image` LONGTEXT NOT NULL,
    `description` TEXT NOT NULL,
    `live` TINYINT NOT NULL,
    `is_qualifiers` TINYINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `unique_map_per_pool`(`tournamentId`, `poolName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `p1` BIGINT NULL,
    `p2` BIGINT NULL,
    `time` VARCHAR(50) NULL,
    `coordinator` INTEGER NULL,
    `status` VARCHAR(50) NOT NULL,
    `p1Score` INTEGER NULL,
    `p2Score` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `comment` TEXT NOT NULL,
    `forfeit` TINYINT NOT NULL DEFAULT 0,
    `seed` INTEGER NOT NULL DEFAULT 0,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `1personpertourney`(`tournamentId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pool_link` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poolId` INTEGER NOT NULL,
    `songHash` VARCHAR(80) NOT NULL,
    `songName` VARCHAR(255) NOT NULL,
    `songAuthor` VARCHAR(45) NOT NULL,
    `levelAuthor` VARCHAR(45) NOT NULL,
    `songDiff` VARCHAR(45) NOT NULL,
    `key` VARCHAR(5) NOT NULL,
    `ssLink` VARCHAR(45) NOT NULL,
    `numNotes` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qual_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(0) NOT NULL,
    `limit` INTEGER NOT NULL DEFAULT 15,
    `tournamentId` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qualifier_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` VARCHAR(45) NOT NULL,
    `userId` VARCHAR(45) NOT NULL,
    `songHash` VARCHAR(45) NOT NULL,
    `score` VARCHAR(45) NOT NULL,
    `percentage` FLOAT NOT NULL,
    `maxScore` VARCHAR(45) NOT NULL DEFAULT '0',
    `attempt` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `index2`(`tournamentId`, `userId`, `songHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quest_ids` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(20) NOT NULL,
    `qId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `quest_ids_UN`(`userId`),
    UNIQUE INDEX `quest_ids_UN2`(`qId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roleassignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `roleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` TEXT NOT NULL,

    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participantId` INTEGER NOT NULL,
    `sessionId` INTEGER NOT NULL,

    INDEX `session_assignment_FK`(`sessionId`),
    INDEX `session_assignment_FK_1`(`participantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_role_assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(20) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `tournament_id` BIGINT NOT NULL,

    INDEX `tournament_role_assignment_FK_1`(`role_id`),
    INDEX `tournament_role_assignment_FK_2`(`tournament_id`),
    UNIQUE INDEX `tournament_role_assignment_UN`(`user_id`, `role_id`, `tournament_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `tournament_roles_UN`(`role_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` BIGINT NOT NULL,
    `public_signups` TINYINT NOT NULL DEFAULT 0,
    `show_signups` TINYINT NOT NULL DEFAULT 0,
    `public` TINYINT NOT NULL DEFAULT 0,
    `state` VARCHAR(45) NOT NULL DEFAULT 'awaiting_start',
    `type` VARCHAR(45) NOT NULL DEFAULT 'single_elim',
    `has_bracket` TINYINT NOT NULL DEFAULT 0,
    `has_map_pool` TINYINT NOT NULL DEFAULT 0,
    `signup_comment` VARCHAR(45) NOT NULL DEFAULT 'Comment',
    `comment_required` TINYINT NOT NULL DEFAULT 0,
    `bracket_sort_method` VARCHAR(45) NOT NULL DEFAULT 'globalRank',
    `bracket_limit` INTEGER NOT NULL DEFAULT 16,
    `quals_cutoff` INTEGER NOT NULL DEFAULT 32,
    `show_quals` TINYINT NOT NULL DEFAULT 0,
    `has_quals` TINYINT NOT NULL DEFAULT 0,
    `countries` VARCHAR(45) NOT NULL DEFAULT '',
    `sort_method` VARCHAR(45) NOT NULL DEFAULT 'globalRank',
    `standard_cutoff` INTEGER NOT NULL DEFAULT 16,
    `ta_url` VARCHAR(100) NULL,
    `ta_password` VARCHAR(100) NULL,
    `ta_event_flags` INTEGER NULL DEFAULT 0,
    `qual_attempts` INTEGER NOT NULL DEFAULT 0,
    `quals_method` VARCHAR(100) NOT NULL DEFAULT 'ta_quals',

    UNIQUE INDEX `id_UNIQUE`(`id`),
    UNIQUE INDEX `tournamentId_UNIQUE`(`tournamentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournaments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `date` DATETIME(0) NOT NULL,
    `endDate` DATETIME(0) NOT NULL,
    `discord` TEXT NOT NULL,
    `twitchLink` TEXT NULL,
    `prize` VARCHAR(50) NULL,
    `info` TEXT NULL,
    `owner` BIGINT NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,
    `first` TEXT NULL,
    `second` TEXT NULL,
    `third` TEXT NULL,
    `is_mini` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userlink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` BIGINT NOT NULL,
    `tourneyId` BIGINT NOT NULL,
    `seed` INTEGER NOT NULL,
    `userGroup` INTEGER NULL,
    `forfeit` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `discordId` VARCHAR(20) NOT NULL,
    `ssId` VARCHAR(20) NULL,
    `name` TEXT NOT NULL,
    `twitchName` VARCHAR(25) NOT NULL,
    `avatar` TEXT NOT NULL,
    `globalRank` INTEGER NOT NULL DEFAULT 0,
    `localRank` INTEGER NOT NULL DEFAULT 0,
    `country` VARCHAR(2) NULL,
    `tourneyRank` INTEGER NULL DEFAULT 0,
    `TR` INTEGER NULL DEFAULT 0,
    `pronoun` VARCHAR(45) NOT NULL,
    `refresh_token` VARCHAR(45) NULL,

    UNIQUE INDEX `discordId_UNIQUE`(`discordId`),
    UNIQUE INDEX `ssId`(`ssId`),
    UNIQUE INDEX `twitchName`(`twitchName`),
    PRIMARY KEY (`discordId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `badge_assignment` ADD CONSTRAINT `badge_assignment_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `badge_assignment` ADD CONSTRAINT `badge_assignment_FK_1` FOREIGN KEY (`badgeId`) REFERENCES `badges`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_map_options` ADD CONSTRAINT `event_map_options_FK` FOREIGN KEY (`map_id`) REFERENCES `pool_link`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_map_options` ADD CONSTRAINT `event_map_options_FK_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quest_ids` ADD CONSTRAINT `quest_ids_FK` FOREIGN KEY (`userId`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `session_assignment` ADD CONSTRAINT `session_assignment_FK` FOREIGN KEY (`sessionId`) REFERENCES `qual_sessions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `session_assignment` ADD CONSTRAINT `session_assignment_FK_1` FOREIGN KEY (`participantId`) REFERENCES `participants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_role_assignment` ADD CONSTRAINT `tournament_role_assignment_FK` FOREIGN KEY (`user_id`) REFERENCES `users`(`discordId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_role_assignment` ADD CONSTRAINT `tournament_role_assignment_FK_1` FOREIGN KEY (`role_id`) REFERENCES `tournament_roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_role_assignment` ADD CONSTRAINT `tournament_role_assignment_FK_2` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

