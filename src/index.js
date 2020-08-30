'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const anilist = require('anilist-node');
const Anilist = new anilist();
const {
  dialogflow,
  Carousel,
  Image,
  Button,
  BasicCard,
  Suggestions,
} = require('actions-on-google');

const app = dialogflow();
const deal = require('./functions');
const queries = require('./query');
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'/path/to/logfile',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );

app.intent('Welcome', conv => {
  conv.ask(`Which anime would you like to search for?`);
  conv.ask(new Suggestions('Naruto', 'Bleach', 'One Piece'));
});

app.intent('search_anime', async (conv, params) => {
  const anime = params.anime;
  var searchfor = deal.titleCase(anime.trim());
  log.info(`Search Query: ` + searchfor)
  const data = await Anilist.search(`anime`, `${searchfor}`, 1, 10);
  const id_array = [];
  const search_result = [];
  if (data.media.length >= 1) {
    if (data.media.length === 1)
      conv.data.exactMatch = true;
    if (!conv.data.exactMatch)
      for (let i = 0; i < data.media.length; i++) {
        if (deal.dealwithtitle(data.media[i]).toLowerCase() == searchfor.toLowerCase()) {
          conv.data.exactMatch = true;
          console.log(`Exact matched: ` + deal.dealwithtitle(data.media[i]).toLowerCase());
        }
      }
    if (!conv.data.exactMatch) {
      for (let i = 0; i < data.media.length; i++) {
        id_array.push(data.media[i].id);
      }
      for (let i = 0; i < id_array.length; i++) {
        const query = await Anilist.media.anime(id_array[i]);
        query.sortthis = i + 1;
        if (!query.isAdult)
          search_result.push(query);
      }
      if (search_result.length > 1) {
        let carouselItems = {};
        let idtokeymap = {};
        search_result.forEach(animu => {
          let itemdetails = {
            title: `${deal.dealwithtitle(animu)}`,
            image: new Image({
              url: animu.coverImage.large,
              alt: `Cover image of ${deal.dealwithtitle(animu)}.`,
            }),
          };
          let map = {
            key: animu.sortthis,
            ani_id: animu.id,
          };
          carouselItems[animu.sortthis] = itemdetails;
          idtokeymap[animu.sortthis] = map;
        });
        conv.data.store = idtokeymap;
        log.info(idtokeymap);
        conv.data.num = carouselItems;
        conv.ask(`Maybe, your anime is one of these? Please choose one by tapping on it or by calling out it's name.`, new Carousel({
          title: `Anime Search Result`,
          items: carouselItems,
        }));
        conv.data.var = false;
      }
      else if (search_result.length === 1) {
        const query = search_result[0];
        const title = deal.dealwithtitle(query);
        conv.close(queries.dealwithquery(query), new BasicCard({
          text: deal.dealwithdescription(query),
          subtitle: deal.dealwithgenres(query),
          title: title,
          buttons: new Button(deal.dealwithbutton(query)),
          image: new Image({
            url: deal.dealwithimage(query),
            alt: `Cover image of ${title}.`,
          }),
        }));
      }
      else {
        conv.ask(`No result found! Please speak clearly or try an alternative name. Would you like to search for it again?`, new Suggestions('Yes', 'No'));
        conv.data.var = true;
      }
    }
    else if (conv.data.exactMatch) {
      const query = await Anilist.media.anime(data.media[0].id);
      const title = deal.dealwithtitle(query);
      if (!query.isAdult)
        conv.close(queries.dealwithquery(query), new BasicCard({
          text: deal.dealwithdescription(query),
          subtitle: deal.dealwithgenres(query),
          title: title,
          buttons: new Button(deal.dealwithbutton(query)),
          image: new Image({
            url: deal.dealwithimage(query),
            alt: `Cover image of ${title}.`,
          }),
        }));
      if (query.isAdult) {
        conv.ask(`No result found! Please speak clearly or try an alternative name. Would you like to search for it again?`, new Suggestions('Yes', 'No'));
        conv.data.var = true;
      }
    }
  }
  else {
    conv.ask(`No result found! Please speak clearly or try an alternative name. Would you like to search for it again?`, new Suggestions('Yes', 'No'));
    conv.data.var = true;
  }
});

app.intent('handle_carousel', async (conv, params, option) => {
  const key = parseInt(option);
  const idkeymap = conv.data.store;
  const ani_id = idkeymap[key].ani_id;
  const query = await Anilist.media.anime(ani_id);
  const title = deal.dealwithtitle(query);
  conv.close(queries.dealwithquery(query), new BasicCard({
    text: deal.dealwithdescription(query),
    subtitle: deal.dealwithgenres(query),
    title: title,
    buttons: new Button(deal.dealwithbutton(query)),
    image: new Image({
      url: deal.dealwithimage(query),
      alt: `Cover image of ${title}.`,
    }),
  }));
});

app.intent('search_anime - yes', async (conv) => {
  conv.followup('WELCOME', {});
});

app.intent('fallback', async (conv) => {
  if (!conv.data.var) {
    conv.ask(`Please select one option by tapping on it or calling out it's name.`);
    conv.ask(`Maybe, your anime is one of these?`, new Carousel({
      title: `Anime Search Result`,
      items: conv.data.num,
    }));
  }
  else conv.ask(`Sorry I didn't get that. Would you like to search for that anime again?`, new Suggestions('Yes', 'No'));
});

app.intent('fallback - yes', async (conv) => {
  conv.followup('WELCOME', {});
});

const expressApp = express().use(bodyParser.json());

expressApp.post('/fulfillment', app);

expressApp.listen(9998, '127.0.0.1');
