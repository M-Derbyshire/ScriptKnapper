import replaceSubstrings from '../replaceSubstrings/replaceSubstrings';

/*
    Inputs:
        - text: The text that contains the substitutions to
                be replaced.
            
    Output:
        - This function will return a string, that will have
                any tag substitution strings replaced with
                the correct tags.
*/
function replaceTagStringSubstitutions(text)
{
    return replaceSubstrings(text, [
        { from: "@ohb:", to: "{:" },
        { from: "@chb:", to: ":}" },
        { from: "@odhb:", to: "{{:" },
        { from: "@cdhb:", to: ":}}" },
        { from: "@ohb+", to: "{+" },
        { from: "@chb+", to: "+}" },
    ]);
}

export default replaceTagStringSubstitutions;