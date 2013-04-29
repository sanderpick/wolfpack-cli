# Overview

Wolfpack sends you an email each morning. Respond to this email with some notes about your plan for the day. If you have been added to a team by one of your friends or colleagues, they will receive a copy of your reply. Of course, you may add these users to your own teams to see their updates. Wolfpack teams are one-directional for maximum flexibility. Micro updates and team daily / weekly activity recaps should be added soon. User preferences, e.g., time zone, are needed.

# grr
*Command line interface for Wolfpack*

<img src="https://github.com/sanderpick/wolfpack-cli/raw/develop/assets/grr.png"/>

## One-line grr install

    [sudo] npm install grr -g

The global flag, `-g`, will attempt to symlink the `./bin/grr` executable into your `PATH`. You will need to run `sudo` depending on your `npm` `{prefix}` (usually `/usr/local`) permissions.

N.B. grr requires Node 0.8.17. If your package manager isn't giving you the right version, you can pick up the binaries and source code at [nodejs.org](http://nodejs.org/dist/v0.8.17/)

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

## Development

    git clone git@github.com:sanderpick/wolfpack-cli.git
    cd wolfpack-cli
    npm install
    ./bin/grr [commands] [options] --dev

![http://i.imgur.com/pXdMyPg.png](best viewed)    

