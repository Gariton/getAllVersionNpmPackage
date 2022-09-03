const packageInfo = require('package-info');
const packageVersions = require('npm-package-versions');

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

module.exports = {
    getPackageInfo
}