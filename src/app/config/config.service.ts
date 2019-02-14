/*
This service is used to read provided configuration files
 */
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import configDev from '../../assets/config/config.dev.json';
import configProd from '../../assets/config/config.prod.json';


@Injectable()
export class AppConfig {
  static settings: any;
  constructor() {}
  load() {

    // Read configuration file based on environment
    if (environment.production) {
      AppConfig.settings = configDev;
    } else {
      AppConfig.settings = configProd;
    }
  }
}
