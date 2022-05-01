const bootstrap = require('./bootstrap');
const bootstrapNode = require('./bootstrap-node');
const { app, protocol, crashReporter } = require('electron');
const product = require('../product.json');

// Enable ASAR support
bootstrap.enableASARSupport();

// Enable portable support
const portable = bootstrapNode.configurePortable(product);

// Register custom schemes with privileges
protocol.registerSchemesAsPrivileged([
	{
		scheme: 'mote-webview',
		privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true, }
	},
	{
		scheme: 'mote-file',
		privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true }
	}
]);

// Load our code once ready
app.once('ready', function () {
    onReady();
});

async function onReady() {
    try {
        startup();
    } catch (error) {
		console.error(error);
	}
};

function startup() {
    // Load main in AMD
    require('./bootstrap-amd').load('mote/app/electron-main/main', () => {});
}