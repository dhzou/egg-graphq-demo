'use strict';

const { graphqlKoa } = require('apollo-server-koa/dist/koaApollo');
const { resolveGraphiQLString } = require('apollo-server-module-graphiql');


function graphiqlKoa(options) {
  return ctx => {
    return resolveGraphiQLString(ctx.request.query, options, ctx)
      .then(graphiqlString => {
        ctx.set('Content-Type', 'text/html');
        ctx.body = graphiqlString;
      });
  };
}

module.exports = ({
                    graphiql = true,
                    onPreGraphiQL,
                    onPreGraphQL,
                  }, app) => async (ctx, next) => {
  if (ctx.path.endsWith('/graphql') || ctx.path.endsWith('/graphql?')) {
    if (ctx.request.accepts([ 'json', 'html' ]) === 'html' && graphiql) {
      if (onPreGraphiQL) {
        await onPreGraphiQL(ctx);
      }
      return graphiqlKoa({
        endpointURL: ctx.path,
      })(ctx);
    }
    if (onPreGraphQL) {
      await onPreGraphQL(ctx);
    }
    await graphqlKoa({
      schema: app.schema,
      context: ctx,
      tracing: true,
      formatResponse(data) { // data 为返回到前端的全部数据  all为执行resolve相关的信息 类似ctx
        delete data.extensions;
        return data;
      },
    })(ctx);
  }
  await next();
};
