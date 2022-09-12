const packageInfo = require('package-info');
const packageVersions = require('npm-package-versions');
const { execSync } = require('child_process');
const fs = require('fs').promises;

const getPackageInfo = async (packageName) => {
    try {
        await packageInfo(packageName);
        let versions = await packageVersionsSync(packageName);
        return versions;
    } catch (error) {
        return false;
    }
}

function packageVersionsSync (packageName) {
    return new Promise(async (res, rej) => {
        packageVersions(packageName, (err, v) => {
            if (err) {
                rej(err);
            } else {
                res(v);
            }
        })
    });
}

async function npmPack (package) {
    let versions = await getPackageInfo(package);
    if (!versions) {
        console.log(`${package}というパッケージが見つかりませんでした。`);
        return false;
    }

    // バージョンごと処理
    for (let version of versions) {
        try {
            let historyJson = JSON.parse(await fs.readFile('./history.json', 'utf8'));

            let historyInfo = historyJson[package];
            if (historyInfo == undefined) {
                // パッケージ名が過去にDLした履歴がない
                console.log(`${package}@${version}:処理中`);
                execSync(`cd outputs && npm pack ${package}@${version}`);
                //履歴に追加
                historyJson[package] = {
                    versions: [version]
                }
                await fs.writeFile('./history.json', JSON.stringify(historyJson));
                let deps = execSync(`npm info ${package} dependencies --json`);
                deps = JSON.parse(deps.toString());
                let depPackageNames = Object.keys(deps);
                
                for (let dep of depPackageNames) {
                    await npmPack(dep);
                }
            } else {
                // パッケージ名では過去にある
                // バージョンは?
                if (!historyInfo.versions.includes(version)) {
                    // ない
                    execSync(`cd outputs && npm pack ${package}@${version}`);
                    historyInfo.versions.push(version);
                    await fs.writeFile('./history.json', JSON.stringify(historyJson));
                    let deps = execSync(`npm info ${package} dependencies --json`);
                    deps = JSON.parse(deps.toString());
                    let depPackageNames = Object.keys(deps);
                    
                    for (let dep of depPackageNames) {
                        await npmPack(dep);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
        
    }
}

module.exports = {
    getPackageInfo,
    npmPack
}