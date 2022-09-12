const { npmPack } = require('./utils')
const fs = require('fs');

(async function () {

	try {
		
		// 過去にDLしたパッケージ名とそのバージョンを管理するjson
		// プログラム起動時存在しなければ作成する
		if (!fs.existsSync('./history.json')) {
			fs.writeFileSync('history.json', '{}', (err) => {
				if (err) { throw err; }
			});
		}

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
			for (let packageName of packageNames) {
				await npmPack(packageName);
			}
		}

	} catch (error) {
		console.log(error);
	}

})();