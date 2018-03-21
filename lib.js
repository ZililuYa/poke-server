let fs = require('fs');
let http = require('http');
let jsDom = require('jsdom');
let li = 0;//当前下载启始值
const lib = {
  saveJson (name, data) {
    fs.writeFile(__dirname + '/data/' + name, data, "utf-8", function (err) {
      if (err) {
        console.error(err);
      }
    });
  },
  apiListZs (res) {
    let path = 'https://wiki.52poke.com/wiki/%E6%8B%9B%E5%BC%8F%E5%88%97%E8%A1%A8';
    jsdom.env(
      path,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
      function (errors, window) {
        let eplist = window.$('table.eplist');
        let data = {
          rows: []
        };
        try {
          for (let i in eplist.find('tr')) {
            let tr = eplist.find('tr').eq(i);
            let tl = tr.find('td').length
            let o = {
              id: tr.find('td').eq(0).html(),
              // name: tr.find('td').eq(1).find('a').html(),
              // href: tr.find('td').eq(1).find('a').attr('href'),
              sx: tr.find('td').eq(4).text(),
              fl: tr.find('td').eq(5).text(),
              wl: tr.find('td').eq(6).text(),
              mz: tr.find('td').eq(7).text(),
              pp: tr.find('td').eq(8).text()
            };
            // o.id = o.id.replace('\n', '');
            // getImage(o);
            if (tr.find('td').eq(1).find('a').length > 1) {
              o.name = tr.find('td').eq(1).find('a').eq(1).html()
              o.href = tr.find('td').eq(1).find('a').eq(1).attr('href')
            } else {
              o.name = tr.find('td').eq(1).find('a').html()
              o.href = tr.find('td').eq(1).find('a').attr('href')
            }
            if (o.name) {
              console.log(o.id, o.name)
              data.rows.push(o);
            }
          }

        } catch (e) {
          console.log(e);
        }
        this.saveJson('zs.json', JSON.stringify(data));
        res.send('成功');
        // rs.send(data);
      }
    );
  },
  apiList () {
    console.log('获取列表')
    let path = 'https://wiki.52poke.com/wiki/%E5%AE%9D%E5%8F%AF%E6%A2%A6%E5%88%97%E8%A1%A8%EF%BC%88%E6%8C%89%E5%85%A8%E5%9B%BD%E5%9B%BE%E9%89%B4%E7%BC%96%E5%8F%B7%EF%BC%89';
    jsdom.env(
      path,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
      function (errors, window) {
        let eplist = window.$('table.eplist');
        let data = {
          rows: []
        };
        try {
          for (let i in eplist.find('tr')) {
            let tr = eplist.find('tr').eq(i);
            let tl = tr.find('td').length
            let o = {
              id: tr.find('td').eq(tl - 7).html(),
              name: tr.find('td').eq(tl - 5).find('a').html(),
              href: tr.find('td').eq(tl - 5).find('a').attr('href'),
              // ja: tr.find('td').eq(tl - 4).html(),
              // en: tr.find('td').eq(tl - 3).html(),
              sx: [tr.find('td').eq(tl - 2).find('a').html()]
            };
            if (!tr.find('td').eq(tl - 1).hasClass('hide')) {
              o.sx.push(tr.find('td').eq(tl - 1).find('a').html())
            }
            // o.id = o.id.replace('\n', '');
            // getImage(o);
            if (o.name) {
              o.id = o.id.replace('#', '')
              console.log(o.id, o.name)
              data.rows.push(o);
            }
          }

        } catch (e) {
          console.log(e);
        }
        saveJson('list1.json', JSON.stringify(data));
        // rs.send(data);
      }
    );
  },
  getImage () {
    let o = list.rows[li];
    jsdom.env(
      'http://wiki.52poke.com' + o.href,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"], function (errors, window) {
        let src = window.$('.roundy.bgwhite.fulltable a.image img').eq(0).attr('data-url');
        this.saveImage(src, li + "_" + o.en);
        li++;
        if (li < list.rows.length) {
          this.getImage();
        }
      });
  },
  fsExistsSync (path) {
    try {
      fs.accessSync(path, fs.F_OK);
    } catch (e) {
      return false;
    }
    return true;
  },
  saveImage (url, en) {
    let srcFs = __dirname + '/data/' + en + ".png"
    if (!fsExistsSync(srcFs)) {
      http.get("http:" + url, function (res) {
        let imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.on("data", function (chunk) {
          imgData += chunk;
        });
        res.on("end", function () {
          fs.writeFile(srcFs, imgData, "binary", function (err) {
            if (err) {
              console.error(err);
            }
          });
        });
      });
    }
    return srcFs.replace(__dirname, '');
  },
  pokeDetail (url, res) {
    if (url) {
      let path = 'https://wiki.52poke.com' + url;
      jsDom.env(
        path,
        ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
        function (errors, window) {
          let data = {}
          try {
            // 获取图片
            data.imgUrl = window.$('.roundy.bgwhite.fulltable .image img').eq(0).attr('data-url').replace('media.52poke.com', 's1.52poke.wiki')

            // 获取分类
            data.type = window.$('a[title=分类]').eq(0).parent().next().text().trim()

            // 获取特性
            data.typeArr = []
            let tx = window.$('a[title=特性]').eq(0).parent().next().find('td').eq(0).text().trim()
            if (tx.indexOf('或') === -1) {
              data.typeArr.push(tx)
            } else {
              data.typeArr = [...tx.split(' 或 ')]
            }
            tx = window.$('a[title=特性]').eq(0).parent().next().find('td').eq(1).text().trim().replace('隱藏特性', '')
            data.typeArr.push(tx)

            // 获取身高
            data.height = window.$('a[title=宝可梦列表（按身高排序）]').eq(0).parent().next().find('td').eq(0).text().trim()

            // 获取体重
            data.weight = window.$('a[title=宝可梦列表（按体重排序）]').eq(0).parent().next().find('td').eq(0).text().trim()

            // 获取体形
            data.figure = window.$('a[title=宝可梦列表（按体形分类）]').eq(0).parent().next().find('img').attr('data-url').replace('media.52poke.com', 's1.52poke.wiki')

            // 获取捕获率
            data.capture = window.$('a[title=捕获率]').eq(0).parent().next().find('small').eq(0).text().trim()

            // 获取性别比例
            data.sex = window.$('a[title=宝可梦列表（按性别比例分类）]').eq(0).parent().next().find('td').eq(4).text().trim()

            // 获取基础点数
            data.number = []
            let td = window.$('a[title=基础点数]').eq(0).parent().next().find('tr').eq(0).find('td')
            for (let i = 0; i <= 5; i++) {
              if (lib.numberCall(td.eq(i).text())) data.number.push(td.eq(i).text().trim())
            }

            // 获取蛋组
            data.egg = window.$('a[title=宝可梦培育]').eq(0).parent().next().find('td').eq(0).text().trim()

          } catch (e) {
            console.log(e);
          }
          lib.send(res, data)
        }
      );
    } else {
      lib.sendNull(res)
    }
  },
  numberCall (v) {
    return !(v.indexOf('1') === -1 && v.indexOf('2') === -1 && v.indexOf('3') === -1)
  },
  sendNull (res) {
    res.send({code: 0})
  },
  send (res, data) {
    res.send({code: 1, data})
  }
}

module.exports = lib