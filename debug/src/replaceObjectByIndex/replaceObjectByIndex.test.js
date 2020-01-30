import replaceObjectByIndex from './replaceObjectByIndex';

const testText = "hello {name}, my name's Bob";
const testNewText = "world";
const testStartIndex = 4;
const testBraceIndex = 2;
const testObjectLength = 6

test("replaceObjectByIndex will replace an object between the indexes with the provided string", () => {
    
    const [resultText, startIndex] = replaceObjectByIndex(testText, testNewText, testStartIndex, testBraceIndex, testObjectLength);
    
    expect(resultText).toBe("hello world, my name's Bob");
});

test("replaceObjectByIndex will replace an object between the indexes with the provided string", () => {
    
    const [resultText, startIndex] = replaceObjectByIndex(testText, testNewText, testStartIndex, testBraceIndex, testObjectLength);
    
    expect(resultText.charAt(startIndex)).toBe(",");
});