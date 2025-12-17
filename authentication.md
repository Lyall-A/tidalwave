## How TIDAL authenticates a browser
* Browser sends request to `https://login.tidal.com/api/email/user/existing` containing a client ID, code challenge, redirect URI, scope, login credentials and more
* Browser sends request to `https://login.tidal.com/success` which redirects to `https://tidal.com/login/auth`, containing the code
* Browser requests token using the `authorization_code` grant type

## How TIDAL authenticates a Android TV (a "Limited Input Device")
* App sends request to `https://auth.tidal.com/v1/oauth2/device_authorization` containing client ID and scope. Response contains a device code, user code, how long the user code is valid for and a interval for requesting the token
* App periodically requests a token using the `urn:ietf:params:oauth:grant-type:device_code` grant type to verify sign in, request contains client ID, client secret, the device code from earlier and more

## How to use access token from TIDAL's iOS app
NOTE: access tokens are temporary and will expire, I was unable to find a method to retrieve the refresh token in the app.
This can be used to download using Dolby Atmos.
* Log in to TIDAL with tidalwave like normal to setup the `secrets.json` file
* Set up a proxy (such as HTTP Catcher)
* Launch TIDAL (use the same account used to sign in for tidalwave)
* Look for any requests to `api.tidal.com` in your proxy requests
* Copy the `Authorization` request header
* Change `tokenType` in `secrets.json` to the start of the `Authorization` header (should always be `Bearer`)
* Change `accessToken` in `secrets.json` to the rest of the `Authorization` header
* Increase `accessTokenExpiry` by adding a 0 to the end (so tidalwave doesn't try to refresh the token early)