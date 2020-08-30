const deal = require(`./functions`);
module.exports = {
    dealwithquery: function (query) {
        var title = deal.dealwithtitle(query);
        var tags = deal.dealwithtags(query);
        var last = deal.dealwithlast(query);
        var next = deal.dealwithnextair(query);
        var startDate = new Date(query.startDate.year, query.startDate.month - 1, query.startDate.day);
        var length = deal.dealwithlength(query);
        var score = deal.dealwithscore(query);
        var studio = deal.dealwithstudio(query);
        var date = deal.dealwithdate(query, title);
        switch (query.format) {
            case 'MOVIE':
                if (query.status === 'FINISHED') {
                    return `${title} released on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
                }
                else if (query.status === 'NOT_YET_RELEASED') {
                    return `${date}${studio}. ${next} ${tags} ${last}`;
                }

                else if (query.status === `CANCELLED`) {
                    return `${title} is a movie that has been cancelled. ${last} Thank you for using Anime Search!`;
                }
                else {
                    return `${title} is a movie that started releasing on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last} Thank you for using Anime Search!`;
                }
                break;

            case 'TV':
            case 'ONA':
            case 'OVA':
                if (query.status === 'RELEASING') {
                    return `${title} started airing on ${startDate.toLocaleDateString('en-US')}${studio}. ${next} ${score} ${tags} ${last}`;
                }

                else if (query.status === 'FINISHED') {
                    var endDate = new Date(query.endDate.year, query.endDate.month - 1, query.endDate.day);
                    return `${title} started airing on ${startDate.toLocaleDateString('en-US')}, finished airing on ${endDate.toLocaleDateString('en-US')} with a total of ${query.episodes} episode(s)${studio}. ${score} ${tags} ${last}`;
                }

                else if (query.status === 'NOT_YET_RELEASED') {
                    return `${date}${studio}. ${next} ${tags} ${last}`;
                }

                else if (query.status === 'CANCELLED') {
                    return `${title} is an Anime that has been cancelled. ${last}\n Thank you for using Anime Search!`;
                }
                break;

            case 'TV_SHORT':
            case 'SPECIAL':
                if (query.status === 'RELEASING') {
                    return `${title} started airing on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${next} ${score} ${tags} ${last}`;
                }

                else if (query.status === 'FINISHED') {
                    var endDate = new Date(query.endDate.year, query.endDate.month - 1, query.endDate.day);
                    return `${title} started airing on ${startDate.toLocaleDateString('en-US')}, finished airing on ${endDate.toLocaleDateString('en-US')} with a total of ${query.episodes} episode(s)${studio}. ${length} ${score} ${tags} ${last}`;
                }

                else if (query.status === 'NOT_YET_RELEASED') {
                    return `${date}${studio}. ${next} ${tags} ${last}`;
                }

                else if (query.status === 'CANCELLED') {
                    return `${title} is an Anime that has been cancelled. ${last}\n Thank you for using Anime Search!`;
                }
                break;

            case 'MUSIC':
                if (query.status === 'FINISHED') {
                    return `${title} is a music video that released on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
                }

                else if (query.status === 'RELEASING') {
                    return `${title} is a series of music videos that started releasing on ${startDate.toLocaleDateString('en-US')}${studio}. ${length} ${score} ${tags} ${last}`;
                }

                else if (query.status === 'CANCELLED') {
                    return `${title} is a music video that has been cancelled. ${last} Thank you for using Anime Search!`;
                }
                else return `${title} is a music video. ${tags} ${score} ${last}`;
                break;

            default: return `${title} is of the ${query.format.toLowerCase()} format. ${tags} ${last} Thank you for using Anime Search!`;
        }
    }
};