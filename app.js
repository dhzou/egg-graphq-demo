'use strict';
module.exports = app => {
  app.beforeStart(async () => {
    require('./app/lib/index')(app);
  });
};
