# Toggle Caffeinate

> [한국어](./README.md)

Toggles `caffeinate -i` so the system stays awake while the display sleeps normally.

## Features

- Run once to turn ON, run again to turn OFF
- Uses `caffeinate -i`: the screen turns off as usual, but the system keeps running (builds, downloads, and other background work continue)
- Tracks state with a PID file (`~/.cache/raycast-caffeinate.pid`) to prevent duplicate processes
- Detects a stale PID (e.g. after a reboot) and starts fresh

## Installation

1. Open **Raycast Settings** > **Extensions** > **Script Commands**
2. Select the `toggle-caffeinate` folder in **Add Directories**
3. Search "Toggle Caffeinate" in Raycast

## How it works

| State | Result |
|-------|--------|
| OFF | Starts `caffeinate -i` in the background, shows "Caffeinate ON" |
| ON | Kills the running process, shows "Caffeinate OFF" |

To keep the display on as well, change `-i` to `-di` in the script.
