# ADASH Monitor

ADASH Monitor is the interface used by [ADASH Cli](https://github.com/xinitrc86/adash-cli) for monitoring. It works as a standalone UI5 application consuming services from a [ADASH Services](https://github.com/xinitrc86/adash-services) installed and set up at your(s) ABAP backend(s).

## Install

```bash
# with npm
git clone (https://github.com/xinitrc86/adash-monitor)
cd adash-monitor
npm install

```

## Usage

```bash
npm run-script serve
...

```
**Monitor**

![Monitor](https://raw.githubusercontent.com/xinitrc86/adash-cli/master/doc/images/monitor.gif)

**Watch**

![Watch](https://raw.githubusercontent.com/xinitrc86/adash-cli/master/doc/images/watch.gif)

## Environment variables 

ADASH Cli will look for the following environment variables when not provided trough the cli.

ADASH_USERNAME

ADASH_PASSWORD

ADASH_HOST

ADASH_ENDPOINT

### Help/Contribution

## Help Needed!
Any help or even suggestions are welcome. 
Specially on downporting the services as they currently relly on too many new syntax elements...anyone knows any abap transpiler? ;)




