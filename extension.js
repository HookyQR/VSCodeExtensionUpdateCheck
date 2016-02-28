"use strict";
let vscode = require('vscode');
const https = require('https');
const zlib = require('zlib');
const path = require('path');

//this post stright from the marketplace (with the group filter removed)
let post = {
	filters: [{
		criteria: [{
			filterType: 8,
			value: "Microsoft.VisualStudio.Code"
		}]
	}],
	flags: 262
};
const request = {
	hostname: "marketplace.visualstudio.com",
	path: "/_apis/public/gallery/extensionquery",
	method: "POST",
	headers: {
		"Accept-encoding": "gzip",
		"Accept": "application/json;api-version=2.2-preview.1",
		"Content-Type": "application/json"
	}
};

/*
publisher:Object
	publisherId:"52bd646e-05dd-438c-9d2c-3dee92b32057"
	publisherName:"crisward"
	displayName:"crisward"
	flags:"none"
extensionId:"315bcbeb-4f7b-48eb-ab58-f8be776bed61"
extensionName:"riot-tag"
displayName:"Riot-Tag"
flags:"validated, public"
lastUpdated:"2016-02-26T18:33:35.437Z"
publishedDate:"2016-02-16T22:22:13.44Z"
shortDescription:"Riot Tag Syntax Highlighting for Riot.js HTML,JADE and Coffeescript"
*/
function activate(context) {
	//find the ones in the same location as this one.
	//let base = path.dirname(context.extensionPath);
	let base = "/Users/hooky/.vscode/extensions";
	let updatable = vscode.extensions.all.filter(ext => path.dirname(ext.extensionPath) === base);
	let hasVersions = ext => (ext.versions && ext.versions.length > 1);
	let embedLocal = ext => updatable.some(inst =>
		(ext.extensionName === inst.packageJSON.name && ext.publisher.displayName === inst.packageJSON.publisher &&
			(ext._installed = inst.packageJSON)));
	let checkOnDate = ext => !ext._installed.__metadata || ext._installed.__metadata.date < ext.versions[0].lastUpdated;
	let checkVersion = function(ext) {
		if (ext._installed.__metadata) return true; //was done on date
		if (!ext.versions[0].version) return;
		if (!ext._installed.version) return true; //there is a version number on the new one
		let a = ext._installed.version.split('.');
		let b = ext.versions[0].version.split('.');
		//or just use string version?
		if (a.some(v => isNaN(parseInt(v))) || b.some(v => isNaN(parseInt(v))))
			return ext.versions[0].version > ext._installed.version;
		let l = Math.min(a.length, b.length);
		for (let i = 0; i < l; i++) {
			if (parseInt(a[i]) > parseInt(b[i])) return false;
			if (parseInt(a[i]) < parseInt(b[i])) return true;
		}
		if (b.length > a.length) return true; //assume it's a ref of some kind
	};
	let setItemTipText = ext => "(" + ext._installed.version + " → " + ext.versions[0].version + ")\t" + ext.extensionName;

	let status = vscode.window.createStatusBarItem();
	status.text = "$(cloud-download) $(sync)";
	status.show();
	context.subscriptions
		.push(status);
	let statusFail = function(e) {
		console.log(e);
		status.text = "$(cloud-download) Fail";
		setTimeout(() => status.hide(), 15000);
	}
	let processFullList = function(data) {
		let hasUpdate = [];
		try {
			let jsonData = JSON.parse(data.toString());
			if (!jsonData.results || !jsonData.results.length || !jsonData.results[0].extensions) return;
			hasUpdate = jsonData.results[0].extensions.filter(hasVersions)
				.filter(embedLocal) //is one of our packages
				.filter(checkOnDate)
				.filter(checkVersion)
				.map(setItemTipText);
		} catch (e) {
			return statusFail(e);
		}
		if (!hasUpdate.length) {
			status.text = "$(cloud-download) $(check)";
			setTimeout(() => status.hide(), 15000);
			return;
		}
		status.text = "$(cloud-download) " + hasUpdate.length;
		status.tooltip = hasUpdate.join("\n");
		let cmd = vscode.commands.registerCommand("HookyQR.ExtensionUpdateCheck_close", () => {
			vscode.commands.executeCommand("workbench.extensions.action.listOutdatedExtensions");
			status.hide();
		});
		status.command = "HookyQR.ExtensionUpdateCheck_close";
		context.subscriptions.push(cmd);
	};

	let req = https.request(request, res => {
		const unzip = zlib.createGunzip();
		res.pipe(unzip);
		let data = [];
		unzip.on("data", d => data.push(d));
		unzip.on("end", () => {
			let finData = Buffer.concat(data);
			try {
				processFullList(finData);
			} catch (e) {
				return statusFail(e);
			}
		});
		res.on("error", statusFail);
		unzip.on("error", statusFail);
	});
	req.end(JSON.stringify(post));
	req.on("error", statusFail);

	return;
}
exports.activate = activate;
