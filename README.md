# Eventum

Eventum is an event sign up platform designed to be used in student guilds and clubs.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.4.

### Technologies used

* Angular 7
* Angular Material
* JSON Web Tokens
* A tiny bit of bootstrap
* Ton of other node modules

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

### Setup for build

Before building Eventum, you need to configure it properly.
In the `assets/` -directory you will find subfolder called `config/` which holds configurations needed for using the [Eventum API](https://github.com/Natsku123/Eventum-Api).

`config.dev.json` is used to configure your development environment

`config.prod.json` is used to configure your production environment, if you are going to use Eventum as is, then this is the only configuration needed.

Fill the needed fields in the config and you are good to go.

Unless you want to control the color theme...

In `assets` -folder, there is a file called `custom-palettes.scss` which contains my custom color palettes. You can generate those from [this site](http://mcg.mbitson.com/) and replace mine.

Then you must update `styles.scss` in the root of `src` to use your palettes.

You can also replace wanted favicon.ico into `assets/img/favicon.ico` so Eventum will use your own favicon instead of the regular Angular one.

After you are done with your configurations run this command (as owner of the folder or sudo)
```bash
npm install
```
which installs all the needed node modules.

### Build App

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Setting up after build

Eventum has been build inside the `dist/` directory. `dist/` should now contain subdirectory called `Eventum/`. Copy or move that folder inside your `/var/www/` directory and give `www-data` access to it.
```bash
chown www-data:www-data /var/www/Eventum -R
```
Would be the easiest way to do it. So called safer ways may exist tho...

Now if you have Eventum API already running on the same server, you should have nginx and certbot already installed. If not, run this (as root or sudo):
```bash
apt-get update
apt-get install nginx
```

To install certbot (run as root or sudo) (If you used other OS than Ubuntu please check [this site](https://certbot.eff.org/) for installation guide):
```bash
apt-get update
apt-get install software-properties-common
add-apt-repository universe
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install certbot python-certbot-nginx 

```

Now you need to make Nginx serve Eventum. Now we need to write a configuration for it.

Create configuration file for Nginx to run Eventum (run as root or sudo):
```bash
nano /etc/nginx/sites-available/eventum.conf
```

And paste this into it:
```bash
server {


    listen 80;
    listen [::]:80;
    
    root /var/www/Eventum;
    index index.html index.htm;

    server_name example.com www.example.com;

    location / {
        try_files $uri $uri/ /index.html =404;
    }

}
```
Remember to change your own domain to it! (Or IP-address if you really want to)

Next it needs to be enabled (run with root or sudo):
```bash
ln -s /etc/nginx/sites-available/eventum.conf /etc/nginx/sites-enabled/eventum.conf
```

And test if it works with Nginx before actually using it (run with root or sudo):
```bash
nginx -t
```

Then reload Nginx to see if everything went right (and you have pointed your domain to it) (run as root or sudo):
```bash
service nginx reload
```

Now head to `example.com` but replace that with your actual domain and you should see Eventums front page. If you see only a white screen open your browers web console to check if there is any error messages.

You can now see that your browser thinks this site is insecure, this is where certbot comes in.

Run this command and select your domain listed (run with sudo or root)
```bash
certbot --nginx
```

Now you need to reload Nginx (run with root or sudo):
```bash
service nginx reload
```

Now you should be set up! Happy partying and enjoy your events with Eventum!

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
