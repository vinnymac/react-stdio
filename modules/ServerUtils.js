import path from 'path'
import ReactDOMServer from 'react-dom/server'
import React from 'react'

function renderStaticMarkup(component, props) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(component, props)
  )
}

function renderString(component, props={}) {
  return ReactDOMServer.renderToString(
    React.createElement(component, props)
  )
}

export function createRequestHandler(workingDir) {
  return function (data, callback) {
    const { component: componentPath, type, props } = data

    let response
    if (componentPath == null) {
      response = {
        error: 'Missing a { component } property'
      }
    } else {
      const componentFile = path.resolve(workingDir, componentPath)
      const render = (type === 'static') ? renderStaticMarkup : renderString

      try {
        const component = require(componentFile).default

        response = {
          html: render(component, props)
        }
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          response = {
            error: 'Cannot find file ' + componentFile
          }
        } else {
          process.stderr.write(error.stack + '\n')

          response = {
            error: error.message
          }
        }
      }
    }

    callback(null, JSON.stringify(response))
  }
}