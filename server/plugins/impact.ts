export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    html.head.push(`<meta name="impact-site-verification" value="ea35b5b0-59ab-4f17-9d42-d7c5d2f6c20f">`)
  })
})
