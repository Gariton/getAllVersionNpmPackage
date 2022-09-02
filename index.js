const { execSync } = require('child_process');
const { version } = require('os');

let packageNames = process.argv.slice(2, process.argv.length); // package name array

if (packageNames.length <= 0) {
	console.log('パッケージ名を引数に指定してください。');
	return;
}

(async function () {

	execSync(`mkdir outputs`);
	for (let packageName of packageNames) {
		try {
			process.stdout.write(`パッケージ名:${packageName} の全バージョンを取得します...\n`);
			let getVersionExecStr = execSync(`npm info ${packageName} versions`);
			let versions = getVersionExecStr.toString().replace(/\n?\[?\]?\t?\s?\r?\'?/g, '').split(',');
			
			if (versions.length <= 0) {
				throw new Error('パッケージが見つかりません。');
			}

			process.stdout.write(`\t${versions.length}個のバージョンが見つかりました\n`);

			execSync(`mkdir outputs/${packageName}`);
			//バージョンごとのフォルダ作成
			await Promise.all(versions.map(async version => {
				let path = `outputs/${packageName}/${version}`;
				execSync(`mkdir ${path}`);
				execSync(`cd ${path} && npm init -y && npm install ${packageName}@${version}`);
				execSync(`zip -r ./outputs/${packageName}@${version}.zip ./outputs/${packageName}/${version}`);
			}));
			execSync(`rm -rf ./outputs/${packageName}`);
		} catch (error) {
			process.stdout.write(`\tエラー(${error.message})\n`);
			console.log(error);	
		}
	}
	execSync(`zip -r ./outputs.zip ./outputs && rm -rf ./outputs`);

})();