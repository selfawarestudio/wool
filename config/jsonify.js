const fs = require('fs')
const sast = require('sast')
const visit = require('unist-util-visit')
const find = require('unist-util-find')

// const contents = fs.readFileSync('src/definitions/_bg.scss', 'utf8')
// const tree = sast.parse(contents, { syntax: 'scss' })
// let found = find(tree, { type: 'atkeyword' })
// log(found, { depth: null })

const OUTPUT = []

const indexContents = fs.readFileSync('src/index.scss', 'utf8')
const indexTree = sast.parse(indexContents, { syntax: 'scss' })

visit(indexTree, 'declaration', declaration => {
  const json = sast.jsonify(declaration)
  const static = json.name === 'static-definitions'
  const responsive = json.name === 'responsive-definitions'

  if (static || responsive) {
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
        // let each = {
        //   classname: 'bc-<key>',
        //   declarations: [
        //     {
        //       property: 'border-color',
        //       propertyValue: '<value>'
        //     }
        //   ]

        visit(tree, 'block', b => {
          visit(b, 'declaration', d => {
            visit(d, 'value', v => {
              visit(v, 'string', s => {
                console.log(s.value)
              })
            })
          })
        })

        // }
      } else {
        visit(tree, 'declaration', d => {
          let entries = Object.entries(sast.jsonify(d).value)

          for (let n = 0; n < entries.length; n++) {
            let [key, val] = entries[n]
            let classname = key.replace(/\'/g, '')
            let declarations = Object.entries(val).map(
              ([property, propertyValue]) => {
                return {
                  property,
                  propertyValue:
                    typeof propertyValue === 'string' &&
                    propertyValue.includes('unquote')
                      ? propertyValue.slice(`unquote('`.length, -2)
                      : propertyValue
                }
              }
            )
            rules.push({
              classname,
              declarations
            })
          }
        })
      }

      OUTPUT.push({
        name,
        responsive,
        configurable,
        rules
      })
    }
  }
})

// log(OUTPUT)
fs.writeFileSync('config/output.json', JSON.stringify(OUTPUT, null, 2))

// helper

function log(x) {
  console.dir(x, { depth: null })
}
