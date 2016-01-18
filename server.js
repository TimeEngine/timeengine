(() => {
  'use strict';
  var port = 18999;
  var directory = './';

  var http = require('http');
  var url = require('url');
  var path = require("path");
  var fs = require('fs');

  var mimeTypes = {
    "html": "text/html",
    "js": "text/javascript",
    "css": "text/css",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "svg": "image/svg"
  // more
  };

  var request = (req, res) => {
    var uri = url.parse(req.url).pathname;
    var dir = path.join(__dirname, directory);
    var filepath = path.join(dir, unescape(uri));
    var indexfilepath = path.join(dir, unescape('index.html'));

    console.info('filepath', filepath);

    var f = (err, stats) => {
      if (err) {
        //do nothing
      }


      if (stats === undefined) // path does not exit 404
      {
        res.writeHead(404,
          {
            'Content-Type': 'text/plain'
          });
        res.write('404 Not Found\n');
        res.end();

        return;
      } else if (stats.isFile()) // path exists, is a file
      {
        var mimeType = mimeTypes[path.extname(filepath).split(".")[1]];
        res
          .writeHead(200,
            {
              'Content-Type': mimeType
            });

        var fileStream = fs
          .createReadStream(filepath)
          .pipe(res);

        return;
      } else if (stats.isDirectory()) // path exists, is a directory
      {
        res
          .writeHead(200,
            {
              'Content-Type': "text/html"
            });

        var fileStream2 = fs
          .createReadStream(indexfilepath)
          .pipe(res);

        return;
      } else {
        // Symbolic link, other?
        // TODO: follow symlinks?  security?
        res
          .writeHead(500,
            {
              'Content-Type': 'text/plain'
            })
          .write('500 Internal server error\n')
          .end();

        return;
      }
    };

    var component = fs.stat(filepath, f);
    return;
  };

  var serverUp = () => {
    console.info('HTTP server listening', port);
    return;
  };

  var server = http
    .createServer(request)
    .listen(port, serverUp);
})();
