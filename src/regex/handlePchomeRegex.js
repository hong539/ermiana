import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { messageSender } from '../common/messageSender.js';

export async function handlePchomeRegex( result, message ) {
  try {
    await message.channel.sendTyping();
  } catch {}
  try {
    const pcid = result[1];
    const str = result[0];

    const url1 = 'https://ecapi-cdn.pchome.com.tw/ecshop/prodapi/v2/prod/' + pcid + '&fields=Name,Nick,Price,Pic&_callback=jsonp_prod&2837602?_callback=jsonp_prod';
    const resp1 = await axios.request({
      method: 'get',
      url: url1,
    });

    // const namestr = unescape(resp1.data.match(/"Name":"([^"]+)"/)[1].replace(/\\u/g, '%u'));
    const nickstr = unescape(resp1.data.match(/"Nick":"(.*?)",/)[1].replace(/\\u/g, '%u')).replace(/<.*?>/g, '').replace(/\\/g, '');
    const pricestr = unescape(resp1.data.match(/"P":(\d+)/)[1].replace(/\\u/g, '%u'));
    const picstr = unescape(resp1.data.match(/"B":"(.*?)",/)[1].replace(/\\u/g, '%u'));
    const picurl = 'https://img.pchome.com.tw/cs' + picstr.replace(/\\/g, '');

    const url2 = 'https://ecapi-cdn.pchome.com.tw/cdn/ecshop/prodapi/v2/prod/' + pcid + '/desc&fields=Meta,SloganInfo&_callback=jsonp_desc?_callback=jsonp_desc';
    const resp2 = await axios.request({
      method: 'get',
      url: url2,
    });

    const brandstr = unescape(resp2.data.match(/BrandNames":\[(.*?)\]/)[1].replace(/\\u/g, '%u')).replace(/","/g, '_').replace(/^"|"$/g, '');
    const sloganstr = unescape(resp2.data.match(/SloganInfo":\[(.*?)\]/)[1].replace(/\\u/g, '%u')).replace(/","/g, '\n').replace(/^"|"$/g, '');

    const pchomeEmbed = new EmbedBuilder();
    pchomeEmbed.setColor(0xEA1717);
    pchomeEmbed.setTitle(nickstr);
    pchomeEmbed.setURL(str);
    try {
      pchomeEmbed.setDescription(sloganstr);
    } catch {}
    try {
      pchomeEmbed.addFields(
          { name: '品牌', value: brandstr, inline: true },
          { name: '價格', value: pricestr, inline: true },
      );
    } catch {}
    try {
      pchomeEmbed.setImage(picurl);
    } catch {}

    messageSender(message.channel, pchomeEmbed, 'ermiana');
  } catch {
    // console.log('pchome error');
  }
};
