# Pizza 42 App Sample

This sample React SPA (Single-page app) is to demonstrate Auth0 implementation and capabilities in light of Pizza 42's requirements. This sample is based on the [Auth0 React SPA Quickstart](https://auth0.com/docs/quickstart/spa/react).

## Setup 
1. Clone this repository
2. Rename the `auth_config.sample.json` file to `auth_config.json` and replace all placeholder values with the appropriate values from your Auth0 tenant. `domain`, `clientId` , `audience` and `scope`.
3. `npm install  `
4. `npm start`

## Functionality

1. Integration with Auth0 using the [auth0-spa-js SDK](https://auth0.com/docs/libraries/auth0-single-page-app-sdk) for authentication.
2. Ability for users to sign up, password reset, as well as login using social providers (Google, Facebook).
3. Enriched customer data with customer's previous order history for a more personalised experience. Previous order history added to the ID token issued to the application using [Auth0 Rules](https://auth0.com/docs/rules).
4. Restricting ordering for unverified email addresses, while still allowing users to login to the application.
5. Requesting specific scopes during authentication flow in order to call the protected API endpoints.
