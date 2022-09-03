const { execSync } = require('child_process');
const { getPackageInfo } = require('./utils')
const fs = require('fs');
const path = require('path');
const readline = require('readline');

(async function () {

	try {
		
		// 過去にDLしたパッケージ名とそのバージョンを管理するjson
		// プログラム起動時存在しなければ作成する
		if (!fs.existsSync('./history.json')) {
			fs.writeFileSync('history.json', '{}', (err) => {
				if (err) { throw err; }
			});
		}
		let historyJson = JSON.parse(fs.readFileSync('./history.json', 'utf8'));

		// outputsフォルダがなければ作成
		if (!fs.existsSync('./outputs')) {
			fs.mkdir('outputs', (err) => {
				if (err) {throw err;}
			});
		}

		// コマンドライン引数からパッケージ名を取得する
		let packageNames = process.argv.slice(2, process.argv.length);
		if (packageNames.length <= 0) {
			console.log('パッケージ名を引数に指定してください。');
			return;
		} else {
			// 指定のパッケージ名が存在するかチェック
			for (let name of packageNames) {
				let versions = await getPackageInfo(name);
				if (versions === false) {
					process.stdout.write(`パッケージ名:${name}は存在しません\n`);
				} else {
					
					process.stdout.write(`パッケージ名:${name}に${versions.length}個のバージョンが見つかりました\n`);

					// バージョンごと処理
					for (let version of versions) {
						process.stdout.write(`\tversion ${version}:処理中`);
						// history.jsonになければ追加&処理
						let historyInfo = historyJson[name];
						if (historyInfo == undefined) {
							// パッケージ名が過去にDLした履歴がない
							execSync(`cd outputs && npm pack ${name}@${version}`);
							//履歴に追加
							historyJson[name] = {
								versions: [version]
							}
							process.stdout.write(`\n`);
						} else {
							// パッケージ名では過去にある
							// バージョンは?
							if (historyInfo.versions.includes(version)) {
								// ある
								readline.cursorTo(process.stdout, 0);
								process.stdout.write(`\tversion ${version}:DL済み\n`);
							} else {
								// ない
								execSync(`cd outputs && npm pack ${name}@${version}`);
								historyInfo.versions.push(version);
								process.stdout.write(`\n`);
							}
						}
						
					}
				}
			}
			fs.writeFileSync('./history.json', JSON.stringify(historyJson), (err) => {
				if (err) throw err;
			});
		}

	} catch (error) {
		console.log(error);
	}

})();