/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `cookie` command */
  export type Cookie = ExtensionPreferences & {}
  /** Preferences accessible in the `devlogs` command */
  export type Devlogs = ExtensionPreferences & {}
  /** Preferences accessible in the `projects` command */
  export type Projects = ExtensionPreferences & {}
  /** Preferences accessible in the `users` command */
  export type Users = ExtensionPreferences & {}
  /** Preferences accessible in the `clear-cache` command */
  export type ClearCache = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `cookie` command */
  export type Cookie = {}
  /** Arguments passed to the `devlogs` command */
  export type Devlogs = {}
  /** Arguments passed to the `projects` command */
  export type Projects = {}
  /** Arguments passed to the `users` command */
  export type Users = {}
  /** Arguments passed to the `clear-cache` command */
  export type ClearCache = {}
}

