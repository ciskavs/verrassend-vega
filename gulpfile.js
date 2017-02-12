var gulp = require('gulp');
var jsonServer = require('json-server');
var browserSync = require('browser-sync');
var fs = require('fs');
var proxy = require('http-proxy-middleware');

var serverport = 8080;
var stubport = 8001;

function jsonServerProxy() {
  var server = jsonServer.create();
  var middlewares = jsonServer.defaults();

  server.use(middlewares);

  server.get('/api/recipe', function(req, res) {
    var file = fs.readFileSync(__dirname + '/mocks/recipe.json', "utf8");
    res.status(200).send(file);
  });

  server.listen(stubport, function() {
    console.log('JSON server is running');
  });

  return proxy(['/api/recipe'], {
    target: 'http://localhost:' + stubport + '/',
    loglevel: 'debug'
  });
}

gulp.task('serve', function() {
  browserSync({
    port: serverport,
    notify: false,
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: ['.tmp', './', 'bower_components'],
      middleware: [jsonServerProxy()]
    }
  });

  gulp.watch(['**/*.html']);
});
