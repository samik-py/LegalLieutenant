const express = require("express")

const app = express()
const port = 3000

app.get('/form/:formName', (req, res) => {
  res.send(req.params.formName)
})

app.listen(port, () => { })

