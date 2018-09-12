import { patterns } from "./patchbook";

export default {
  start: [
    { regex: patterns.voice.pattern, sol: true, token: "keyword", dedent: true },
    { regex: patterns.comment.pattern, token: "comment" },
    {
      regex: /(>>|->|[a-z]>|\s{1}=\s{1})/,
      token: "builtin"
    },
    { regex: /\s*\|\s?/, token: "number" },
    { regex: patterns.multiLineParamModuleName.pattern, sol: false, token: "property" },
    { regex: /^\s*\*\s?(.+):(?=\s+\w)/, sol: false, token: ["property", null] }
  ]
};
