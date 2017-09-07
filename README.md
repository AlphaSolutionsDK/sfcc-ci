# Salesforce Commerce Cloud CI #

The Salesforce Commerce Cloud CI is a command line interface (CLI) for interacting with Commerce Cloud instances from the command line / shell of various operating systems in order to facilitate Continuous Integration practices using Commerce Cloud.

## What is this repository for? ##

The focus of the tool is to streamline and easy the communication with Commerce Cloud instances as part of the CI/CD processes. It focuses on the deployment part supporting quality checks such as test execution, not on the quality checks itself.

**Features:**

* Uses Open Commerce APIs completely
* Authentication using Oauth2 only, no Business Manager user needed
* Supported commands include: save state, code activate, site import, reset state
* Configuration of multiple instances
* Aliasing of instances
* Automatic renewal of Oauth2 token

## How do I get set up? ##

### Prerequisites ###

Ensure you have a valid Open Commerce API client ID set up. You'll need the client ID as well as the client secret. If you don't have a Open Commerce API client ID yet, you can create one using the [Account Manager](https://account.demandware.com).

### Configuration ###

In order to perform certain commands the tool provides, you need to give permission to do that on your Commerce Cloud instance(s). You can do that by modifying the Open Commerce API Settings. 

1. Log into the Business Manager
2. Navigate to Administration > Site Development > Open Commerce API Settings
3. Make sure, that you select _Data API_ and _Global_ from the select boxes
4. Add the permission set for your client ID to the settings. 

Use the following snippet as your client's permission set, replace `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` with your client ID:

    {
      "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "resources":
      [
        {
          "resource_id":"/code_versions/*",
          "methods":["patch"],
          "read_attributes":"(**)",
          "write_attributes":"(**)"
        },
        {
          "resource_id":"/jobs/*/executions",
          "methods":["post"],
          "read_attributes":"(**)",
          "write_attributes":"(**)"
        },
        {
          "resource_id":"/jobs/*/executions/*",
          "methods":["get"],
          "read_attributes":"(**)",
          "write_attributes":"(**)"
        }
      ]
    }
    
Note, if you already have OCAPI Settings configured, e.g. for other clients, add this snippet to the list permission sets for the other clients as follows:

    {
      "_v":"17.7",
      "clients":
      [ 
        {
          ...
        },
        <!-- the new permission set goes here -->
      ]
    }

### Dependencies ###

You need Node.js and npm to be installed. No other dependencies.

### Installation Instructions ###

* Make sure Node.js and npm are installed.
* Clone or download this tool.
* `cd` into the directory and run `npm install`

You are now ready to use the tool by running the main command `sfcc-ci`. 

## Using the Command Line Interface ##

Use `sfcc-ci --help` to get started and see the list of commands available:

```
  Usage: sfcc-ci [options] [command]

  Options:

    -h, --help  output usage information

  Commands:

    client:auth [options] <client> <secret>           Authenticate an Commerce Cloud Open Commerce API client
    client:auth:renew                                 Renews the client authentication. Requires the initial client authentication to be run with the --renew option.
    client:auth:token                                 Return the current authentication token
    client:clear                                      Clears the Commerce Cloud Open Commerce API client settings
    instance:add <instance> [alias]                   Adds a new Commerce Cloud instance to the list of configured instances
    instance:set <alias>                              Sets a Commerce Cloud instance as the current default instance
    instance:clear                                    Clears all configured Commerce Cloud instances
    instance:list [options]                           List instance and client details currently configured
    instance:state:save [options]                     Perform a save of the state of a Commerce Cloud instance
    instance:state:reset [options]                    Perform a reset of a previously saved state of a Commerce Cloud instance
    code:activate [options] <version>                 Activate the custom code version on a Commerce Cloud instance
    import:site [options] <import_file>               Perform a site import on a Commerce Cloud instance
    job:run [options] <job_id> [job_parameters...]    Starts a job execution on a Commerce Cloud instance
    job:status [options] <job_id> <job_execution_id>  Get the status of a job execution on a Commerce Cloud instance

  Detailed Help:

    Use sfcc-ci <sub:command> --help to get detailed help and example usage of sub:commands
```

Use `sfcc-ci <sub:command> --help` to get detailed help and example usage of a sub:command.

## Using the JavaScript API ##

There is a JavaScript API available, which you can use to program against and integrate the commands into your own project.

Make sfcc-ci available to your project by specifying the dependeny in your `package.json` first and running and `npm install` in your package. After that you require the API into your implementation using:

```
  const sfcc = require('sfcc-ci');
```

The API is structured into sub modules. You may require sub modules directly, e.g.

```
  const sfcc_auth = require('sfcc-ci').auth;
  const sfcc_code = require('sfcc-ci').code;
  const sfcc_job = require('sfcc-ci').job;
```

The following APIs are available (assuming `sfcc` refers to `require('sfcc-ci')`):

```
  sfcc.auth.auth(client_id, client_secret, success, error);
  sfcc.code.activate(instance, code_version, token, success, error);
  sfcc.job.run(instance, job_id, job_params, token, success, error);
  sfcc.job.status(instance, job_id, job_execution_id, token, success, error);
```

### Authentication ###

APIs available in `require('sfcc-ci').auth`:

`auth(client_id, client_secret[, success][, error])`

Authenticates a clients and attempts to obtain a new Oauth2 token. Note, that tokens should be reused for subsequent operations. In case of a invalid token you may call this method again to obtain a new token.

Param         | Type        | Description
------------- | ------------| --------------------------------
client_id     | (String)    | The client ID
client_secret | (String)    | The client secret
success       | (Function)  | *(Optional)* Callback function executed when the authentication succeeded. The token will be passed as only parameter to the success callback.
error         | (Function)  | *(Optional)* Callback function executed when the authentication failed. The error will be passed as only parameter to the error callback.

**Returns:** (String) Returns the token, if the authentication succeeded and no success callback was used. Returns the error, if the authentication failed and no error callback was used.

***

### Code ###

APIs available in `require('sfcc-ci').code`:

`activate(instance, code_version, token[, success][, error])`

Activate the custom code version on a Commerce Cloud instance. You may pass an optional success and error callback function to further handle success.

Param         | Type        | Description
------------- | ------------| --------------------------------
instance      | (String)    | The instance to activate the code on
code_version  | (String)    | The code version to activate
token         | (String)    | The Oauth token to use use for authentication
success       | (Function)  | *(Optional)* function executed when the code activation succeeded.
error         | (Function)  | *(Optional)* function executed when the code activation failed. The error will be passed as only parameter to the error callback.

**Returns:** (String|Boolean) True, if the code activation succeeded and no success callback was used. Returns the error, if the code activation failed and no error callback was used.

***

### Jobs ###

APIs available in `require('sfcc').job`:

`run(instance, job_id, job_params, token[, success][, error])`

Starts a job execution on a Commerce Cloud instance. The job is triggered and the result of the attempt to start the job is returned. You may use the API function status to get the current job execution status.

Param         | Type        | Description
------------- | ------------| --------------------------------
instance      | (String)    | Instance to start the job on
job_id        | (String)    | The job to start
token         | (String)    | The Oauth token to use use for authentication
job_params    | (Array)     | Array containing job parameters. A job parameter must be denoted by an object holding a key and a value property.
success       | (Function)  | Callback function executed when starting the job succeeded. The job execution id will be passed as only parameter to the success callback
error         | (Function)  | Callback function executed when starting the job failed. The error will be passed as only parameter to the error callback.

**Returns:** (String|Boolean) True, if the job start succeeded and no success callback was used. Returns the error, if the job start failed and no error callback was used.

***

`status(instance, job_id, job_execution_id, token[, success][, error])`

Get the status of a job execution on a Commerce Cloud instance.

Param            | Type        | Description
---------------- | ------------| --------------------------------
instance         | (String)    | Instance the job was executed on.
job_id           | (String)    | The job to get the execution status for
job_execution_id | (String)    | The job execution id to get the status for
token            | (String)    | The Oauth token to use use for authentication
success          | (Function)  | Callback function executed when getting the job execution status succeeded. The job execution details will be passed as only parameter to the success callback
error            | (Function)  | Callback function executed when getting the job execution status failed. The error will be passed as only parameter to the error callback.

**Returns:** (Object|Boolean) Execution details, if getting the job execution status succeeded and no success callback was used. Returns false, if the getting the job execution status failed and no error callback was used.

***
