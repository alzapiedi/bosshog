const fs = require('fs');
const superagent = require('superagent');

const nbaUrl = 'https://www.bovada.lv/services/sports/event/v2/events/A/description/basketball/nba?marketFilterId=def&preMatchOnly=true&lang=en';
const json = [];

superagent.get(nbaUrl).then(response => {
  const events = response.body[0].events;
  events.forEach(event => {
    const result = mapBovadaEvent(event);
    json.push(result);
  });

  fs.writeFileSync('data', JSON.stringify(json));
});

function mapBovadaEvent(event) {
  const awayTeam = event.competitors.find(team => !team.home).name;
  const homeTeam = event.competitors.find(team => team.home).name;
  try {
    return {
      id: event.id,
      description: event.description,
      lastModified: new Date(event.lastModified),
      startTime: new Date(event.startTime),
      homeTeam,
      awayTeam,
      homeTeamOdds: {
        moneyLine: event.displayGroups[0].markets.find(market => market.description === 'Moneyline').outcomes.find(outcome => outcome.description === homeTeam).price.american,
        spread: {
          price: event.displayGroups[0].markets.find(market => market.description === 'Point Spread').outcomes.find(outcome => outcome.description === homeTeam).price.american,
          handicap: event.displayGroups[0].markets.find(market => market.description === 'Point Spread').outcomes.find(outcome => outcome.description === homeTeam).price.handicap
        }
      },
      awayTeamOdds: {
        moneyLine: event.displayGroups[0].markets.find(market => market.description === 'Moneyline').outcomes.find(outcome => outcome.description === awayTeam).price.american,
        spread: {
          price: event.displayGroups[0].markets.find(market => market.description === 'Point Spread').outcomes.find(outcome => outcome.description === awayTeam).price.american,
          handicap: event.displayGroups[0].markets.find(market => market.description === 'Point Spread').outcomes.find(outcome => outcome.description === awayTeam).price.handicap
        }
      }
    }
  } catch (e) {
    console.log(`An error occurred: ${e.message}`);
  }
}
