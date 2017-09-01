var request = require('superagent');
var config = require('./config').obtain();

const ACCOUNT_MANAGER_URL = 'account.demandware.com/dw/oauth2/access_token';

function obtainToken(basicEncoded, callback) {
    // just do the request with the basicEncoded and call the callback
    request
        .post('https://' + ACCOUNT_MANAGER_URL)
        .set('Authorization', 'Basic ' + basicEncoded)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('grant_type=client_credentials')
        .end(callback);
}

function auth(client, client_secret, auto_renew) {
    var basicString = client + ':' + client_secret;
    var basicEncoded = new Buffer(basicString).toString('base64');

    // progress
    var spinner = new require('cli-spinner').Spinner('Processing... %s')
    spinner.start();

    // attempt to obtain a new token
    obtainToken(basicEncoded, function (err, res) {
        spinner.stop(true);

        if (!err && res.statusCode == 200) {
            // update the client/token locally
            setClient(client);
            setToken(res.body.access_token);
            setAutoRenewToken(auto_renew, ( auto_renew ? basicEncoded : null ));

            console.log('Authentication succeeded, token obtained successfully.' + ( auto_renew ? ' Auto-renewal enabled.' : '' ));
        } else {
            console.error('Error: Authentication failed: %s', err);
        }
    });
}

function renew(callback) {
    // check if allowed, we allow only if flag was provided with initial authentication
    if (!getAutoRenewToken()) {
        console.error('Error: Token renewal not possible. Ensure initial client authentication is done with --renew flag.');
        return;
    }

    // progress
    var spinner = new require('cli-spinner').Spinner('Processing... %s')
    spinner.start();

    var basicEncoded = getAutoRenewBase64();

    // attempt to obtain a new token using the previously stored encoded basic
    obtainToken(basicEncoded, function (err, res) {
        spinner.stop(true);

        if (!err && res.statusCode == 200) {
            // update the token locally
            setToken(res.body.access_token);
            console.log('Token renewal succeeded');
            if(callback) {
                callback();
            }
        } else {
            console.error('Error: Token renewal failed: %s', err);
        }
    });
}

function getClient() {
    return config.get('SFCC_CLIENT_ID');
}

function setClient(client) {
    config.set('SFCC_CLIENT_ID', client);
}

function getToken() {
    return config.get('SFCC_CLIENT_TOKEN');
}

function setToken(token) {
    config.set('SFCC_CLIENT_TOKEN', token);
}

function getToken() {
    return config.get('SFCC_CLIENT_TOKEN');
}

function setAutoRenewToken(flag, base64) {
    config.set('SFCC_CLIENT_RENEW_TOKEN', flag);
    config.set('SFCC_CLIENT_RENEW_BASE', base64);
}

function getAutoRenewToken() {
    return config.get('SFCC_CLIENT_RENEW_TOKEN');
}

function getAutoRenewBase64() {
    return config.get('SFCC_CLIENT_RENEW_BASE');
}

function resetToken() {
    config.delete('SFCC_CLIENT_TOKEN');
}

function clear() {
    config.delete('SFCC_CLIENT_ID');
    config.delete('SFCC_CLIENT_TOKEN');
}

module.exports.auth = auth;
module.exports.renew = renew;
module.exports.getToken = getToken;
module.exports.getClient = getClient;
module.exports.getAutoRenewToken = getAutoRenewToken;
module.exports.getAutoRenewBase64 = getAutoRenewBase64;
module.exports.clear = clear;
module.exports.resetToken = resetToken;