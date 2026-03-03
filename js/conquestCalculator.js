class Calculator {
	constructor() {
		// Show console info message
		console.log('%c Look at "calc" variable to play with this script ', 'background: red; color: #222; font-size: 32px;');

		// Save DOM render output
		[
			'skull_team',
			'skull_opponent',
			'power_team',
			'power_opponent',
			'attackdef_team',
			'attackdef_opponent'
		].forEach(k => {
			this[k] = document.getElementById(k);
		});

		// Set default numeric value
		[
			'skull_win_team',
			'skull_win_opponent',
			'nb_player_team',
			'nb_player_opponent',
			'nb_troop_team',
			'nb_troop_opponent',
			'attack_team_hero',
			'attack_opponent_hero',
			'def_team_hero',
			'def_opponent_hero',
			'team_tower',
			'opponent_tower'
		].forEach(k => {
			this[k] = 0;
		});

		[
			'attack_team_troop',
			'attack_opponent_troop',
			'def_team_troop',
			'def_opponent_troop',
			'team_power',
			'opponent_power'
		].forEach(k => {
			this[k] = 1;
		});

		// Set others default
		this.time_hour = 23;
		this.time_minute = 0;
		this.attacker = "team";
		this.tower_level = 1;
		this.ground = "0.7;1.3";

		// CONST
		this.const_timeRemainingData = [24, 10];
		this.const_timeModifierData = [8, 1];

		this.const_basedHeroesValue = 2250;
		this.const_basedAttackHeroesValue = 75;

		// Set values based on hash
		const that = this;
		document.location.hash.split('&').forEach(hash => {
			const hashSplited = hash.split('=');
			if(hashSplited.length == 2) {
				that[hashSplited[0]] = (!isNaN(hashSplited[1])) ? parseFloat(hashSplited[1]) : hashSplited[1];
				document.getElementById(hashSplited[0]).value = hashSplited[1];
			}
		});

		this.render();
	}

	render() {
		// Time remaining (Hours)
		var d2 = this.time_hour + (this.time_minute / 60);

		// Time modifier
		var e2Calc = regression('polynomial', [this.const_timeRemainingData, this.const_timeModifierData, [d2, null]], 1),
				e2 = (d2 >= 8) ? e2Calc.points[2][1] : 1;

		console.log('-------------- e2', e2);

		// Terrain modifier
		var groundAttacker = parseFloat(this.ground.split(';')[0]),
				groundDefender = parseFloat(this.ground.split(';')[1]);

		// Rating
		var attackdef_team = 0,
				attackdef_opponent = 0;

		if(this.attacker == "team") {
			attackdef_team = Math.round(((this.nb_player_team * (this.const_basedAttackHeroesValue + this.attack_team_hero)) + (this.nb_troop_team * this.attack_team_troop)) * groundAttacker);

			attackdef_opponent = Math.round(((this.nb_player_opponent * (this.const_basedAttackHeroesValue + this.def_opponent_hero)) + (this.nb_troop_opponent * this.def_opponent_troop)) * groundDefender * ( this.tower_level * ( 1 + this.opponent_tower)));

		} else {
			attackdef_team = Math.round(((this.nb_player_team * (this.const_basedAttackHeroesValue + this.def_team_hero)) + (this.nb_troop_team * this.def_team_troop)) * groundDefender * ( this.tower_level * ( 1 + this.team_tower)));

			attackdef_opponent = Math.round(((this.nb_player_opponent * (this.const_basedAttackHeroesValue + this.attack_opponent_hero)) + (this.nb_troop_opponent * this.attack_opponent_troop)) * groundAttacker);
		}

		this.attackdef_team.innerText = this.formatNumber(attackdef_team);
		this.attackdef_opponent.innerText = this.formatNumber(attackdef_opponent);

		// SV
		var svBased = (this.nb_player_team + this.nb_player_opponent) * this.const_basedHeroesValue,
				svBasedTeam = svBased * attackdef_opponent / attackdef_team * e2,
				svBasedOpponent = svBased * attackdef_team / attackdef_opponent * e2;

		var skull_team = (this.attacker == "team") ? Math.round(svBasedTeam - this.skull_win_team + this.skull_win_opponent) : Math.round(svBasedTeam + this.skull_win_opponent - this.skull_win_team),
				skull_opponent = (this.attacker == "team") ? Math.round(svBasedOpponent + this.skull_win_team - this.skull_win_opponent) : Math.round(svBasedOpponent - this.skull_win_opponent + this.skull_win_team);

		this.skull_team.innerText = this.formatNumber(skull_team);
		this.skull_opponent.innerText = this.formatNumber(skull_opponent);

		// Energy cost
		var power_team = Math.round((16 + 16 * attackdef_opponent / attackdef_team) * this.team_power),
				power_opponent = Math.round((16 + 16 * attackdef_team / attackdef_opponent) * this.opponent_power);

		this.power_team.innerText = this.formatNumber(power_team);
		this.power_opponent.innerText  = this.formatNumber(power_opponent);
	}

	formatNumber(num) {
		if(!num || isNaN(num))
			return '0';

		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}
}

const calc = new Calculator();

// Add listeners
// Can use Proxy, but go simplier way
const $inputs = document.querySelectorAll('select, input');
[...$inputs].forEach($input => $input.addEventListener('change', e => {
	// Disable for accordion checkbox
	if(e.target.id.indexOf('accordion') !== -1)
		return;

	calc[e.target.id] = (!isNaN(e.target.value)) ? parseFloat(e.target.value) : e.target.value;
	calc.render();

	// Set hash to share link
	const newHash = e.target.id + '=' + calc[e.target.id];
	const replaceRegex = new RegExp(e.target.id + '=([a-z0-9;.])*', 'gi');
	if(document.location.hash.indexOf(e.target.id + '=') === -1)
		document.location.hash += '&' + newHash;
	else
		document.location.hash = document.location.hash.replace(replaceRegex, newHash)
}));
