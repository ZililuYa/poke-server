let lib = require('./lib')

const api = {

  use: (app) => {
    api.setHttpGet(app)
    api.setHttpPost(app)
  },
  setHttpPost: (app) => {
    app.post('/api/poke', function (req, res) {
      lib.pokeDetail(req.body, res)
    });
    app.post('/api/skill', function (req, res) {
      lib.skillDetail(req.body, res)
    });
    app.post('/api/features', function (req, res) {
      lib.pokeFeatures(req.body, res)
    });

  },
  setHttpGet: (app) => {
    app.get('/img.png', function (req, res) {
      lib.getImg(req.query.url, res);
    });
    app.get('/getList', function (req, res) {
      if (req.query.type === 'poke') {
        lib.apiList();
      } else if (req.query.type === 'tx') {
        lib.apiListTx();
      }
      res.send('下载中')
    });
    app.get('/app/getZs', function (req, res) {
      lib.apiListZs(res);
    });
    app.get('/app/getImage', function (req, res) {
      lib.saveImage();
    });
  }
}

module.exports = api