# FXR ⇄ JSON
This is a small command line tool for converting FXR files from Dark Souls 3, Sekiro, Elden Ring, and Armored Core 6 to and from JSON using the [@cccode/fxr](https://www.npmjs.com/package/@cccode/fxr) library.

It also includes an option to add a context menu command for .fxr and .json files when you right click them, and converting an effect to JSON and back can be used as a simple way to convert the effect to any of the four games as it allows you to choose what game to convert it back to.

## Installation
The tool is easier to use when it is globally installed, but also works when installed locally in a folder.

### Global installation
To install it globally, use this command:
```
npm i -g fxrjson
```
This allows you to use the tool directly from anywhere, like this:
```
fxrjson example.fxr
```

### Local installation
To install it locally, use this command in the folder you want to install it to:
```
npm i fxrjson
```
Note that to run the local one you need to use the `npx` command in the folder it was installed to:
```
npx fxrjson example.fxr
```

## Usage
There are two ways to use the tool: through commands, and through the right-click context menu in the file explorer.

### Command line
The command line tool takes a file name and optionally a game:
```
fxrjson <input file> [game]
```
The input file can be any .fxr file from any of the four supported games, or a .json file produced by this tool. The game can be one of: `ds3`, `DarkSouls3`, `sdt`, `Sekiro`, `er`, `EldenRing`, `ac6`, `ArmoredCore6`. The game is case-insensitive, which means that `DS3` and `ds3` works the same way.

If a game is not specified, the tool will prompt you to pick one from a list.

Some examples:
```
fxrjson f000000300.fxr
fxrjson f000000300.fxr ds3
fxrjson f000000300.fxr.json sekiro
```

### Context menu
Registering the context menu command requires administrator privileges!

To add the context menu command, open the Windows Terminal as admin and run this command:
```
fxrjson add-context-menu
```
After doing this, there should be a new "FXR ⇄ JSON" button in the context menu when right-clicking .fxr and .json files.

If you want to remove the context menu command again, you can do so by running this command as admin:
```
fxrjson remove-context-menu
```