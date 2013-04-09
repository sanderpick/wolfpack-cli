# grr
*Lightweight team updates*


## One-line grr install

    [sudo] npm install grr -g


## Command Line Usage

`grr` is mostly self-documenting. Try any of these commands to get started.


   **Usage:**
   
     grr <resource> <action> <param1> <param2> ...
   
   **Common Commands:**

   *To sign up*

     grr signup

   *To log in*

     grr login
   
   *Lists all teams for the current user*
   
     grr list

   *Lists all users*
   
     grr users list

   *Create a new team*
   
     grr teams create <name>
   
   *Add a user to an existing team*
   
     grr teams add <username> <name>
   
   *Additional Commands*
   
     grr teams
     grr users
     grr conf
     grr logout

### Help

`grr` is mostly self documenting. We suggest just trying it out. All commands will yield friendly messages if you specify incorrect parameters.

     grr help
     grr help teams
     grr help users
     grr help config

## .grrconf file

All configuration data for your local `grr` install is located in the *.grrconf* file in your home directory. Directly modifying this file is not really advised. You should be able to make all configuration changes via:

    grr config

If you need to have multiple configuration files, use --localconf or --grrconf options.

Some Examples:

    grr config set colors false   # disable colors
    grr config set timeout 480000 # set request timeouts to 8 minutes
    grr config set protocol https # Always use HTTP Secure

##grr options

    grr [commands] [options]
 
    --version             print grr version and exit
    --localconf           search for .grrconf file in ./ and then parent directories
    --grrconf [file]      specify file to load configuration from
    --dev                 target a development API server* running locally
    --debug               show more verbose output
*Checkout the other half of Wolfpack, [wolfpack-server](https://github.com/sanderpick/wolfpack-server).
