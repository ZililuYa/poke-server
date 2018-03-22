let lib = require('./lib')

const api = {

  use: (app) => {
    api.setHttpGet(app)
    api.setHttpPost(app)
  },
  setHttpPost: (app) => {
    app.post('/api/poke', function (req, res) {
      lib.pokeDetail(req.body.url, res)
    });
    app.post('/api/skill', function (req, res) {
      lib.skillDetail(req.body.url, res)
    });
  },
  setHttpGet: (app) => {
    app.get('/img.png', function (req, res) {
      lib.getImg(req.query.url, res);
    });
    app.get('/app/getList', function (req, res) {
      lib.apiList();
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