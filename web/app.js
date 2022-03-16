const express = require('express')

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/index_test.html')
});

app.listen(port, () => {
  console.log(`raidshift listening on port ${port}`)
});