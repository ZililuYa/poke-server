let fs = require('fs');
let http = require('http');
let jsDom = require('jsdom');
let li = 0;//当前下载启始值
const list = require('./data/list.json')
const listSkill = require('./data/skill.json')
const lib = {
  getImg (url, r) {
    http.get(url, function (res) {
      let imgData = "";
      res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
      res.on("data", function (chunk) {
        imgData += chunk;
      });
      res.on("end", function () {
        r.type('png');
        r.send(new Buffer(imgData, 'binary'))
      });
    });
  },
  saveJson (name, data, callback = () => {
  }) {
    fs.writeFile(name, data, "utf-8", function (err) {
      if (err) {
        console.error(err);
      } else {
        callback()
      }
    });
  },
  trim (val) {
    return val ? val.toString().trim() : ''
  },
  getSkillId (a) {
    for (let i in listSkill.rows) {
      if (listSkill.rows[i].name.indexOf(lib.trim(a.text())) !== -1) return listSkill.rows[i].id
      if (listSkill.rows[i].href.indexOf(lib.trim(a.attr('href'))) !== -1) return listSkill.rows[i].id
    }
    return 0
  },
  listNum: 0,// 开始的索引
  apiListCalc () {
    console.log('apiListCalc')
    for (let i in list.rows) {
      if (!lib.fsExistsSync(__dirname + '/data/pokeSkill/' + list.rows[i].id + '.json')) {
        console.log(list.rows[i].id)
      }
    }
  },
  apiListPokeSkill (id) {
    id ? lib.listNum = parseInt(id) : ''
    if (lib.listNum >= list.rows.length) {
      lib.listNum = 0
      return
    }
    console.log(list.rows[lib.listNum].href)
    let path = 'https://wiki.52poke.com' + list.rows[lib.listNum].href;
    jsDom.env(
      path,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
      function (errors, window) {
        let eplists = window.$('table.roundy.sortable');
        let ep1, ep2;
        for (let t in eplists) {
          if (eplists.eq(t).prev().text() === '可学会的招式') {
            ep1 = eplists.eq(t)
          }
          if (eplists.eq(t).prev().text() === '能使用的招式学习器') {
            ep2 = eplists.eq(t)
          }
        }
        // if (!ep1) ep1 = window.$('.varformn table.roundy.sortable').eq(0)
        // if (!ep2) ep2 = window.$('.varformn table.roundy.sortable').eq(1)
        if (!ep1) ep1 = window.$('table.roundy.sortable').eq(0)
        if (!ep2) ep2 = window.$('table.roundy.sortable').eq(1)
        let data = {
          rows: [],
          cd: []
        };
        try {
          for (let i in ep1.find('tr')) {
            let tr = ep1.find('tr').eq(i);
            let o = {
              age: lib.trim(tr.find('td').eq(0).text()),
              sid: lib.getSkillId(tr.find('td').eq(2).find('a')),
              // name: tr.find('td').eq(tl - 6).find('a').text()
            };
            if (o.age && o.age.length <= 4) {
              console.log(o.age, tr.find('td').eq(2).find('a').text())
              data.rows.push(o);
            }
          }


          for (let i in ep2.find('tr')) {
            let tr = ep2.find('tr').eq(i);
            let iii = lib.trim(tr.find('td').eq(2).find('a').text())
            let o = {
              // age: lib.trim(tr.find('td').eq(0).text()),
              sid: lib.getSkillId(tr.find('td').eq(2).find('a')),
              // name: tr.find('td').eq(tl - 6).find('a').text()
            };
            if (o.sid && iii) {
              console.log(iii)
              data.cd.push(o);
            }
          }

        } catch (e) {
          console.log(e);
        }
        lib.listNum++
        // this.saveJson('zs.json', JSON.stringify(data));
        lib.saveJson(__dirname + '/data/pokeSkill/' + list.rows[lib.listNum - 1].id + '.json', JSON.stringify(data), lib.apiListPokeSkill);
        // lib.saveJson(__dirname + '/data/pokeSkill/' + list.rows[lib.listNum - 1].id + '.json', JSON.stringify(data));
        console.log(list.rows[lib.listNum - 1].name, '数据偷取成功', '-----------------', list.rows[lib.listNum - 1].id)
        // res.send('成功');
        // rs.send(data);

      }
    );
  },
  apiListZs (res) {
    let path = 'https://wiki.52poke.com/wiki/%E6%8B%9B%E5%BC%8F%E5%88%97%E8%A1%A8';
    jsDom.env(
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
  apiListTx () {
    console.log('获取特性列表')
    let path = 'https://wiki.52poke.com/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';
    jsDom.env(
      path,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
      function (errors, window) {
        let eplist = window.$('table.eplist.roundy');
        let data = {
          rows: []
        };
        try {
          for (let i in eplist.find('tr')) {
            let tr = eplist.find('tr').eq(i);
            let tl = tr.find('td').length
            let o = {
              id: lib.trim(tr.find('td').eq(tl - 7).text()),
              name: lib.trim(tr.find('td').eq(tl - 6).find('a').html()),
              // href: tr.find('td').eq(tl - 5).find('a').attr('href'),
              // ja: tr.find('td').eq(tl - 4).html(),
              // en: tr.find('td').eq(tl - 3).html(),
              zc: lib.trim(tr.find('td').eq(tl - 2).text()),
              yc: lib.trim(tr.find('td').eq(tl - 1).text())
            };

            // o.id = o.id.replace('\n', '');
            // getImage(o);
            if (o.name) {
              o.id = o.id.replace('#', '')
              data.rows.push(o);
            }
          }

        } catch (e) {
          console.log(e);
        }
        lib.saveJson(__dirname + '/data/tx.json', JSON.stringify(data));
        // rs.send(data);
      }
    );
  },
  nowId: -1,
  apiListNl () {
    console.log('获取能力列表')
    let path = 'https://wiki.52poke.com/wiki/%E7%A7%8D%E6%97%8F%E5%80%BC%E5%88%97%E8%A1%A8%EF%BC%88%E7%AC%AC%E4%B8%83%E4%B8%96%E4%BB%A3%EF%BC%89';
    jsDom.env(
      path,
      ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
      function (errors, window) {
        let eplist = window.$('table.roundy.sortable');
        let data = {
          rows: []
        };
        try {
          for (let i in eplist.find('tr')) {
            let tr = eplist.find('tr').eq(i);
            // let tl = tr.find('td').length
            let o = {
              id: lib.trim(tr.find('td').eq(0).text()),
              hp: lib.trim(tr.find('td').eq(3).text()),
              gj: lib.trim(tr.find('td').eq(4).text()),
              fy: lib.trim(tr.find('td').eq(5).text()),
              tg: lib.trim(tr.find('td').eq(6).text()),
              tf: lib.trim(tr.find('td').eq(7).text()),
              sd: lib.trim(tr.find('td').eq(8).text()),
              zh: lib.trim(tr.find('td').eq(9).text())
            };

            // o.id = o.id.replace('\n', '');
            // getImage(o);
            if (o.id) {
              console.log(o.id)
              o.id = o.id.replace('#', '')
              if (o.id !== lib.nowId) {
                lib.nowId = o.id;
                data.rows.push(o);
              }
            }
          }

        } catch (e) {
          console.log(e);
        }
        lib.saveJson(__dirname + '/data/nl.json', JSON.stringify(data));
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
  skillDetail (data, res) {
    if (data.url) {
      let json = __dirname + '/data/skill/' + data.id + '.json'
      if (lib.fsExistsSync(json)) {
        var stream = fs.createReadStream(json);
        var data = "";
        stream.on('data', function (chrunk) {//将数据分为一块一块的传递
          data += chrunk;
        });
        stream.on('end', function () {
          lib.send(res, JSON.parse(data))
        });
        return
      }
      let path = 'https://wiki.52poke.com' + data.url;
      jsDom.env(
        path,
        ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
        function (errors, window) {
          let data = {}
          try {
            // 获取描述
            data.describe = window.$('td.roundybottom.bgwhite.at-l').eq(0).text().trim().split('\n')

            data.additional = [window.$('#toc').next().next().text().trim()]
            lib.additionalFun(data.additional, window.$('#toc').next().next())

            data.range = window.$('table.at-c').eq(1).find('tr').eq(2).text().trim()

          } catch (e) {
            console.log(e);
          }
          lib.saveJson(json, JSON.stringify(data))
          lib.send(res, data)
        }
      );
    } else {
      lib.sendNull(res)
    }
  },
  additionalFun (arr, h2) {
    let name = h2.next()[0].tagName.toLowerCase()
    if (name !== 'h2') {
      if (name === 'p' || name === 'h3') {
        arr.push(h2.next().text().trim())
      }
      lib.additionalFun(arr, h2.next())
    }
  },
  getJson (path, callback) {
    if (lib.fsExistsSync(path)) {
      var stream = fs.createReadStream(path);
      var data = "";
      stream.on('data', function (chrunk) {//将数据分为一块一块的传递
        data += chrunk;
      });
      stream.on('end', function () {
        callback(JSON.parse(data))
      });
    }
  },
  pokeDetail (data, res) {
    if (data.url) {
      let json = __dirname + '/data/poke/' + data.id + '.json'
      let jsonSkill = __dirname + '/data/pokeSkill/' + data.id + '.json'
      if (lib.fsExistsSync(json)) {
        var stream = fs.createReadStream(json);
        var chrunkData = "";
        stream.on('data', function (chrunk) {//将数据分为一块一块的传递
          chrunkData += chrunk;
        });
        stream.on('end', function () {
          stream = fs.createReadStream(jsonSkill);
          var chrunkData1 = "";
          stream.on('data', function (chrunk) {//将数据分为一块一块的传递
            chrunkData1 += chrunk;
          });
          stream.on('end', function () {
            let sendData = JSON.parse(chrunkData)
            sendData.skill = JSON.parse(chrunkData1)
            lib.send(res, sendData)
          });

          // lib.send(res, JSON.parse(data))
        });
        return
      }
      let path = 'https://wiki.52poke.com' + data.url;
      jsDom.env(
        path,
        ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
        function (errors, window) {
          let data = {}
          try {
            // 获取图片
            data.imgUrl = window.$('.roundy.bgwhite.fulltable .image img').eq(0).attr('data-url').replace('//media.52poke.com', '//s1.52poke.wiki')

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
            data.figure = window.$('a[title=宝可梦列表（按体形分类）]').eq(0).parent().next().find('img').attr('data-url').replace('//media.52poke.com', '//s1.52poke.wiki')

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
          lib.saveJson(json, JSON.stringify(data))
          if (lib.fsExistsSync(jsonSkill)) {
            stream = fs.createReadStream(jsonSkill);
            var chrunkData1 = "";
            stream.on('data', function (chrunk) {//将数据分为一块一块的传递
              chrunkData1 += chrunk;
            });
            stream.on('end', function () {
              data.skill = JSON.parse(chrunkData1)
              lib.send(res, data)
            });
          }
          // lib.send(res, data)
        }
      );
    } else {
      lib.sendNull(res)
    }
  },
  pokeFeatures (data, res) {
    if (data.name) {
      let json = __dirname + '/data/features/' + data.id + '.json'
      if (lib.fsExistsSync(json)) {
        var stream = fs.createReadStream(json);
        var data = "";
        stream.on('data', function (chrunk) {//将数据分为一块一块的传递
          data += chrunk;
        });
        stream.on('end', function () {
          lib.send(res, JSON.parse(data))
        });
        return
      }
      let path = 'https://wiki.52poke.com/wiki/' + encodeURI(data.name);
      jsDom.env(
        path,
        ["http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"],
        function (errors, window) {
          let data = {}
          try {
            // 获取描述
            data.describe = window.$('table.roundy.center').text().trim()

            data.additional = [window.$('#toc').next().next().text().trim()]
            lib.additionalFun(data.additional, window.$('#toc').next().next())

            let eplist = window.$('table.roundy.a-c.at-c').eq(0);
            data.arr = []
            for (let i in eplist.find('tr')) {
              let tr = eplist.find('tr').eq(i);
              if (tr.find('td').eq(2).text()) data.arr.push(lib.trim(tr.find('td').eq(0).text()))
            }
          } catch (e) {
            console.log(e);
          }
          lib.saveJson(json, JSON.stringify(data))
          lib.send(res, data)
        }
      );
    } else {
      lib.sendNull(res)
    }
  }
  ,
  numberCall (v) {
    return !(v.indexOf('1') === -1 && v.indexOf('2') === -1 && v.indexOf('3') === -1)
  }
  ,
  sendNull (res) {
    res.send({code: 0})
  }
  ,
  send (res, data) {
    res.send({code: 1, data})
  }
}

module.exports = lib