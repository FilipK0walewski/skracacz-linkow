const express = require('express')
const app = express()
const port = 3000

const LinkManager = require("./link_manager")

const link_manager = new LinkManager()

app.get('/', (req, res) => {
  res.send('Patryk2703')
})


app.get('/add', (req, res) => {
    let url = req.query.url;
    let short_name = req.query.short_name;
    if (!short_name) {
        // RANDOM NAME
        short_name = (Math.random() + 1).toString(36).substring(7);
        console.log("RANDOMMMMM")
        console.log(short_name)
        console.log(':<')
    }

    link_manager.addShortcutFromUrl(
        short_name,
        url
    )
    res.status(201)
    res.send(`OK: ${short_name}`)
})



app.get('/get/:short_name/', (req, res) => {
    let url = link_manager.getUrlFromShortcut(
        req.params.short_name
    )
    if (url){
        // res.status(200)
        // res.send(url)
        res.status(301)
        res.redirect(url)
    } else {
        res.status(404)
        res.send(`Not found: ${req.params.short_name}`)
    }
})


app.listen(port, () => {
    console.log(`UFO ${port}`)
  })