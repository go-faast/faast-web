#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')

const mv = (src, dest, transformer) => {
  fs.writeFileSync(dest, transformer(fs.readFileSync(src, 'utf8')))
  if (src !== dest) {
    fs.removeSync(src)
  }
}

const appDir = (...paths) => path.join(__dirname, '../src/app', ...paths)

const compDir = (name, ...paths) => {
  let p = appDir('components', name)
  fs.mkdirsSync(p)
  return path.join(p, ...paths)
}

fs.mkdirsSync(appDir('components'))

const updateReferences = (src) => src
  .replace(/(\W)Controllers\/(\w+)Controller(\W)/g, '$1Components/$2$3')
  .replace(/(\W)(\w+)Controller(\W)/g, '$1$2$3')

const updateComponent = (src, comp) => updateReferences(src
  .replace(`'Styles/${comp}.scss'`, '\'./style\'')
  .replace(`'Views/${comp}'`, '\'./view\'')
  .replace(new RegExp(`(\\W)${comp}(?!Controller)(\\W)`, 'g'), `$1${comp}View$2`))

fs.readdirSync(appDir('controllers')).forEach(fname => {
  let comp = fname.replace('Controller.jsx', '')
  let srcFile = appDir('controllers', fname)
  let destFile = compDir(comp, 'index.jsx')
  mv(srcFile, destFile, (src) => updateComponent(src, comp))
})
fs.readdirSync(appDir('styles')).forEach(fname => {
  if (!/^[A-Z]/.test(fname)) { return } // Not a component
  let comp = fname.replace('.scss', '')
  let srcFile = appDir('styles', fname)
  let destFile = compDir(comp, 'style.scss')
  mv(srcFile, destFile, (src) => src.replace('"variables"', '"~Styles/variables"'))
})
fs.readdirSync(appDir('views')).forEach(fname => {
  let comp = fname.replace('.jsx', '')
  let srcFile = appDir('views', fname)
  let destFile = compDir(comp, 'view.jsx')
  mv(srcFile, destFile, (src) => updateComponent(src, comp))
})
const index = appDir('index.jsx')
mv(index, index, updateReferences)