class Calculator {
	constructor() {
		console.log('%c Look at "calc" variable to play with this script ', 'background: red; color: #222; font-size: 32px;');

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

		[
			'time_slider',
			'time_display',
			'skull_win_team',
			'skull_win_opponent',
			'nb_player_team',
			'nb_player_opponent',
			'nb_troop_team',
			'nb_troop_opponent',
			'attacker',
			'ground',
			'tower_level',
			'team_tower',
			'opponent_tower',
			'team_power',
			'opponent_power'
		].forEach(k => {
			this[k + '_el'] = document.getElementById(k);
		});

		[
			'skull_win_team',
			'skull_win_opponent',
			'nb_player_team',
			'nb_player_opponent',
			'nb_troop_team',
			'nb_troop_opponent',
			'team_tower',
			'opponent_tower'
		].forEach(k => {
			this[k] = 0;
		});

		[
			'team_power',
			'opponent_power',
			'tower_level'
		].forEach(k => {
			this[k] = 1;
		});

		[
			'attack_team_troop_plus1',
			'attack_opponent_troop_plus1',
			'def_team_troop_plus1',
			'def_opponent_troop_plus1',
			'attack_team_hero_plus5',
			'attack_opponent_hero_plus5',
			'def_team_hero_plus5',
			'def_opponent_hero_plus5',
			'attack_team_hero_plus7',
			'attack_opponent_hero_plus7',
			'def_team_hero_plus7',
			'def_opponent_hero_plus7'
		].forEach(k => {
			this[k] = false;
			this[k + '_el'] = document.getElementById(k);
		});

		this.time_hour = 16;
		this.time_minute = 0;
		this.attacker = "team";
		this.ground = "0.8;1.2";

		this.const_timeRemainingData = [16, 10];
		this.const_timeModifierData = [4, 1];

		this.const_basedHeroesValue = 2000;
		this.const_basedAttackHeroesValue = 75;

		this.loadFromHash();
		this.bindInputs();
		this.syncTimeUI();
		this.render();
	}

	loadFromHash() {
		const that = this;

		document.location.hash.split('&').forEach(hash => {
			const hashSplited = hash.split('=');

			if (hashSplited.length !== 2)
				return;

			const key = hashSplited[0].replace('#', '');
			const rawValue = hashSplited[1];
			const element = document.getElementById(key);

			if (!element)
				return;

			if (key === 'time_slider') {
				const totalMinutes = parseInt(rawValue, 10);
				if (!isNaN(totalMinutes)) {
					that.setTimeFromMinutes(totalMinutes, false);
				}
				return;
			}

			if (element.type === 'checkbox') {
				const checked = rawValue === 'true' || rawValue === '1';
				that[key] = checked;
				element.checked = checked;
			} else {
				that[key] = (!isNaN(rawValue) && rawValue !== '') ? parseFloat(rawValue) : rawValue;
				element.value = rawValue;
			}
		});
	}

	bindInputs() {
		const $inputs = document.querySelectorAll('select, input');

		[...$inputs].forEach($input => {
			if ($input.id.indexOf('accordion') !== -1)
				return;

			if ($input.id === 'time_slider') {
				$input.addEventListener('input', e => {
					this.setTimeFromMinutes(parseInt(e.target.value, 10));
				});

				$input.addEventListener('change', e => {
					this.setTimeFromMinutes(parseInt(e.target.value, 10));
				});

				return;
			}

			if ($input.id === 'time_display') {
				$input.addEventListener('blur', () => {
					this.setTimeFromDisplay();
				});

				$input.addEventListener('keydown', e => {
					if (e.key === 'Enter') {
						this.setTimeFromDisplay();
						e.target.blur();
					}
				});

				return;
			}

			$input.addEventListener('change', e => {
				if (e.target.type === 'checkbox') {
					this[e.target.id] = e.target.checked;
				} else {
					this[e.target.id] = (!isNaN(e.target.value) && e.target.value !== '') ? parseFloat(e.target.value) : e.target.value;
				}

				this.render();
				this.updateHashValue(
					e.target.id,
					e.target.type === 'checkbox' ? String(e.target.checked) : this[e.target.id]
				);
			});
		});
	}

	formatTime(totalMinutes) {
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
	}

	getTotalMinutes() {
		return (this.time_hour * 60) + this.time_minute;
	}

	syncTimeUI() {
		const totalMinutes = this.getTotalMinutes();

		if (this.time_slider_el)
			this.time_slider_el.value = totalMinutes;

		if (this.time_display_el)
			this.time_display_el.value = this.formatTime(totalMinutes);
	}

	setTimeFromMinutes(totalMinutes, updateHash = true) {
		if (isNaN(totalMinutes))
			return;

		const min = this.time_slider_el ? parseInt(this.time_slider_el.min, 10) : 1;
		const max = this.time_slider_el ? parseInt(this.time_slider_el.max, 10) : 960;

		totalMinutes = Math.max(min, Math.min(max, totalMinutes));

		this.time_hour = Math.floor(totalMinutes / 60);
		this.time_minute = totalMinutes % 60;

		this.syncTimeUI();
		this.render();

		if (updateHash)
			this.updateHashValue('time_slider', totalMinutes);
	}

	setTimeFromDisplay() {
		if (!this.time_display_el)
			return;

		const value = this.time_display_el.value.trim();
		const parts = value.split(':');

		if (parts.length !== 2) {
			this.syncTimeUI();
			return;
		}

		let hours = parseInt(parts[0], 10);
		let minutes = parseInt(parts[1], 10);

		if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) {
			this.syncTimeUI();
			return;
		}

		hours += Math.floor(minutes / 60);
		minutes = minutes % 60;

		this.setTimeFromMinutes((hours * 60) + minutes);
	}

	updateHashValue(key, value) {
		const newHash = key + '=' + value;
		const replaceRegex = new RegExp(key + '=([^&])*', 'gi');

		if (document.location.hash.indexOf(key + '=') === -1) {
			document.location.hash += '&' + newHash;
		} else {
			document.location.hash = document.location.hash.replace(replaceRegex, newHash);
		}
	}

	getHeroBonus(prefix) {
		let total = 0;

		if (this[prefix + '_plus5']) total += 5;
		if (this[prefix + '_plus7']) total += 7;

		return total;
	}

	getTroopBonus(id) {
	return 1 + (this[id] ? 1 : 0);
}

	render() {
		var d2 = this.time_hour + (this.time_minute / 60);

		var e2Calc = regression('polynomial', [this.const_timeRemainingData, this.const_timeModifierData, [d2, null]], 1),
			e2 = (d2 >= 4) ? e2Calc.points[2][1] : 1;

		console.log('-------------- e2', e2);

		var groundAttacker = parseFloat(this.ground.split(';')[0]),
			groundDefender = parseFloat(this.ground.split(';')[1]);

		const attackTeamHeroBonus = this.getHeroBonus('attack_team_hero');
		const attackOpponentHeroBonus = this.getHeroBonus('attack_opponent_hero');
		const defTeamHeroBonus = this.getHeroBonus('def_team_hero');
		const defOpponentHeroBonus = this.getHeroBonus('def_opponent_hero');

		const attackTeamTroopBonus = this.getTroopBonus('attack_team_troop_plus1');
		const attackOpponentTroopBonus = this.getTroopBonus('attack_opponent_troop_plus1');
		const defTeamTroopBonus = this.getTroopBonus('def_team_troop_plus1');
		const defOpponentTroopBonus = this.getTroopBonus('def_opponent_troop_plus1');

		var attackdef_team = 0,
			attackdef_opponent = 0;

		if (this.attacker === "team") {
			attackdef_team = Math.round(
				(
					(this.nb_player_team * (this.const_basedAttackHeroesValue + attackTeamHeroBonus)) +
					(this.nb_troop_team * attackTeamTroopBonus)
				) * groundAttacker
			);

			attackdef_opponent = Math.round(
				(
					(this.nb_player_opponent * (this.const_basedAttackHeroesValue + defOpponentHeroBonus)) +
					(this.nb_troop_opponent * defOpponentTroopBonus)
				) * groundDefender * (this.tower_level * (1 + this.opponent_tower))
			);

		} else {
			attackdef_team = Math.round(
				(
					(this.nb_player_team * (this.const_basedAttackHeroesValue + defTeamHeroBonus)) +
					(this.nb_troop_team * defTeamTroopBonus)
				) * groundDefender * (this.tower_level * (1 + this.team_tower))
			);

			attackdef_opponent = Math.round(
				(
					(this.nb_player_opponent * (this.const_basedAttackHeroesValue + attackOpponentHeroBonus)) +
					(this.nb_troop_opponent * attackOpponentTroopBonus)
				) * groundAttacker
			);
		}

		this.attackdef_team.innerText = this.formatNumber(attackdef_team);
		this.attackdef_opponent.innerText = this.formatNumber(attackdef_opponent);

		var svBased = (this.nb_player_team + this.nb_player_opponent) * this.const_basedHeroesValue,
			svBasedTeam = svBased * attackdef_opponent / attackdef_team * e2,
			svBasedOpponent = svBased * attackdef_team / attackdef_opponent * e2;

		var skull_team = (this.attacker === "team")
			? Math.round(svBasedTeam - this.skull_win_team + this.skull_win_opponent)
			: Math.round(svBasedTeam + this.skull_win_opponent - this.skull_win_team);

		var skull_opponent = (this.attacker === "team")
			? Math.round(svBasedOpponent + this.skull_win_team - this.skull_win_opponent)
			: Math.round(svBasedOpponent - this.skull_win_opponent + this.skull_win_team);

		this.skull_team.innerText = this.formatNumber(skull_team);
		this.skull_opponent.innerText = this.formatNumber(skull_opponent);

		var power_team = Math.round((13 + 13 * attackdef_opponent / attackdef_team) * this.team_power),
			power_opponent = Math.round((13 + 13 * attackdef_team / attackdef_opponent) * this.opponent_power);

		this.power_team.innerText = this.formatNumber(power_team);
		this.power_opponent.innerText = this.formatNumber(power_opponent);
	}

	formatNumber(num) {
		if (!num || isNaN(num))
			return '0';

		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}
}

const calc = new Calculator();
