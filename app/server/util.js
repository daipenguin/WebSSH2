'use strict'
/* jshint esversion: 6, asi: true, node: true */
// util.js

// private
require('colors') // allow for color property extensions in log messages
var debug = require('debug')('WebSSH2')
var Auth = require('basic-auth')
var mysql= require('mysql')

exports.basicAuth = function basicAuth (req, res, next) {
  // var myAuth = Auth(req)
  var myAuth = {name:'root',pass:'diditest@pinzhi'}
  var myAuthJson = JSON.stringify(myAuth)
  console.log('myAuth初始化'+myAuthJson)
  if (myAuth && myAuth.pass !== ''&& typeof req.params.host !== "undefined") {
    console.log('查询host: '+req.params.host+'的用户名和密码')
    var connection = mysql.createConnection({
      host     : '10.179.133.165',
      user     : 'root',
      password : 'dbadmin',
      database : 'auto_env_db',
      port:'36360'
    })
    connection.connect()
    console.log("select * from t_env_dockercontainer where `ip` = '"+req.params.host+"'")
    connection.query("select * from t_env_dockercontainer where `ip` = '"+req.params.host+"'", function(err, rows, fields) {
      if (err) {
        console.log(err.number + '数据库查询出错:' + err.message)
      } else {
        console.log('select start')
        for(var i= 0;i < rows.length ;i++){
            console.log('user username='+rows[i].username + ', password='+rows[i].password)
            myAuth.name = rows[i].username
            myAuth.pass = rows[i].password
        }
        console.log('select end\n')
      }
      req.session.username = myAuth.name
      req.session.userpassword = myAuth.pass
      myAuthJson = JSON.stringify(myAuth)
      console.log('尝试登录:' + myAuthJson)
      debug('myAuth.name: ' + myAuth.name.yellow.bold.underline +
        ' and password ' + ((myAuth.pass) ? 'exists'.yellow.bold.underline
        : 'is blank'.underline.red.bold))
      next()
    })
    connection.end()
  } else {
    var c = JSON.stringify(myAuth)
    console.log(c+'没有账号与用户名')
    res.statusCode = 401
    debug('basicAuth credential request (401)')
    res.setHeader('WWW-Authenticate', 'Basic realm="WebSSH"')
    res.end('Username and password required for web SSH service.')
  }
  


}

// takes a string, makes it boolean (true if the string is true, false otherwise)
exports.parseBool = function parseBool (str) {
  return (str.toLowerCase() === 'true')
}
