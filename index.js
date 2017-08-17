#!/usr/bin/env node
var program = require('commander');

program
    .command('client:auth <client> <secret>')
    .option('-r, --renew','Controls whether the authentication should be automatically renewed, once the token expires.')
    .description('Authenticate an Commerce Cloud Open Commerce API client')
    .action(function(client, secret, options) {
        var renew = ( options.renew ? options.renew : false );
        require('./lib/auth').auth(client, secret, renew);
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci client:auth aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        console.log('    $ sfcc-ci client:auth aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -r');
        console.log();
    });

program
    .command('client:clear')
    .description('Clears the Commerce Cloud Open Commerce API client settings')
    .action(function() {
        require('./lib/auth').clear();
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci client:clear');
        console.log();
    });

program
    .command('instance:config <instance> [alias]')
    .description('Adds a new Commerce Cloud instance to the list of configured instances')
    .action(function(instance, alias) {
        require('./lib/instance').config(instance, ( alias ? alias : instance ));
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci instance:config my-instance.demandware.net');
        console.log('    $ sfcc-ci instance:config my-instance.demandware.net my-instance');
        console.log();
    });

program
    .command('instance:set <alias>')
    .description('Sets a Commerce Cloud instance as the current default instance')
    .action(function(alias) {
        require('./lib/instance').setDefault(alias);
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci instance:set my-instance');
        console.log();
    });

program
    .command('instance:clear')
    .description('Clears all configured Commerce Cloud instances')
    .action(function() {
        require('./lib/instance').clearAll();
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci instance:clear');
        console.log();
    });

program
    .command('instance:list')
    .option('-v --verbose', 'Outputs additional details of the current configuration')
    .description('List instance and client details currently configured')
    .action(function(options) {
        var verbose = ( options.verbose ? options.verbose : false );
        require('./lib/instance').list(verbose);
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci instance:list');
        console.log('    $ sfcc-ci instance:list -v');
        console.log();
    });
    });

program
    .command('import:site <instance> <import_file>')
    .description('Perform a site import on Commerce Cloud instance')
    .action(function(instance, import_file) {
        console.log('perform site import of "%s" on instance "%s"', import_file, instance);
    });

program
    .command('code:upload <instance> <repository>')
    .description('Upload the custom code repository to a Commerce Cloud instance')
    .action(function(instance, repository) {
        console.log('upload custom code "%s" onto instance "%s"', repository, instance);
    });

program
    .command('code:activate <instance> <version>')
    .description('Activate the custom code version on a Commerce Cloud instance')
    .action(function(instance, version) {
        console.log('activate code "%s" on instance "%s"', version, instance);
    });

program
    .command('job:run <job_id> [job_parameters...]')
    .option('-i, --instance <instance>','Instance to run the job on. Can be an instance alias. If not specified the currently configured instance will be used.')
    .description('Starts a job execution on a Commerce Cloud instance')
    .action(function(job_id, job_parameters, options) {
        var job_params = require('./lib/job').buildParameters(job_parameters);
        var instance = require('./lib/instance').getInstance(options.instance);

        require('./lib/job').run(instance, job_id, { 
            parameters : job_params 
        });
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci job:run my-job');
        console.log('    $ sfcc-ci job:run my-job param1=value1 param2=value2');
        console.log('    $ sfcc-ci job:run my-job -i my-instance-alias');
        console.log('    $ sfcc-ci job:run my-job -i my-instance-alias param1=value1 param2=value2');
        console.log('    $ sfcc-ci job:run my-job -i my-instance.demandware.net');
        console.log('    $ sfcc-ci job:run my-job -i my-instance.demandware.net param1=value1 param2=value2');
        console.log();
    });

program
    .command('job:status <job_id> <job_execution_id>')
    .option('-i, --instance <instance>','Instance the job was executed on. Can be an instance alias. If not specified the currently configured instance will be used.')
    .option('-v --verbose', 'Outputs additional details of the job execution')
    .description('Get the status of a job execution on a Commerce Cloud instance')
    .action(function(job_id, job_execution_id, options) {
        var instance = require('./lib/instance').getInstance(options.instance);
        var verbose = ( options.verbose ? options.verbose : false );
        
        require('./lib/job').status(instance, job_id, job_execution_id, verbose);
    }).on('--help', function() {
        console.log('');
        console.log('  Examples:');
        console.log();
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id');
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id -v');
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id -i my-instance-alias');
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id -v -i my-instance-alias');
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id -i my-instance.demandware.net');
        console.log('    $ sfcc-ci job:status my-job my-job-execution-id -v -i my-instance.demandware.net');
        console.log();
    });

program.parse(process.argv);