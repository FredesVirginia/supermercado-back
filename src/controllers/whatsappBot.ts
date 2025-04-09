import { Client, LocalAuth } from 'whatsapp-web.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import qrcode from 'qrcode-terminal';


puppeteer.use(StealthPlugin());


import * as waWebJS from 'whatsapp-web.js';
// @ts-ignore
waWebJS.puppeteer = puppeteer;

export const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'supermercado' }),
  puppeteer: {
   
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: executablePath(),
    headless: false,
  },
});

export const initializeWhatsapp = () => {
    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });
  
    client.on('ready', () => {
      console.log('✅ WhatsApp listo!');
    });
  
    client.on('auth_failure', () => {
      console.log('❌ Fallo en la autenticación');
    });
  
    client.initialize();
  };
