CREATE TABLE `building_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`default_building_area` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `building_types_slug_unique` ON `building_types` (`slug`);--> statement-breakpoint
CREATE TABLE `work_components` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`building_type_id` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`building_type_id`) REFERENCES `building_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `material_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`price` integer NOT NULL,
	`source` text NOT NULL,
	`source_name` text,
	`city` text NOT NULL,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_slug_unique` ON `materials` (`slug`);--> statement-breakpoint
CREATE TABLE `labor_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`labor_type_id` integer NOT NULL,
	`daily_rate` integer NOT NULL,
	`city` text NOT NULL,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`labor_type_id`) REFERENCES `labor_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `labor_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `labor_types_slug_unique` ON `labor_types` (`slug`);--> statement-breakpoint
CREATE TABLE `ahsp_coefficients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_component_id` integer NOT NULL,
	`material_id` integer,
	`material_coefficient` real,
	`labor_type_id` integer,
	`labor_coefficient` real,
	FOREIGN KEY (`work_component_id`) REFERENCES `work_components`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`labor_type_id`) REFERENCES `labor_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `borongan_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_component_id` integer NOT NULL,
	`price_per_unit` integer NOT NULL,
	`city` text NOT NULL,
	`source_name` text NOT NULL,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`work_component_id`) REFERENCES `work_components`(`id`) ON UPDATE no action ON DELETE no action
);
