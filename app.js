var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require("body-parser");
var neo4j = require('neo4j-driver');


var app = express();

//view Engie
app.set('views', path.join(__dirname, 'views'));
app.set('views engine', 'ejs');


app.use(express.static('web'))

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'root'));
var session = driver.session();
var session1 = driver.session();
var session2 = driver.session();

app.get('/kullanici', function (req, res) {
    res.render('kullanici.ejs');

    res.end();
})
app.get('/', function (req, res) {

    res.render('a.ejs');

    res.end();
})
app.get('/admin', function (req, res) {
    var aArr = [];
    session
        .run('MATCH(n: Akademisyen) RETURN n')
        .then(function (result) {
            result.records.forEach(function (record) {
                aArr.push({
                    id: record._fields[0].identity.low,
                    ad: record._fields[0].properties.ad,

                });
                // console.log(record._fields[0]);

            });
            session
                .run('MATCH (n: Yayın) RETURN n ')
                .then(function (result2) {
                    var yArr = [];
                    result2.records.forEach(function (record) {
                        yArr.push({
                            id: record._fields[0].identity.low,
                            ad: record._fields[0].properties.ad,

                        });
                        //console.log(record._fields[0]);

                    });
                    session
                        .run('MATCH (n: Tur) RETURN n ')
                        .then(function (result2) {
                            var tArr = [];
                            result2.records.forEach(function (record) {
                                tArr.push({
                                    id: record._fields[0].identity.low,
                                    ad: record._fields[0].properties.ad,
                                    yer: record._fields[0].properties.yer,
                                });
                                // console.log(record._fields[0]);

                            });

                            res.render('index.ejs', {
                                arastirmaci: aArr,
                                yayin: yArr,
                                tur: tArr
                            });

                        })
                        .catch(function (err) {
                            console.log(err);
                        });


                })
                .catch(function (err) {
                    console.log(err);
                });

        })
        .catch(function (err) {
            console.log(err);
        });

})
app.post('/arastirmaci/add', function (req, res) {
    var ad = req.body.ad;
    var soyad = req.body.soyad;

    session1
        .run('Create(n: Akademisyen {ad:"' + ad + ' ' + soyad + '"}) Return n.ad')
        .then(function (result) {
            res.redirect('/admin');


        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/yayin/add', function (req, res) {
    var ad = req.body.ad;
    var yıl = req.body.yıl;
    session1
        .run('Create(n: Yayın {ad:"' + ad + '",yıl:' + yıl + '}) Return n.ad')
        .then(function (result) {
            res.redirect('/admin');


        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/tur/add', function (req, res) {
    var ad = req.body.ad;
    var yer = req.body.yer;
    session1
        .run('Create(n: Tur {ad:"' + ad + '",yer:"' + yer + '"}) Return n.ad')
        .then(function (result) {
            res.redirect('/admin');

            session.close();
        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/yayintoakademisyen/add', function (req, res) {
    var aadi = req.body.aadi;
    var yadi = req.body.yadi;
    session1
        .run('MATCH(a: Yayın{ad:"' + yadi + '"}),(b: Akademisyen{ad:"' + aadi + '"}) MERGE(a)-[r:Yayin_IN]-(b) RETURN a,b')
        .then(function (result) {

            console.log('MATCH(a: Yayın{ad:"' + yadi + '"}),(b: Akademisyen{ad:"' + aadi + '"}) MERGE(a)-[r:Yayin_IN]-(b) RETURN a,b')
            res.redirect('/admin');
        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/turtoyayin/add', function (req, res) {
    var tadi = req.body.tadi;
    var yadi = req.body.yadi;
    session1
        .run('MATCH(a: Tur{ad:"' + tadi + '"}),(b: Yayın{ad:"' + yadi + '"}) MERGE(a)-[r:Tur_IN]-(b) RETURN a,b')
        .then(function (result) {
            res.redirect('/admin');


        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/atoa/add', function (req, res) {
    var a1adi = req.body.a1adi;
    var a2adi = req.body.a2adi;
    session1
        .run('MATCH(a: Akademisyen{ad:"' + a1adi + '"}),(b: Akademisyen{ad:"' + a2adi + '"}) MERGE(a)-[r:Ak_IN]->(b) Merge(b)-[d:Ak_IN]->(a) RETURN a,b')
        .then(function (result) {
            console.log('MATCH(a: Akademisyen{ad:"' + a1adi + '"}),(b: Akademisyen{ad:"' + a2adi + '"}) MERGE(a)-[r:Ak_IN]->(b) Merge(b)-[d:Ak_IN]->(a) RETURN a,b')
            res.redirect('/admin');


        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/admin');

});
app.post('/giris', function (req, res) {
    var kadi = req.body.name;
    var p = req.body.password;
    if (kadi == "admin@gmail.com" && p == "12345") {

        res.redirect('/admin')
    } else if (kadi != "" & p != "") {

        res.redirect('/kullanici')
    }
    console.log(kadi);
    console.log(p)
    res.redirect('/')
})

app.post('/getData', async (req, res) => {
    let payload = req.body.paylod.trim();
    var yayinArr = [];
    var aArr = [];
    var tArr = [];
    var yayinad = []
    console.log(payload);
    session
        .run('MATCH(a)-[TUR_IN]-> (n: Yayın{ad:"' + payload + '"}),(n) - [Yayin_IN] -> (b:Akademisyen) RETURN a,b,n')
        .then(function (result) {
            // Yayın Getir
            result.records.forEach(function (record) {
                aArr.push({
                    id: record._fields[1].identity.low,
                    ad: record._fields[1].properties.ad,

                });
                console.log("yayın" + record._fields[1].properties.ad)
                tArr.push({
                    id: record._fields[0].identity.low,
                    ad: record._fields[0].properties.ad,
                    yer: record._fields[0].properties.yer
                })
                yayinArr.push({
                    yıl: record._fields[2].properties.yıl
                })
                console.log("akademisyenler:" + record._fields[1])
                console.log("tür:" + record._fields[0])
                console.log("yayın" + record._fields[2])
                //console.log(document.getElementById('y').value)
                //  console.log(typeof(yayinArr))



            });

            res.send({
                payload: aArr,
                tur: tArr,
                yayin: yayinArr
            })



        })
        .catch(function (err) {
            console.log(err);
        });
})
app.post('/getaData', async (req, res) => {
    let payload = req.body.paylod.trim();
    console.log(payload);
    var yayinArr = [];
    var yArr = [];
    var tArr = [];
    var aArr = []
    session
        .run('MATCH(a)-[TUR_IN]-> (n: Yayın),(n) - [Yayin_IN] -> (b:Akademisyen{ad:"' + payload + '"}) RETURN a,n')
        .then(function (result) {
            // Yayın Getir
            result.records.forEach(function (record) {
                yayinArr.push({
                    id: record._fields[1].identity.low,
                    ad: record._fields[1].properties.ad,
                    yıl: record._fields[1].properties.yıl
                });
                //console.log("yayın"+record._fields[1].properties.ad)
                tArr.push({
                    id: record._fields[0].identity.low,
                    ad: record._fields[0].properties.ad,
                    yer: record._fields[0].properties.yer
                })
                // console.log(record._fields)
                // console.log("yayın"+record._fields[1].properties.yıl)
                // console.log("tür"+record._fields[0].properties.ad)
                // console.log(payload);
                session
                    .run('MATCH(a:Akademisyen)-[Ak_IN]-> (b:Akademisyen{ad:"' + payload + '"}) RETURN a')
                    .then(function (result2) {
                        result2.records.forEach(function (record1) {
                            aArr.push({
                                id: record1._fields[0].identity.low,
                                ad: record1._fields[0].properties.ad,

                            })
                            console.log('debene' + record1._fields[0])
                        });
                        res.send({
                            payload: yayinArr,
                            tur: tArr,
                            aka: aArr
                        })
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
                //console.log("akademisyen"+record._fields[2].properties.ad)
            });
            // console.log('MATCH(a)-[TUR_IN]-> (n: Yayın),(n) - [Yayin_IN] -> (b:Akademisyen{ad:"'+payload+'"})- [Ak_IN] -> (c:Akademisyen) RETURN a,n,c')




        })
        .catch(function (err) {
            console.log(err);
        });

})
app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;