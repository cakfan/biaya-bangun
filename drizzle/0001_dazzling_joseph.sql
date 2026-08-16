CREATE TABLE `component_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_component_id` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`work_component_id`) REFERENCES `work_components`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `work_components` ADD `volume_multiplier_per_square_meter` real NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `ahsp_coefficients` ADD `variant_id` integer REFERENCES component_variants(id);