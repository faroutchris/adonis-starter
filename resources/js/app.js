import '../css/bootstrap.min.css'
import 'bootstrap'

// Use Mutation observer to listen for changes in the DOM

const scripts = ['tableselector']

const initResumability = () => {
  document.querySelectorAll('[data-attach]').forEach((element) => {
    const script = element.dataset.attach
    import(`./hooks/${script}.js`).then((mod) => {
      const instance = mod.default(element)

      instance.mounted()
    })
  })
}

initResumability()
