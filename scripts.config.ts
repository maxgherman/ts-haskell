import { DenonConfig } from "https://deno.land/x/denon@2.4.7/mod.ts";

const config: DenonConfig = {
  scripts: {
    test: {
      cmd: "deno test --allow-env --import-map=import-map.json",
      desc: "run tests",
    },
    lint: {
      cmd: "deno lint --unstable",
      desc: "lint sources",
    },
  },
};

export default config;
