const sk = require('./entryPoint');
import scriptKnapperMain from './scriptKnapperMain/scriptKnapperMain';
import prepareTemplateString from './prepareTemplateString/prepareTemplateString';
import buildTemplateJSON from './buildTemplateJSON/buildTemplateJSON';

test("entryPoint is exporting the right function for scriptKnapperMain", () => {
	expect(sk.scriptKnapperMain.toString()).toEqual(scriptKnapperMain.toString());
});

test("entryPoint is exporting the right function for prepareTemplateString", () => {
	expect(sk.prepareTemplateString.toString()).toEqual(prepareTemplateString.toString());
});

test("entryPoint is exporting the right function for buildTemplateJSON", () => {
	expect(sk.buildTemplateJSON.toString()).toEqual(buildTemplateJSON.toString());
});