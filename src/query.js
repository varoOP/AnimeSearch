const functions = require(`./functions`);
const timeConvert = require(`humanize-duration`);
function dealwithtags(query) {
    if(query.tags.length <= 1 || query.tags === undefined)
    return ``;
    var tags = `Some spoiler free tags of it include`;
    var tagcount = 0;
    for (i = 0; i < query.tags.length; i++) {
        if (query.tags[i].isMediaSpoiler === false && tagcount < 3) {
            tags += `, ${query.tags[i].name}`;
            tagcount++;
        }
    }
    replacement = ' and';
    if (tagcount > 1)
    tags = tags.replace(/,([^,]*)$/, replacement + '$1'+`.`);
    if(tagcount <= 1)
    tags = ``;
    return tags;
}

function dealwithgenres(query) {
    if(query.genres === undefined || query.genres.length === 0)
    return ``;
    var genres = `Genres: `;
    for (i = 0; i < query.genres.length; i++) {
            genres += `${query.genres[i]}, `;
    }
    return genres.replace(/,([^,]*)$/, '.' + '$1');
}

function dealwithimage(query){
    if(query.bannerImage === null)
    return `${query.coverImage.medium}`;
    return `${query.bannerImage}`;
}

function dealwithtitle(query){
    if(query.title.english === null)
    return `${query.title.romaji}`;
    return `${query.title.english}`;
}

function dealwithbutton(query){
    if(query.trailer === null)
    return {title: `AniList Page`, url: `${query.siteUrl}`};
    if(query.format === 'MUSIC' && query.trailer !== null)
    return {title: `Watch Music Video on YouTube`, url: `${query.trailer}`};
    return {title: `Watch Trailer on YouTube`, url: `${query.trailer}`};
}

function dealwithlast(query){
    if(query.trailer === null)
    return `You can go to it's AniList page, by tapping on the button below.`;
    if(query.format === 'MUSIC' && query.trailer !== null)
    return `You can watch it's music video by tapping on the button below.`;
    return `You can watch it's trailer by tapping on the button below.`;
}

function dealwithnextair(query){
    if(query.nextAiringEpisode === null || query.nextAiringEpisode.timeUntilAiring === null)
    return ``;
    const relOptions = {largest:3, conjunction:" and ", serialComma:false, units: ['y', 'mo', 'd', 'h', 'm', 's']};
    if(query.nextAiringEpisode.timeUntilAiring !== null && query.format === 'MOVIE')
    return `It will approximately release in ${timeConvert(query.nextAiringEpisode.timeUntilAiring*1000, relOptions)}.`;
    if(query.nextAiringEpisode.timeUntilAiring !== null && (query.format === 'TV' || query.format === 'OVA' || query.format === 'ONA'))
    return `Episode ${query.nextAiringEpisode.episode} will air in ${timeConvert(query.nextAiringEpisode.timeUntilAiring*1000, relOptions)}.`;
}

function dealwithdescription(query){
    if(query.description === null)
    return ``;
    return `${query.description}`.replace(/<br>/g, '');
}

function dealwithscore(query){
    if(query.averageScore === null)
    return ``;
    return `It has an average score of ${query.averageScore} on AniList.`;
}

function dealwithlength(query){
    if(query.duration === null)
    return ``;
    const durOptions = {largest:2, conjunction:" and ", serialComma:false, units: ['h', 'm']};
    if(query.format === 'MOVIE')
    return `The length of the film is ${timeConvert(query.duration*60000, durOptions)}.`;
    if(query.format === `MUSIC`)
    return `The length of the music video is ${timeConvert(query.duration*60000, durOptions)}.`;
}

function dealwithstudio(query){
    if(query.studios.length === 0)
    return ``;
    var studio = `, and it's animation studio is `, studio_r;
    for(i=0; i<query.studios.length; i++){
        if(query.studios[i].isAnimationStudio){
           studio_r = query.studios[i].name;
           break;
        }
    }
    if(studio_r === undefined)
    return ``;
    studio_r = studio_r.replace(/\.$/, '');
    return studio+studio_r;
}

function dealwithdate(query, title){
    if(query.startDate.year === null){
        return `${title} has not released yet`;
    }
                
    else if(query.startDate.month === null && query.startDate.day === null){
        return `${title} is slated to release in ${query.startDate.year}`;
    }
    
    else if(query.startDate.day === null && query.startDate.month !== null){
        startDate = new Date(query.startDate.year, query.startDate.month-1);
        return `${title} is slated to release in ${startDate.toLocaleDateString('en-US', {month : 'long', year: 'numeric'})}`;
    }

    else if(query.startDate.day !== null){
        startDate = new Date(query.startDate.year, query.startDate.month-1, query.startDate.day);
        return `${title} is slated to release on ${startDate.toLocaleDateString('en-US')}`;
    }
}

function dealwithquery(query) {
    var title = dealwithtitle(query);
    var tags = dealwithtags(query);
    var last = dealwithlast(query);
    var next = dealwithnextair(query);
    var startDate = new Date(query.startDate.year, query.startDate.month-1, query.startDate.day);
    var length = dealwithlength(query);
    var score = dealwithscore(query);
    var studio = dealwithstudio(query);
    var date = dealwithdate(query, title);
    switch(query.format){
        case 'MOVIE':
            if(query.status === 'FINISHED'){
                return `${title} released on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
            }
            else if(query.status === 'NOT_YET_RELEASED'){
                return `${date}${studio}. ${next} ${tags} ${last}`;
            }

            else if(query.status === `CANCELLED`){
                return `${title} is a movie that has been cancelled. ${last} Thank you for using Anime Search!`;
            }
            else{ 
                return `${title} is a movie that started releasing on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last} Thank you for using Anime Search!`;
            }
            break;

        case 'TV':
        case 'ONA':
        case 'OVA':
            if(query.status === 'RELEASING'){
                return `${title} started airing on ${startDate.toLocaleDateString('en-US')}${studio}. ${next} ${score} ${tags} ${last}`;
            }
            
            else if(query.status === 'FINISHED'){
                var endDate = new Date(query.endDate.year, query.endDate.month-1, query.endDate.day);
                return `${title} started airing on ${startDate.toLocaleDateString('en-US')}, finished airing on ${endDate.toLocaleDateString('en-US')} with a total of ${query.episodes} episode(s)${studio}. ${score} ${tags} ${last}`;
            }

            else if(query.status === 'NOT_YET_RELEASED'){
                return `${date}${studio}. ${next} ${tags} ${last}`;
            }

            else if(query.status === 'CANCELLED'){
                return `${title} is an Anime that has been cancelled. ${last}\n Thank you for using Anime Search!`;
            }
            break;
            
        case 'MUSIC':
            if(query.status === 'FINISHED'){
                return `${title} is a music video that released on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
            }
            
            else if(query.status === 'RELEASING'){
                return `${title} is a series of music videos that started releasing on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
            }
            
            else if(query.status === 'CANCELLED'){
                return `${title} is a music video that has been cancelled. ${last} Thank you for using Anime Search!`;
            }
            else return `${title} is a music video. ${tags} ${score} ${last}`;
            break;
        
        default: return `${title} is of the ${query.format.toLowerCase()} format. ${tags} ${last} Thank you for using Anime Search!`;
    }
}

module.exports.dealwithquery = dealwithquery;
module.exports.dealwithgenres = dealwithgenres;
module.exports.dealwithimage = dealwithimage;
module.exports.dealwithtitle = dealwithtitle;
module.exports.dealwithbutton = dealwithbutton;
module.exports.dealwithdescription = dealwithdescription;