const setup = require('../model/setup');
const utility = require('../helper/utility');
const randomstring = require('randomstring');
const backendSettings = require('../config/default');

/*
* setup.database()
* get the database settings
*/

exports.database = async function(req, res){
  
  return res.status(200).send({ data: {

    client: process.env.DB_CLIENT,
    connection: {

      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME

    }
  }});

}

/*
* setup.database.update()
* configure the database settings
*/

exports.database.update =  async function(req, res){

  let settings = { client: req.body.client }
  delete req.body.client;
  settings.connection = req.body;
  settings.connection.port = Number(settings.connection.port);

  // generate random strings
  await setup.env({ key: 'TOKEN_SECRET', value: randomstring.generate(64)});
  await setup.env({ key: 'CRYPTO_SECRET', value: randomstring.generate(64)});
  await setup.env({ key: 'SESSION_SECRET', value: randomstring.generate(64)});

  if (settings.client === 'mongo'){

    await setup.database.mongo(settings.connection.host);
    await setup.package({ remove: ['mysql', 'knex'] }); // clean package.json

  }
  else {

    settings.connection.ssl = { rejectUnauthorized: false };
    await setup.database.sql(settings);
    await setup.package({ remove: ['mongodb', 'mongoose', 'express-mongo-sanitize'] }); // clean package.json

  }

  await setup.env({ key: 'DB_CLIENT', value: settings.client });
  await setup.env({ key: 'DB_USER', value: settings.connection.user });
  await setup.env({ key: 'DB_PASSWORD', value: settings.connection.password });
  await setup.env({ key: 'DB_HOST', value: settings.connection.host });
  await setup.env({ key: 'DB_NAME', value: settings.connection.database });
  await setup.env({ key: 'DB_PORT', value: settings.connection.port });

  console.log('✅ Database created');
  return res.status(200).send({ message: 'Database tables created' });

};

/*
* setup.stripe()
* get the stripe settings
*/

exports.stripe = async function(req, res){

  const frontendSettings = require('../../client/src/settings.json');
  let settings = backendSettings.stripe;
  settings.publishableAPIKey = frontendSettings.development.stripe.publishableAPIKey;
  return res.status(200).send({ data: settings });

};

/*
* setup.stripe.update()
* save stripe settings
*/

exports.stripe.update = async function(req, res){

  const data = req.body;
  utility.validate(data, ['test_pk', 'test_sk']);

  // save keys
  await setup.client({ stripe: { publishableAPIKey: data.test_pk }}, 'development');
  await setup.client({ stripe: { publishableAPIKey: data.live_pk }}, 'production');
  await setup.env({ key: 'STRIPE_SECRET_API_KEY', value: data.test_sk }); 
  
  // save plans
  const testconfig = await setup.stripe({ secretAPIKey: data.test_sk, freePlan: data.freePlan });  
  await setup.settings({ key: 'stripe', value: testconfig, mode: 'development' }); // save plans

  if (data.live_sk){

    const prodconfig = await setup.stripe({ secretAPIKey: data.live_sk, freePlan: data.freePlan });  
    await setup.settings({ key: 'stripe', value: prodconfig, mode: 'production' }); // save plans

  }

  console.log('✅ Stripe settings updated');
  return res.status(200).send({ message: 'Stripe settings updated' });

};

/*
* setup.mailgun()
* get mailgun settings
*/

exports.mailgun = async function(req, res){

  return res.status(200).send({ data: backendSettings.mailgun });

}

/*
* setup.mailgun.update()
* save mailgun settings
*/

exports.mailgun.update = async function(req, res){

  const data = req.body;
  utility.validate(data, ['apiKey', 'domain', 'host', 'sender']);

  await setup.env({ key: 'MAILGUN_API_KEY', value: data.apiKey }); // save key
  delete data.apiKey;
  
  data.base_url = data.host.includes('eu') ? 'https://api.eu.mailgun.net/v3' : 'https://api.mailgun.net/v3';
  await setup.settings({ key: 'mailgun', value: data }); 

  console.log('✅ Mailgun settings updated');
  return res.status(200).send({ message: 'Mailgun settings updated' });

}

/*
* setup.domain()
* get the domain settings
*/

exports.domain = async function(req, res){

  res.status(200).send({ data: {

    support_email: process.env.SUPPORT_EMAIL,
    production_domain: process.env.PRODUCTION_DOMAIN,
    
  }});
}

/*
* setup.domain.update()
* save the production domain settings
*/

exports.domain.update = async function(req, res){

   // save the production domain
  const data = req.body;
  await setup.settings({ key: 'domain', value: data.domain, mode: 'production' });
  await setup.settings({ key: 'facebook', value: { 
    
    scope: ['email'],
    callback_url: `${data.domain}/auth/facebook/callback`

  }, mode: 'production' });

  await setup.settings({ key: 'twitter', value: {

    scope: [],
    callback_url: `${data.domain}/auth/twitter/callback`

  }, mode: 'production' });

  // save server url in client 
  await setup.client({ server_url: data.domain }, 'production');
  await setup.env({ key: 'PRODUCTION_DOMAIN', value: data.domain }); // save key
  await setup.env({ key: 'SUPPORT_EMAIL', value: data.support_email }); 

  res.status(200).send({ message: 'Domain saved' });
  
}

/*
* setup.auth()
* save the auth/social sign on settings
*/

exports.auth = async function(req, res){

  // save keys
  const data = req.body;
  await setup.env({ key: 'FACEBOOK_APP_ID', value: data.facebook_app_id });
  await setup.env({ key: 'FACEBOOK_APP_SECRET', value: data.facebook_app_secret });
  await setup.env({ key: 'TWITTER_API_KEY', value: data.twitter_api_key });
  await setup.env({ key: 'TWITTER_API_SECRET', value: data.twitter_api_secret });
  res.status(200).send({ message: 'Authentication settings saved '});

}