/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Slack User Token - Slack User OAuth Token (xoxp-...) with channels:read and groups:read scopes */
  "slackToken": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `open-channel` command */
  export type OpenChannel = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `open-channel` command */
  export type OpenChannel = {}
}

