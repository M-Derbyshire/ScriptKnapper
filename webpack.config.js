
module.exports = {
	entry: {
		'./dist/scriptknapper': './src/entryPoint.js',
		'./webui/scriptknapper': './src/entryPoint.js'
	},
	output: {
		path: __dirname,
		filename: '[name].bundle.js',
		library: 'scriptknapper',
		library: {
			name: 'scriptknapper',
			type: 'umd',
		},
	},
};