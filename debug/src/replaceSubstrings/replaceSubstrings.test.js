import replaceSubstrings from './replaceSubstrings';

test("replaceSubstrings will replace the requested substrings with the given replacements", () => {
    
    const result = replaceSubstrings("The wig was big and full", [
        { from: "wig", to: "ball" },
        { from: "big", to: "small" },
        { from: "full", to: "flat" }
    ]);
    
    expect(result).toBe("The ball was small and flat");
    
});

test("replaceSubstrings will replace multiple matches of the requested substring", () => {
    
    const result = replaceSubstrings("The one one one", [
        { from: "one", to: "two" }
    ]);
    
    expect(result).toBe("The two two two");
    
});