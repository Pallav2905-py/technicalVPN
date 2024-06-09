const express = require('express')
const { getSubDomains } = require('./modules/subDomainFinder')
const {getTransactions} = require('./modules/transactionFinder')
const app = express()
const port = 3000

app.get('/sub-domain-finder', async (req, res) => {
    try {
        const url = "https://subdomainfinder.c99.nl/scans/" + req.query.url;
        const response = await getSubDomains(url)
        res.send(response)
    } catch (error) {
        res.send(error)
    }
})

app.get('/get-transactions', async (req, res) => {
    try {
        const url = "https://blockchair.com/search?q=" + req.query.hash;
        const response = await getTransactions(url)
        res.send(response)
    } catch (error) {
        res.send(error)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})