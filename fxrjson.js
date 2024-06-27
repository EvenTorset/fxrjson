#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { FXR, Game } from '@cccode/fxr'
import beautify from 'json-beautify'
import { fileURLToPath } from 'node:url'

const CTX_MENU_NAME = 'FXR ⇄ JSON'

const games = {
  ds3: Game.DarkSouls3,
  darksouls3: Game.DarkSouls3,
  sdt: Game.Sekiro,
  sekiro: Game.Sekiro,
  er: Game.EldenRing,
  eldenring: Game.EldenRing,
  ac6: Game.ArmoredCore6,
  armoredcore6: Game.ArmoredCore6,
}

async function addCommand(reg, ext) {
  const icon = path.join(fileURLToPath(import.meta.url), '..', 'fxr.ico')
  const toolCmd = process.argv.slice(0, 2).map(e => `"${e}"`).join(' ')
  await reg.set(`\\${ext}\\shell\\${CTX_MENU_NAME}`, 'Icon', icon)
  await reg.set(`\\${ext}\\shell\\${CTX_MENU_NAME}\\command`, '', `${toolCmd} "%1"`)
}

async function removeCommand(reg, ext) {
  await reg.delete(`\\${ext}\\shell\\${CTX_MENU_NAME}`)
}

await (async () => {
  try {
    if (process.argv[2] === 'add-context-menu') {
      const { Registry } = await import('rage-edit')
      const reg = new Registry('HKEY_CLASSES_ROOT\\SystemFileAssociations')
      await addCommand(reg, '.fxr')
      await addCommand(reg, '.json')
      return
    }
    if (process.argv[2] === 'remove-context-menu') {
      const { Registry } = await import('rage-edit')
      const reg = new Registry('HKEY_CLASSES_ROOT\\SystemFileAssociations')
      await removeCommand(reg, '.fxr')
      await removeCommand(reg, '.json')
      return
    }
  } catch {
    console.error('Something went wrong while editing the context menu command. Make sure that the command is run as an administrator.')
    return
  }

  if (process.argv.length < 3) {
    console.error('Please provide a file to convert.')
    console.error('Syntax:')
    console.error('> fxrjson <input file> [game]')
    console.error('Examples:')
    console.error('> fxrjson f000000300.fxr')
    console.error('> fxrjson f000000300.fxr DS3')
    console.error('> fxrjson f000000300.fxr.json ER')
    console.error('')
    console.error('To manage the context menu command, use one of these commands as admin:')
    console.error('fxrjson add-context-menu')
    console.error('fxrjson remove-context-menu')
    process.exitCode = 1
    return
  }

  const packagePath = path.join(fileURLToPath(import.meta.url), '..', 'node_modules', '@cccode', 'fxr', 'package.json')
  const { name, version } = JSON.parse(await fs.readFile(packagePath))

  let game = null

  if (process.argv.length === 4) {
    game = games[process.argv[3].toLowerCase()] ?? null
    if (game === null) {
      console.warn(`'${process.argv[3]}' is not a valid game.`)
    }
  }

  if (game === null) try {
    const cliSelect = (await import('cli-select')).default
    console.log('What game is this for?')
    const result = await cliSelect({
      values: [
        'Dark Souls III',
        'Sekiro: Shadows Die Twice',
        'Elden Ring',
        'Armored Core VI Fires of Rubicon',
      ],
      defaultValue: 2,
      indentation: 2,
      unselected: '[ ]',
      selected: '[✓]',
    })
    game = games[Game[result.id].toLowerCase()]
    console.log(`Selected: ${result.value}`)
  } catch {
    console.log('Canceled.')
    return
  }

  const filePath = process.argv[2]
  const content = await fs.readFile(filePath)

  if (content.subarray(0, 4).equals(Buffer.from('FXR\0'))) {
    const fxr = FXR.read(content, game, { round: true })
    await fs.writeFile(filePath + '.json', beautify({
      version: `${name}@${version}`,
      fxr
    }, null, 2, 80))
  } else {
    const json = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    if (json.version !== `${name}@${version}`) {
      console.warn(
        `${path.basename(filePath)} was deserialized by a different version of ${name}, ` +
        `which means that this version might fail to serialize it. To ensure that it works ` +
        `correctly, please serialize it with ${json.version} instead.`
      )
    }
    const fxr = FXR.fromJSON(json.fxr)
    await fxr.saveAs(filePath.replace(/(?:(?:\.fxr)?\.json)?$/, '.fxr'), game)
  }

})()
