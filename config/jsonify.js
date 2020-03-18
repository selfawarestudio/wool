const fs = require('fs')
const sast = require('sast')
const visit = require('unist-util-visit')
const find = require('unist-util-find')
const select = require('unist-util-select')

const OUTPUT = []

const indexContents = fs.readFileSync('src/index.scss', 'utf8')
const indexTree = sast.parse(indexContents, { syntax: 'scss' })

visit(indexTree, 'declaration', declaration => {
  const json = sast.jsonify(declaration)
  const definitions = json.name === 'definitions'

  if (definitions) {
    const names = json.value
      .slice('map-collect(\n'.length)
      .slice(0, -1)
      .replace(/\$|\n/g, '')
      .split(',')
      .map(n => n.trim())

    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const rules = []
      const contents = fs.readFileSync(`src/definitions/_${name}.scss`, 'utf8')
      const tree = sast.parse(contents, { syntax: 'scss' })
      const configurable = !!find(tree, { type: 'atkeyword' })
      if (configurable) {
        switch (name) {
          case 'ratio':
            handleNonConfigurableDefitions(rules, tree, name)

            const ratioMaps = select.selectAll('map', tree)
            let [classname, declaration] = Object.entries(
              sast.jsonify(ratioMaps[3])
            )[0]

            rules.push({
              classname: handleInterpolatedVariable(classname),
              declarations: Object.entries(declaration).map(
                ([property, propertyValue]) => {
                  return {
                    property,
                    propertyValue:
                      propertyValue
                        .split('$')
                        .join('<')
                        .slice(0, -1) + '>)'
                  }
                }
              )
            })

            break
          case 'margin':
            handleNonConfigurableDefitions(rules, tree, name)

            const marginMaps = select.selectAll('map', tree)
            const marginEntries = Object.entries(sast.jsonify(marginMaps[8]))

            for (let i = 0; i < marginEntries.length; i++) {
              let [key, val] = marginEntries[i]
              rules.push({
                classname: handleInterpolatedVariable(key),
                declarations: Object.entries(val).map(
                  ([property, propertyValue]) => {
                    return {
                      property,
                      propertyValue: propertyValue.split('$').join('<') + '>'
                    }
                  }
                )
              })
            }

            break
          case 'padding':
            const paddingMap = select.select('map', tree)
            const paddingEntries = Object.entries(sast.jsonify(paddingMap))

            for (let i = 0; i < paddingEntries.length; i++) {
              let [key, val] = paddingEntries[i]
              rules.push({
                classname: handleInterpolatedVariable(key),
                declarations: Object.entries(val).map(
                  ([property, propertyValue]) => {
                    return {
                      property,
                      propertyValue: propertyValue.split('$').join('<') + '>'
                    }
                  }
                )
              })
            }

            break
          default:
            handleDefaultConfigurableDefinitions(rules, tree, name)
        }
      } else {
        handleNonConfigurableDefitions(rules, tree, name)
      }

      OUTPUT.push({
        name,
        configurable,
        rules
      })
    }
  }
})

fs.writeFileSync('config/output.json', JSON.stringify(OUTPUT, null, 2))

function handleNonConfigurableDefitions(rules, tree, name) {
  let map = select.select('declaration value map', tree)
  let entries = Object.entries(sast.jsonify(map))
  for (let n = 0; n < entries.length; n++) {
    let [key, val] = entries[n]
    let classname = key.replace(/\'/g, '')
    let declarations = Object.entries(val).map(([property, propertyValue]) => {
      return {
        property,
        propertyValue:
          typeof propertyValue === 'string' && propertyValue.includes('unquote')
            ? propertyValue.slice(`unquote('`.length, -2)
            : propertyValue
      }
    })
    rules.push({
      classname,
      declarations
    })
  }
}

function handleDefaultConfigurableDefinitions(rules, tree, name) {
  rules.push({
    classname: handleInterpolatedVariable(
      select.select('block declaration value string', tree).value
    ),
    declarations: Object.entries(
      sast.jsonify(select.select('block declaration map map', tree))
    ).map(([property, propertyValue]) => {
      if (propertyValue.includes('unquote')) {
        propertyValue = propertyValue.slice(`unquote(`.length, -1)
      }

      if (propertyValue.includes('$')) {
        propertyValue = `<${propertyValue.slice(1)}>`
      }

      return {
        property,
        propertyValue
      }
    })
  })
}

function handleInterpolatedVariable(string) {
  return string
    .slice(1, -1)
    .split('#{$')
    .join('<')
    .split('}')
    .join('>')
}

function log(x) {
  console.log(JSON.stringify(x, null, 2))
}
