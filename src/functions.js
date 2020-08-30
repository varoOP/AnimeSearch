'use strict';
const timeConvert = require(`humanize-duration`);

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

module.exports = {
    dealwithtags: function (query) {
        if (query.tags.length <= 1 || query.tags === undefined)
            return ``;
        var tags = `Some spoiler free tags of it include`;
        var tagcount = 0;
        for (let i = 0; i < query.tags.length; i++) {
            if (query.tags[i].isMediaSpoiler === false && tagcount < 3) {
                tags += `, ${query.tags[i].name}`;
                tagcount++;
            }
        }
        var replacement = ' and';
        if (tagcount > 1)
            tags = tags.replace(/,([^,]*)$/, replacement + '$1' + `.`);
        if (tagcount <= 1)
            tags = ``;
        return tags;
    },

    dealwithgenres: function (query) {
        if (query.genres === undefined || query.genres.length === 0)
            return ``;
        var genres = `Genres: `;
        for (let i = 0; i < query.genres.length; i++) {
            genres += `${query.genres[i]}, `;
        }
        return genres.replace(/,([^,]*)$/, '.' + '$1');
    },

    dealwithimage: function (query) {
        if (query.bannerImage === null)
            return `${query.coverImage.medium}`;
        return `${query.bannerImage}`;
    },

    dealwithtitle: function (query) {
        if (query.title.english === null)
            return titleCase(`${query.title.romaji}`);
        return titleCase(`${query.title.english}`);
    },

    dealwithbutton: function (query) {
        if (query.trailer === null)
            return { title: `AniList Page`, url: `${query.siteUrl}` };
        if (query.format === 'MUSIC' && query.trailer !== null)
            return { title: `Watch Music Video on YouTube`, url: `${query.trailer}` };
        return { title: `Watch Trailer on YouTube`, url: `${query.trailer}` };
    },

    dealwithlast: function (query) {
        if (query.trailer === null)
            return `You can go to it's AniList page, by tapping on the button below.`;
        if (query.format === 'MUSIC' && query.trailer !== null)
            return `You can watch it's music video by tapping on the button below.`;
        return `You can watch it's trailer by tapping on the button below.`;
    },

    dealwithnextair: function (query) {
        if (query.nextAiringEpisode === null || query.nextAiringEpisode.timeUntilAiring === null)
            return ``;
        const relOptions = { largest: 3, conjunction: " and ", serialComma: false, units: ['y', 'mo', 'd', 'h', 'm', 's'] };
        if (query.nextAiringEpisode.timeUntilAiring !== null && query.format === 'MOVIE')
            return `It will approximately release in ${timeConvert(query.nextAiringEpisode.timeUntilAiring * 1000, relOptions)}.`;
        if (query.nextAiringEpisode.timeUntilAiring !== null && (query.format === 'TV' || query.format === 'OVA' || query.format === 'ONA' || query.format === 'TV_SHORT' || query.format === 'SPECIAL'))
            return `Episode ${query.nextAiringEpisode.episode} will air in ${timeConvert(query.nextAiringEpisode.timeUntilAiring * 1000, relOptions)}.`;
    },

    dealwithdescription: function (query) {
        if (query.description === null)
            return ``;
        return `${query.description}`.replace(/<br>/g, '');
    },

    dealwithscore: function (query) {
        if (query.averageScore === null)
            return ``;
        return `It has an average score of ${query.averageScore} on AniList.`;
    },

    dealwithlength: function (query) {
        if (query.duration === null)
            return ``;
        const durOptions = { largest: 2, conjunction: " and ", serialComma: false, units: ['h', 'm'] };
        if (query.format === 'MOVIE')
            return `The length of the film is ${timeConvert(query.duration * 60000, durOptions)}.`;
        if (query.format === `MUSIC`)
            return `The length of the music video is ${timeConvert(query.duration * 60000, durOptions)}.`;
        if (query.format === 'TV_SHORT' || query.format === 'SPECIAL')
            return `Each episode is ${timeConvert(query.duration * 60000, durOptions)} long.`;
    },

    dealwithstudio: function (query) {
        if (query.studios.length === 0)
            return ``;
        var studio = `, and it's animation studio is `, studio_r;
        for (let i = 0; i < query.studios.length; i++) {
            if (query.studios[i].isAnimationStudio) {
                studio_r = titleCase(query.studios[i].name);
                break;
            }
        }
        if (studio_r === undefined)
            return ``;
        studio_r = studio_r.replace(/\.$/, '');
        return studio + studio_r;
    },

    dealwithdate: function (query, title) {
        var startDate;
        if (query.startDate.year === null) {
            return `${title} has not released yet`;
        }
        else if (query.startDate.month === null && query.startDate.day === null) {
            return `${title} is slated to release in ${query.startDate.year}`;
        }

        else if (query.startDate.day === null && query.startDate.month !== null) {
            startDate = new Date(query.startDate.year, query.startDate.month - 1);
            return `${title} is slated to release in ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        }

        else if (query.startDate.day !== null) {
            startDate = new Date(query.startDate.year, query.startDate.month - 1, query.startDate.day);
            return `${title} is slated to release on ${startDate.toLocaleDateString('en-US')}`;
        }
    }
};
module.exports.titleCase = titleCase;