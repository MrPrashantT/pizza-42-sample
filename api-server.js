const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const authConfig = require("./src/auth_config.json");
var ManagementClient = require('auth0').ManagementClient;
const bodyParser = require('body-parser');


const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(express.json());

var auth0Client = new ManagementClient({
  domain: authConfig.domain,
  clientId: authConfig.m2mClientId,
  clientSecret: authConfig.m2mClientSecret,
  scope: 'update:users_app_metadata'
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});


const checkScopes = jwtAuthz([ 'create:order' ]);

app.post("/api/order", checkJwt, async (req, res) => {


  if(!req.user['https://pizza42.com/email_verified']){
    req.status(401).send({
      msg: "Please verify your email before ordering."
    })
  };

  
  const params = { id: req.user.sub };

  let orderHistory = req.user['https://pizza42.com/orderHistory'];
  
  orderHistory.push(req.body.pizzaType);

  let appMetadata = {
    orderHistory: orderHistory
  };

 
  let resp = await auth0Client.updateAppMetadata(params, appMetadata);

  if(resp.error){
    res.status(400).send({
      msg: "Something went wrong"
    });
  }

  res.send({
    msg: "Order successful!",
    pizza: req.body.pizzaType
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
