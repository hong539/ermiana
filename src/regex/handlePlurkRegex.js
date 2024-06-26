import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { messageSender } from '../events/messageSender.js';
// import { messageSubSender } from '../events/messageSubSender.js';
import { embedSuppresser } from '../events/embedSuppresser.js';
import { typingSender } from '../events/typingSender.js';
import { messageSenderMore } from '../events/messageSenderMore.js';

export async function handlePlurkRegex( result, message ) {
  typingSender(message);
  try {
    const plurkHTML = await axios.request({
      url: 'https://www.plurk.com/p/' + result[1],
      method: 'get',
      timeout: 2500,
    });

    const $ = cheerio.load(plurkHTML.data);

    const rePlurk = $('script').text().match(/"replurkers_count": (\d+),/)[1] || '0';
    const favPlurk = $('script').text().match(/"favorite_count": (\d+),/)[1] || '0';
    const respPlurk = $('script').text().match(/"response_count": (\d+),/)[1] || '0';

    const rawPlurkIndex = $('script').text().indexOf('content_raw') || -1;
    const picPlurk = $('script').text().slice(rawPlurkIndex).match(/https:\/\/images\.plurk\.com\/[^\\"\s]+/g) || [];

    const plurkEmbed = new EmbedBuilder();
    plurkEmbed.setColor(0xefa54c);
    plurkEmbed.setTitle($('.name').text());
    plurkEmbed.setURL('https://www.plurk.com/p/' + result[1]);
    try {
      plurkEmbed.setDescription($('.text_holder').text());
    } catch {}
    try {
      if (picPlurk.length > 0) {
        plurkEmbed.setImage(picPlurk[0]);
      }
    } catch {}

    const plurkInfo = '💬' + respPlurk + ' 🔁' + rePlurk + ' ❤️' + favPlurk;

    try {
      if (!picPlurk || picPlurk.length == 0) {
        messageSender(message, plurkEmbed, plurkInfo);
        embedSuppresser(message);
      } else if (picPlurk.length == 1) {
        messageSender(message, plurkEmbed, plurkInfo);
        embedSuppresser(message);
      } else if (picPlurk.length > 1) {
        const imageArray =[];
        picPlurk.filter((_pic, index) => index > 0 && index < 4)
            .forEach((pic) => {
              imageArray.push(pic);
            });
        messageSenderMore(message, plurkEmbed, plurkInfo, imageArray);
        embedSuppresser(message);
      }
    } catch {}

    /*
    messageSender(message, plurkEmbed, plurkInfo);

    try {
      if (picPlurk.length > 1) {
        picPlurk.filter((_pic, index) => index > 0 && index < 4)
            .forEach((pic) => {
              const picEmbed = new EmbedBuilder();
              picEmbed.setColor(0xefa54c);
              picEmbed.setImage(pic);
              messageSubSender(message, picEmbed, 'ermiana');
            });
      }
    } catch {}

    embedSuppresser(message);

    */
  } catch {
    console.log('plurk error: '+ message.guild.name);
  }
};
