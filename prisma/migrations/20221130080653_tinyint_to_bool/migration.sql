-- AlterTable
ALTER TABLE `bracket` MODIFY `bye` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `map_pools` MODIFY `live` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_qualifiers` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `participants` MODIFY `forfeit` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `tournament_settings` MODIFY `public_signups` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `show_signups` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `public` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `has_bracket` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `has_map_pool` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `comment_required` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `show_quals` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `has_quals` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `tournaments` MODIFY `is_mini` BOOLEAN NOT NULL DEFAULT false;
